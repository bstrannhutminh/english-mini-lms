# Sửa lỗi M3 (quản lý nội dung + Drive sync + flashcard) — English Mini LMS

Anh Minh ơi, sau khi pull bản M3 (topics, admin content manager, Drive sync, My Work, flashcard) về thì có rà soát lại code (review 2 vòng: agent + Codex đối chiếu). Code viết sạch, đúng kiến trúc, nhưng có **4 nhóm lỗi cần sửa trước khi dùng thật** — đặc biệt nhóm Drive sync có thể ghi đè mất bài anh soạn tay, và luồng "viết Bản 2" hiện bị gãy (bài sửa không nối vào Bản 1).

Làm y hệt quy trình cũ: **mỗi phiên chat làm đúng 1 Vá**, dán prompt, đọc Implementation Plan rồi mới duyệt, xong tự kiểm theo mục "Xong khi". Làm theo thứ tự Vá 1 → 4 (theo mức độ rủi ro), Vá 5 là dọn dẹp có thể làm sau.

---

## Vá 1 — Bảo vệ bài admin soạn tay khỏi Drive sync (QUAN TRỌNG NHẤT)

**Vấn đề:** khi anh tạo bài/source/segment bằng tay trong `/admin/content`, code chưa ghi `origin='admin'` → database mặc định `'seed'` → luật chống ghi đè của Drive sync (chỉ báo xung đột khi `origin='admin'`) không bảo vệ được → lần sync tới có thể ghi đè mất bài anh soạn nếu trùng id trong manifest Drive. Đúng nghịch lý: tính năng bảo vệ đã viết xong nhưng chưa bao giờ được kích hoạt.

**Prompt dán vào Antigravity:**

```
Sửa lỗi origin='admin' không được ghi cho nội dung tạo tay — đúng các chỗ sau:

1. src/server/admin/content-service.ts (createContentActivity ~71-84,
   updateContentActivity ~130-133) và
   src/server/admin/content-sources-service.ts (createContentSource ~35,
   updateContentSource ~47, createContentSegment ~69,
   updateContentSegment ~81): thêm origin="admin" vào CẢ insert lẫn
   update/set. Hiện không set → DB default 'seed'
   (src/db/schema.ts:118,139,166) → drive-sync.ts:417,476,580 không báo
   conflict khi trùng id → ghi đè mất. Riêng UPDATE: admin sửa bài
   origin='seed'/'drive' phải chuyển origin thành 'admin' ngay khi lưu —
   nếu không chỉnh sửa tay của anh sẽ bị sync sau đó ghi đè lại.

2. Backfill dữ liệu cũ: schema hiện KHÔNG có cột nào phân biệt "tạo qua
   admin" vs "seed" → KHÔNG đoán bừa. Bước 1 của Implementation Plan phải
   là câu SELECT liệt kê tất cả id có origin='seed' trong
   activities/sources/segments, đưa danh sách vào plan để tôi đánh dấu id
   nào là soạn tay; bước 2 mới viết migration UPDATE origin='admin' đúng
   danh sách đó (drizzle-kit generate, KHÔNG sửa file migration cũ).
   Nếu chưa có bài admin nào thật thì bỏ qua backfill.

3. Mở rộng cùng luật bảo vệ sang seed: scripts/seed.ts upsert theo id —
   thêm check nếu hàng hiện có origin='admin' thì bỏ qua + log cảnh báo
   (id trùng bài admin soạn tay), giống luật drive-sync.

4. Test vitest:
   - createContentActivity/Source/Segment → row có origin='admin'.
   - Drive manifest trùng id với bài origin='admin' → xuất hiện trong
     conflicts[], KHÔNG ghi đè (đã có test nhưng đang set origin thủ công —
     sửa test gọi qua hàm create thật).
   - updateContent* trên hàng origin='seed'/'drive' → sau lưu, row có
     origin='admin'; sync tiếp theo báo conflict thay vì ghi đè.
   - seed.ts gặp id trùng origin='admin' → skip + log.

Lập Implementation Plan trước, chờ tôi duyệt. Sau sửa chạy npm run typecheck + lint + test.
```

**Xong khi:** tạo 1 bài mới trong `/admin/content` → vào Supabase Table Editor xem cột `origin` = `admin`; tạo file manifest trên Drive có cùng id → bấm "Xem thử" sync → id đó nằm trong danh sách xung đột, nội dung bài admin vẫn nguyên.

---

## Vá 2 — Sửa luồng "viết Bản 2" (revision chain)

