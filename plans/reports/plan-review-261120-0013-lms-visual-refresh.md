# Review kế hoạch làm mới UI/UX LMS

Ngày: 20/11/2026. Đọc `plan.md` và cả5 phase; đối chiếu source hiện tại, QA19/11, package/config test. Phạm vi chỉ review, không sửa app hoặc plan. Dùng skill `ak-plan`; không hỏi user thay controller và không ghi thêm tài liệu ngoài report được giao.

## Kết luận

Kế hoạch khả thi, phủ đủ các màn hiện có và các FAIL QA quan trọng; giữ stack, plugin, route/service boundaries và invariant. Phân biệt đúng bản mẫu để duyệt với sản phẩm chưa triển khai; gate “chờ duyệt trước sửa” rõ. Controller đã thông báo chỉnh owner/path phase1/4 và runner/gate test phase5 theo review; không cần chạy lại review toàn plan. Links artifact còn chờ kiểm tồn tại cuối cùng trước trình người dùng.

Sau thông báo controller: bốn mục owner primitive, owner delete backend, DOM runner và integration gate bên dưới được coi là đã tiếp nhận/điều chỉnh. Bảng giữ bằng chứng review ban đầu; không suy ra implementation đã thực hiện.

## Điều chỉnh cần thiết

| Mục | Bằng chứng | Chỉnh cụ thể |
|---|---|---|
| Owner primitive chưa đúng | Phase1 liệt kê `ui/input.tsx`, `textarea.tsx`, `select.tsx` nhưng `src/components/ui/` hiện không có3 file này; field đang nằm native tại feature. `tour-steps` là `.ts`, không phải `.tsx`. | Liệt kê primitive thực có, `src/components/tour-steps.ts`, `guided-tour.tsx`, `tour-host.tsx`/`tour-tooltip.tsx` nếu cần. Nếu tạo field primitives mới, ghi rõ Create và chỉ tạo khi nhiều caller thật cần, giữ HTML props tương thích. |
| Owner delete backend thiếu | Copy deletion ở `src/features/settings/submissions-card.tsx`; xử lý xóa nằm `src/server/learning/submission-mutations.ts`, không phải server/settings. Phase4 chỉ sở hữu UI/settings contract. | Với scope chỉ copy, ghi đọc backend thật và sửa lời xác nhận theo soft-delete/Storage best-effort; không nhận sửa policy/storage route. Nếu bắt buộc đổi trạng thái trả API, khai owner/server/contract riêng cùng approval đã chốt cho scope đó. |
| DOM runner chưa cụ thể | `vitest.unit.config.ts` dùng environment node và chỉ `tests/unit/**/*.test.ts`; package không có jsdom/testing-library/Playwright. | Ghi browser automation/intercepts là nơi đo DOM/focus/computed styles; unit giữ pure logic/schema. Không âm thầm thêm dependency để chạy DOM unit. Test files/browser receipt cần reproducible case và expected outcome, không chỉ ảnh. |
| Integration gate cần ghi rõ | `scripts/run-integration-tests.mjs` thiếu TEST_DATABASE_URL sẽ exit0 với thông báo KHÔNG chạy. | Chỉ chạy DB dành riêng qua TEST_DATABASE_URL; thiếu biến → NOT RUN/unresolved, không PASS. Hint accepted→assisted phải đo invariant thật bằng integration/harness DBtạm; hint503→noreveal và retry bằng browser/HTTP. |
| Links bản mẫu/baseline đang chưa có | Tại thời điểm review, `design-proposal.html` và `plans/reports/visual-261120-0013-lms-refresh.md` chưa tồn tại; plan đã ghi đang chuẩn bị. | Không phải lỗi implementation vì artifact đang làm. Trước handoff, kiểm file thật, các link/capture đúng viewport; nếu chưa có, giữ nhãn pending và không nói đã review mẫu. |
| Acceptance persistence hơi rộng | Plan nói bộ lọc/tab giữ reload/back “trong phạm vi UI có thể lưu”; phase2 chỉ ghi Library query/topic/skill/status vào URL. | Định nghĩa rõ persistence Library; tab nào khác được lưu thì ghi owning phase và test, còn không hãy giữ acceptance đúng4 Library params. Bảo toàn `?topic=` cũ, validate unknown params và kiểm selected IELTS không bị ẩn khi đổi scope. |

