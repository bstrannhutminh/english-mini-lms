# Fixture scout — UI LMS 19/11/2026

Status: DONE

Đã tạo [fixture-catalog.json](browser-qa-261119-1600-artifacts/fixture-catalog.json): 6 bài nộp, 4 feedback hợp lệ về cấu trúc, 3 từ đến hạn + 1 từ đã thuộc. Scout chỉ đọc source và ghi 2 artifact được giao; không mở DB, env, network, server, không sửa source/test/config/git.

## Dùng catalog

1. Browser worker dùng learner QA hiện có (`qa-learner@example.test`), thay `$QA_LEARNER_ID` bằng `learners.id` của identity đăng nhập. Catalog không tạo `learners`/`auth.users`.
2. Chỉ dùng `TEST_DATABASE_URL` loopback đã xác nhận và backup. Kiểm tra W1/W2/R1/S1/L1 tồn tại, `review_state=approved`, toàn bộ ID catalog chưa tồn tại. Không tạo hoặc đổi curriculum/source/activity.
3. `timestampTokensMsFromApplyNow` là millisecond tương đối với `Date.now()` lúc áp dụng. `resolveTokensJavaScript` chuyển token thành UUID/ISO strings. `tables` dùng tên cột SQL snake_case; dùng parameter bindings cho text/JSONB, không ghép SQL raw.
4. INSERT theo `insertOrder`; ghi các ID đã tạo. Không upsert nội dung submission. Nếu collision, dừng để chọn bộ ID mới hoặc dùng backup đúng bản, không ghi đè bài cũ.
5. Chụp `queued` trong 110 giây sau cập nhật `updated_at` hoặc refresh đúng row QA ngay trước ảnh. `GET detail` tự sweep queued/processing quá 110s thành failed; đây là mutation thật ngay cả khi chỉ đọc trang.
6. Rollback theo `cleanupOrder`, gồm cả row phát sinh từ thao tác UI: phiên sửa bài mới, draft/event, review/usage, feedback/error flag/vocab vừa lưu. Browser worker sở hữu backup/apply/rollback.

## Trạng thái và URL

| Key | Activity | Submission UUID suffix | Kỳ vọng |
|---|---|---:|---|
| `w1_original` | W1 | 201 | Bản 1, 3 góp ý ưu tiên, scores `practice_estimate`, nút Sửa ngay |
| `w1_revision` | W1 | 202 | Bản 2 trỏ parent 201, tab So sánh Bản 1/2, feedback riêng |
| `r1_ready` | R1 | 203 | Body JSON mainIdea/translation/keyTerms; có hint trước nộp → assisted=true |
| `s1_text_only` | S1 | 204 | Text-only, media_id=null; pronunciation `not_assessable`, không điểm phát âm |
| `w2_queued` | W2 | 205 | Banner chờ chấm + polling; không feedback hoặc scores giả |
| `l1_failed` | L1 | 206 | Banner lỗi tổng hợp + nút Chấm lại ngay; không feedback |

Prefix UUID: `26111900-0000-4000-8000-000000000`; URL đầy đủ đã có trong `stateLinks`. Đây là ID deterministic để backup/cleanup; không phải identity thật.

Vocabulary suffix 501–504 lần lượt: `linear transducer` (0/5), `in-plane needle trajectory` (1/5), `fascial compartment` (2/5), `Ultrasound guidance` (4/5, đến hạn sau 29 ngày). Câu gốc lấy nguyên văn từ `content/english-lab/texts/r1-ultrasound-p42.md`; source_ref giữ R1/trang 42/seg-r1. Chỉ IPA fascial compartment dùng mẫu test có sẵn; IPA khác null để tránh đoán. Nghĩa và câu tự đặt là nội dung QA tổng hợp cho hiển thị, không phải từ điển đã thẩm định.

Vocab list `/vocab` kỳ vọng 4 từ, Đến hạn 3, Đã thuộc 1. `/vocab/flashcards` chế độ due có 3 thẻ; all có 4. `/vocab/review` có 3 micro-challenge được server tạo từ phrase/contextMeaning, không cần gọi Gemini để tải. Không submit micro-challenge hoặc bấm Chấm lại trong fixture-only pass vì sẽ gọi provider thật.

Quick flashcard POST dùng `{ mode: "quick", reviews: [{ vocab_id, result: "know" | "dont_know", clientReviewId }] }`. Đây là luồng thật không gọi AI; đổi mastery/due_at, INSERT vocabulary_reviews và usage_events. `clientReviewId` là UUID unique để replay không nhân lịch ôn; không trùng seed suffix 901. `know`: 0→1/3 ngày, 1→2/7 ngày, 2→3/14 ngày, 3→4/30 ngày. `dont_know`: mastery giảm 1 (sàn 0), ôn lại 1 ngày. PATCH my_attempt không cần provider nhưng phải rollback.