**Vấn đề:** Hôm nay gợi ý "Viết Bản 2" đúng bài, nhưng khi bấm bắt đầu thì `parentId` bị rơi mất trên đường đi → bài sửa được lưu thành "Bản 1" mới (`revision=1`, `parent_id=null`) → không có so sánh Bản 1/Bản 2, không hiện feedback Bản 1 để viết lại, và gợi ý cứ lặp mãi. Ngoài ra flow reading/listening cũng không truyền parent, và gợi ý chưa kiểm tra bài Bản 1 đã có nhận xét AI chưa.

**Prompt:**

```
Sửa chuỗi revision (Bản 1 → Bản 2) bị đứt ở nhiều điểm — đúng các chỗ sau:

1. Đường truyền parentId từ gợi ý tới lúc nộp bài — CHỐT cách truyền qua
   URL (learn/[sessionId]/page.tsx:23 đã đọc sẵn searchParams.parentId và
   page.tsx:74-127 đã truyền prop parentId+parentData cho view, ít sửa
   nhất):
   - src/app/(main)/today/today-view.tsx (~113-136): handleStartSession
     khi actionType="start_revision" push
     /learn/${json.sessionId}?parentId=${selectedActivity.parentId}
     (src/server/today/pick-activity.ts:180-181 đã trả sẵn parentId).
   - BẮT BUỘC cả 4 mode: writing đã nối (WritingSessionView nhận
     parentId); speaking/reading/listening — learn/[sessionId]/page.tsx
     truyền parentId prop xuống view tương ứng (hiện nhánh
     reading/listening page.tsx:35-70 không truyền), view gửi parentId
     trong body POST submissions: listening-session-view.tsx:168-173 hiện
     chỉ POST { body }, reading-session-view.tsx:267-272 tương tự.
   - API submissions nhận parentId → đưa xuống
     src/server/learning/assessment.service.ts:105-127 tính
     revision=parent.revision+1.

2. Validate parent trước khi tạo revision
   (src/server/learning/assessment.service.ts:107-112
   hiện chỉ check tồn tại + learnerId): parent phải cùng learner, không
   deletedAt, cùng activity (hoặc quy tắc anh chốt), trả 422/409 nếu sai.
   assessment.service.ts:679-683 getSubmissionWithFeedback đọc parent chỉ
   theo id → lọc THÊM learnerId VÀ isNull(deletedAt): bảo vệ cả dữ liệu đã
   liên kết sai từ trước bản vá, và không hiện bản gốc đã xoá mềm trong
   tab So sánh.

3. src/server/today/pick-activity.ts:73-93 — gợi ý start_revision chỉ chọn
   submission đã có assessment status='feedback_ready' (enum thật trong
   schema.ts:46-52;
   KHÔNG dùng 'ready'), vì nhãn gợi ý khẳng định "đã có nhận xét AI".
   Cần join/lookup assessments — hiện query chưa join.

4. Test vitest BẮT BUỘC (không để tùy chọn):
   - start_revision: submission có assessment feedback_ready → gợi ý;
     queued/processing/failed/không có assessment → KHÔNG gợi ý.
   - Chuỗi đầy đủ: submit với parentId (đủ 4 mode nếu mock được, tối
     thiểu service-level) → submission mới revision=2, parent_id đúng.
   - parent sai learner / đã deletedAt / khác activity → bị từ chối.
   - getSubmissionWithFeedback: parent đã deletedAt hoặc khác learner →
     không trả parentData.

Lập Implementation Plan trước, chờ tôi duyệt.
```

**Xong khi (kiểm tay):** nộp 1 bài writing → chờ chấm xong → hôm sau /today gợi ý "Viết Bản 2" → bấm vào → màn hình sửa hiện Bản 1 + nhận xét AI bên cạnh → nộp → vào /my-work thấy bài mới gắn nhãn "Bản 2" và tab So sánh so được 2 bản; làm thêm 1 bài reading/listening revision cũng phải nối Bản 2 đúng.

---

## Vá 3 — Drive sync: không ghi nửa chừng + nạp câu hỏi nghe + chặn phụ thuộc lỗi

**Vấn đề (3 lỗi cùng cụm):**
- **Câu hỏi nghe không được đồng bộ:** manifest Drive khai `questions_file` nhưng sync chỉ lưu đường dẫn, không tải/validate file → bài nghe sync từ Drive vào học sẽ **rỗng câu hỏi** (runtime đọc filesystem của server, không có file Drive).
- **Ghi nửa chừng:** sources upsert vào DB trước khi tải file segments/activities; lỗi mạng/quota Drive giữa chừng → DB đã ghi sources còn con cháu thì lỗi. Spec NC3 §6 bắt buộc "lỗi quota/network → báo riêng, ngừng sync, không ghi nửa chừng". Lỗi download còn bị nuốt thành `null` nên lỗi mạng bị báo nhầm là "thiếu file".
- **Phụ thuộc không chặn:** segment tải lỗi bị bỏ qua nhưng activity vẫn ghi nguyên `segmentIds` → activity approved trỏ tới segment không tồn tại.