Đính chính scout trước của reviewer: owner `src/server/settings/submission-mutations.ts` đã ghi nhầm; đường dẫn đúng là `src/server/learning/submission-mutations.ts`. Không sửa báo cáo cũ trong lượt chỉ được phép tạo report này.

## Contract và giới hạn nên giữ khi triển khai

- Hint W2 có thể xử lý ngay trong `writing-hint.tsx` nhận SessionData; `SessionData.activity` đã có mode/promptText/feedbackGuide. Không cần schema DB hoặc endpoint hint mới; không gửi đáp án/rubric bí mật để tiện UI, không tạo curriculum mới.
- Capture provenance cần đi từ panel→CaptureHelpers→selection→popup; `src/contracts/vocabulary.ts` đã nhận `source_type` string. Nếu bổ sung metadata vào internal capture interface, dùng additive optional/default tương thích, cập nhật đủ Writing/Reading/Listening/MyWork callers; không đổi tuple/API envelope.
- Collision Admin đã có chứng cứ source + helper probe, live impact chưa xác nhận. Reproduce bằng intercepted409 rồi xử lý bounded: tạo mới không PATCH đối tượng có từ trước; retry chỉ reuse IDs đã biết thuộc attempt đang tạo. Không mở rộng sang versioned-content engine/migration hay đổi quyền curator.
- Lỗi Settings activityId là parse contract thật: đổi từ UUID sang text nonempty phản ánh DB/curriculum, không đổi learner/submission/media UUID. Kiểm payload có submissions, không chỉ empty profile.
- Đồng bộ tokens phải đi qua native inline controls và feature colors, không chỉ `Button`; thang màu/semantic role cần giữ bốn skill và trạng thái assisted/error. Không sửa learning thresholds/mastery, timer semantics, storage TTL hoặc provider.

## Kiểm tra nghiệm thu

Ma trận hiện có tốt: empty/populated/error,4skill/IELTS mapping, nháp/revision/transcript lock, flashcard pending/batch, modal/menu/tab keyboard, Settings/Admin và mobile reflow. Nên bổ sung case cụ thể:

- Hint503 giữ khóa; retryaccepted mở; lần nộp tiếp theo assisted đúng; Listening503 vẫn giữ khóa như behavior đã QA PASS.
- Flashcard đổi mode **và chuyển route Next nội bộ**: save/discard/cancel rõ; save lỗi giữ batch; dialog mở thì Arrow/Space không mutate nền. Review delayedPOST: payload bất biến, input khóa, lỗi cho thử lại.
- Modal active timer: Tab/Shift+Tab vòng đủ, chờ tick timer không cướp focus, cancel/Escape trả trigger; tab/menu roving focus có Home/End và Arrow; accordion Vocab dùng keyboard được.
- Library topicwithoutIELTS khi selectedIELTS, suggestion theo filter và query tên chủ đề theo lời hứa; Back/Reload khôi phục filter URL và legacytopic.
- Render screenshot320/375/768/1440 với nội dung dài, keyboard/visual viewport và safe-area; không coi CSS zoom2 là browser zoom200%. Đo CTA/overlay collision và computed styles trên controls thật.
- Auth/provider/physicalphone/Safari/RLS/Storage/production phải có trạng thái riêng. Fixture không thay receipt những gate này. Existing unit/build receipts chỉ hợp lệ tới source revision của receipt; sau đổi nguồn chạy narrow tests rồi broad checks như phase5.

Không phát hiện overreach lớn: mở rộng URL state, save/discard/cancel và source safety đều phục vụ UX hiện có, không cần thêm tính năng v2. Copy notification chỉ phản ánh năng lực đã xác minh, không tạo delivery subsystem mới.

Status: DONE_WITH_CONCERNS
Summary: Kế hoạch đủ phạm vi và khả thi; controller đã điều chỉnh owner/path và runner/gate test. Câu persistence nên ghi rõ Library để nghiệm thu nhất quán.
Concerns/Blockers: Artifact mẫu/baseline còn chờ kiểm tồn tại trước user handoff; tất cả src edits vẫn chờ người dùng duyệt Implementation Plan. Không có quyết định sản phẩm mới buộc hỏi thêm trong lượt review này.