## Quan hệ và contract đã xác minh

- Schema DB: `src/db/schema.ts`; FK thực trong `src/db/migrations/0000_demonic_scarecrow.sql`. Chuỗi insert: sessions → submissions → assessments → feedback_versions → error_observations. Các row cùng learner_id. Parent submission khác session nhưng cùng W1; đây là pattern test thực của revision chain.
- `src/contracts/submission.ts`: observations bắt buộc location/original/issue/suggestion/example/retry_prompt; category tùy chọn. Score chỉ `{kind: "practice_estimate", dimension, value, note?}`. Writing feedback có observations/strengths/next_action/limitations/scores. Không có official IELTS band.
- Feedback DB dùng observations JSONB (retry_prompt snake_case), next_action cột SQL → Drizzle nextAction → detail serializes lại next_action. Pronunciation nằm trong rubric_snapshot.pronunciation; transcript của speaking không nằm trong feedback row.
- `src/server/learning/submission-list.ts` chọn assessment run_version cao nhất; `src/server/learning/assessment/get-submission-with-feedback.ts` chọn created_at mới nhất. Catalog chỉ có một assessment mỗi submission để cả hai nhất quán. Detail chỉ đọc feedback khi status=feedback_ready và theo assessment_id; mỗi feedback liên kết đúng submission. review_state=active mặc định; `optionalAlternatives.flaggedFeedback` chỉ dùng để test UI Under Review nếu được browser worker áp dụng.
- `src/server/learning/assessment/persist-evaluation.ts`: error_observations.source_feedback_id trỏ feedback.id, evidence là observation.original, category lấy observation.category. Catalog giữ pattern này; không tạo lỗi ở queued/failed. Progress hiện lấy mọi error_observations của learner, không join để lọc feedback active.
- `src/features/my-work/detail/use-revision-session.ts`: Sửa ngay tạo session mới cho cùng activity rồi mở `/learn/<sessionId>?parentId=<submissionId>`. Catalog giữ sessions completed để không gây 409 do fixture phiên đang mở. Nếu QA learner có phiên mở cũ, service trả 409 và UI tiếp tục session đó.
- `src/contracts/vocabulary.ts`: DB response camelCase; create/PATCH requests snake_case. `original_sentence` bắt buộc khi tạo thật. Mastery 0–4 hiển thị x/5; 4 là đã thuộc. `src/server/vocabulary/schedule.ts` là nguồn SRS 1/3/7/14/30.
- `src/server/vocabulary/capture.ts`, review.ts, quick-review.ts lọc due bằng due_at≤now trên mọi mastery; `src/features/vocab/mastery.ts`/vocab-list.tsx loại mastered khỏi số cần ôn UI. Catalog cho từ mastered due future để không bị khác count giữa hai định nghĩa.
- `src/server/progress/service.ts` tính đủ dữ liệu khi totalSubmissions≥3, kể cả queued/failed; activeSeconds là số phút thật mà source dùng để render, nhưng ở catalog là số tổng hợp. Không dùng trạng thái UI để kết luận đủ bằng chứng học.

## Baseline kỳ vọng trên learner QA sạch

6 sessions tuần này, 60 phút, 6 submissions: Writing 3/Reading 1/Speaking 1/Listening 1; independent 5, assisted 1; vocab tổng 4/mastered 1; một cặp revision; assessment ready 4/queued 1/failed 1. Lỗi nhóm: tone 1, grammar 1, structure 1, vocabulary 1. Sau thao tác UI số liệu có thể đổi; chỉ so baseline trước thao tác.

## Kiểm tra artifact

Đã parse JSON và kiểm 32 UUID unique, parent/FK nội bộ, 4 feedback đủ 6 key observation + limitations, scores chỉ practice_estimate, mastery 0–4, source sentence/ref đầy đủ, đúng 3 due + 1 mastered. Kiểm tra bằng Python cục bộ, chưa chạy Zod/unit/integration hoặc render browser tại scout. Browser worker chịu trách nhiệm minh chứng UI và rollback.

Mẫu nguồn faithful: `tests/integration/writing/flow.test.ts` (tone/grammar/score schema), `tests/integration/learning/revision-chain.test.ts` (parent cross-session cùng activity), `tests/integration/reading/reading-and-vocab.test.ts` (fascial compartment/IPA/vocab tuple). Body và feedback ở catalog đều gắn rõ fixture tổng hợp; không chứng minh Gemini, audio, tiến bộ thực hoặc nội dung IELTS chính thức.

## Câu hỏi chưa giải quyết

Không có quyết định sản phẩm cần hỏi. Chưa xác minh live: UUID learner QA, DB loopback, activity đã seed trên DB, backup/apply/rollback và hình render; các việc này thuộc browser worker.