**Prompt:**

```
Sửa tính toàn vẹn của Drive sync (src/server/admin/drive-sync.ts +
src/server/providers/google-drive.ts) — đúng các chỗ sau:

1. Nạp questions file thật: drive-sync.ts ~636-655 đang chỉ lưu questionsFile
   path mà không tải nội dung. Runtime src/server/learning/listening-questions.ts
   ĐÃ ưu tiên đọc cột activities.questions trong DB (file yaml chỉ là
   fallback) → KHÔNG cần đổi runtime. Sửa sync: tải file questions từ Drive
   (cùng cơ chế tải texts/transcripts), validate theo schema
   src/lib/listening-questions.ts, parse và GHI vào cột activities.questions.
   Nếu cột questions là jsonb mảng thì ghi nguyên mảng; manifest thiếu
   questions_file trên bài listening → báo lỗi, không suy diễn.

2. Hai pha ghi: pha 1 tải + parse + validate TOÀN BỘ file tham chiếu trong
   manifest; pha 2 mới ghi DB. Lỗi quota/network Drive (phân biệt với lỗi
   "file không tồn tại") → ngừng hẳn trước pha 2, báo lỗi riêng, không ghi
   gì — theo spec NC3 §6. Lỗi 1 file YAML/format riêng lẻ vẫn chỉ báo file đó.
   - providers/google-drive.ts:92-99 đang nuốt mọi lỗi download thành null
     → ném lỗi có phân loại (not_found vs network/quota) để sync quyết định.

3. Chặn phụ thừa + conflict closure THEO QUAN HỆ DB: segment/source của 1
   activity bị lỗi hoặc xung đột → activity đó không ghi, kèm cảnh báo trong
   errors[], không để segmentIds trỏ tới bản ghi không tồn tại. QUAN TRỌNG:
   sources/segments ghi TRƯỚC activity (drive-sync.ts ~415-422, 472-479,
   577-584). Không đủ nếu chỉ skip id trùng trong manifest — phải tính
   closure: source/segment mà manifest muốn ghi NHƯNG đang được 1 activity
   origin='admin' tham chiếu (theo segmentIds trong DB, drive-sync.ts
   ~393-400 đã có sẵn cơ chế neededSegmentIds/neededSourceIds để mở rộng)
   → cũng báo conflict, KHÔNG ghi đè, kể cả khi bài admin không nằm trong
   manifest. Chốt: pre-pass quét manifest + join DB tính tập id cấm ghi,
   rồi mới tới pha ghi.
   Test thêm: manifest sửa source S mà bài admin đang dùng (bài admin KHÔNG
   nằm trong manifest) → S vào conflicts[], không ghi đè.

4. Thống kê skipped: drive-sync.ts ~280-284 khởi tạo skipped rỗng và không
   bao giờ push — populate số bản ghi bỏ qua (draft/rejected trong manifest,
   hàng không đổi) để UI drive-sync.tsx:196-202 hiện được, đúng spec
   "log số bản ghi thêm/sửa/bỏ qua".

5. Test vitest: manifest khai questions_file hợp lệ → sau sync, questions
   nằm trong DB; mock Drive trả lỗi network giữa chừng → không có gì ghi
   vào DB; activity trỏ segment lỗi → activity báo error, không ghi.

Lập Implementation Plan trước, chờ tôi duyệt.
```

**Xong khi (kiểm tay):** trên Drive sửa 1 bài nghe có `questions_file` → sync → vào `/library` làm bài nghe đó thấy đủ câu hỏi; tắt mạng giữa lúc sync (hoặc sai quota) → kết quả báo "lỗi mạng Drive, đã dừng" và DB không đổi; bài admin soạn tay trùng id vẫn chỉ báo xung đột.

---

## Vá 4 — Flashcard: báo lưu thật + không ghi lặp

**Vấn đề:** ôn xong 1 nhóm thẻ mà lưu kết quả thất bại thì màn hình tổng kết vẫn nói "Kết quả đã được cập nhật vào thuật toán" — anh tưởng đã lưu nhưng thực ra mất. Thêm nữa: API ghi batch không transaction/idempotency → lỗi giữa chừng ghi một phần, bấm lại có thể tăng mastery 2 lần; phím tắt không chặn khi thẻ đang animate nên quẹt nhanh ở thẻ cuối có thể gửi trùng.

**Prompt:**

```
Sửa flashcard lưu kết quả cho đúng thật (src/app/(main)/vocab/flashcards/
flashcards-view.tsx, src/app/api/v1/vocabulary/review/route.ts,
src/server/vocabulary/service.ts) — đúng các chỗ sau:

1. Trạng thái lưu thật: flashcards-view.tsx:162-166 catch lỗi vẫn
   setIsFinished(true) → màn tổng kết dòng ~365-376 luôn báo "đã cập nhật".
   Đổi: thêm state saveStatus (saving/saved/failed); lưu thất bại → màn
   hình riêng "Lưu kết quả thất bại" + nút Thử lại (gửi lại đúng batch đó);
   trước khi lưu xong vẫn bật cảnh báo rời trang (dòng ~117 hiện tắt theo
   isFinished).

2. Batch nhất quán + idempotent (chốt thiết kế, không để dev tự chọn):
   - Client sinh clientReviewId (uuid) MỖI review và GIỮ NGUYÊN qua mọi
     lần retry (nút "Thử lại" gửi lại đúng payload cũ, không random lại);
     gửi kèm payload.
   - Migration: thêm cột client_review_id (unique) vào vocabulary_reviews.
   - Service (vocabulary/service.ts:514-560): bọc TOÀN BỘ ghi của batch
     (vocabulary_reviews + cập nhật vocabulary_vault + usage_events)
     trong 1 transaction. Với mỗi item: insert review bằng
     onConflictDoNothing (trên client_review_id) — CHỈ khi insert thành
     công mới cập nhật mastery/dueAt; insert bị conflict = review đã ghi
     trước đó → bỏ qua, KHÔNG báo lỗi (retry trả thành công idempotent,
     không phải lỗi unique). KHÔNG dùng check-tồn-tại-rồi-insert vì
     race khi 2 request cùng UUID chạy đồng thời.
   - review/route.ts:24-29: zod .max(200) cho mảng reviews + validate uuid.
   - Test: 2 request cùng clientReviewId chạy đồng thời → chỉ 1 review
     được ghi, mastery tăng đúng 1 lần, cả 2 request đều trả thành công.

3. Chặn input khi animate: flashcards-view.tsx ~176,191-203,325-337 — phím
   tắt/nút/quẹt phải bỏ qua khi thẻ đang bay hoặc đang submit batch.

4. Test vitest: batch 5 review lỗi ở item 3 → không ghi gì; gửi lại cùng
   batch → mastery không tăng lần 2; >200 items → 422.

Lập Implementation Plan trước, chờ tôi duyệt.
```

**Xong khi (kiểm tay):** ôn flashcard xong tắt mạng trước khi lưu → màn hình báo lưu thất bại, nút Thử lại; bật mạng bấm Thử lại → lưu được, mở /vocab xem mastery chỉ tăng đúng 1 lần.

---

## Vá 5 — Dọn dẹp nhỏ (làm sau, gộp 1 phiên)

**Prompt:**

```
Dọn các lỗi nhỏ còn lại từ review M3:

1. src/server/today/pick-activity.ts:189-202 — gợi ý fallback chọn bài
   khác mode nhưng nhãn
   vẫn nói "kỹ năng ít luyện nhất" của mode cũ → sinh lý do từ chosenAct.mode.
   skillCounts:110-120 chỉ đếm 4 mode thường — chốt rule: mode ielts-*
   normalize về kỹ năng gốc (ielts-writing → writing, ...) rồi đếm chung.
2. PATCH /api/v1/submissions/[id]: thêm filter isNull(deletedAt) CẢ chỗ
   select (~36-44) lẫn chỗ update (~55-61, hiện chỉ lọc theo id);
   src/server/learning/assessment.service.ts ~594-599 cùng lọc bài đã
   xoá mềm khỏi /my-work/[id].
3. providers/google-drive.ts:113 — escape nháy đơn trong fileName khi ghép
   Drive query; listFolderContents (~76-81) xử lý nextPageToken.
4. admin-guard.ts:36-37 — response 500 không nhúng raw exception message,
   log server-side thay thế.
5. drive-sync.ts:184-186 — bỏ dynamic import("../providers/google-drive")
   thừa (đã import top-level; còn né vitest mock).
6. package.json — pin googleapis (bỏ ^) theo luật dự án.
7. drive-sync.tsx:117 — link "docs/google-drive-setup.md" đang trỏ
   https://github.com placeholder → trỏ file docs thật.
8. GET /api/v1/submissions (~53-70): submission không có assessment row →
   hiện map thành "processing" (Đang chấm vĩnh viễn). Chốt contract: trả
   "not_assessed" (hoặc enum có sẵn phù hợp — KHÔNG dùng "ready" vì schema
   chỉ có queued/processing/needs_input/feedback_ready/failed) + UI
   my-work hiện "Chưa chấm".

Lập Implementation Plan trước, chờ tôi duyệt.
```
