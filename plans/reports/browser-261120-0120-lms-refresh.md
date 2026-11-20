# Browser QA và critique — LMS visual refresh, 20/11/2026

Trạng thái: **DONE_WITH_CONCERNS. Browser checks trọng yếu đạt, critique cuối21/24; chưa có human visual acceptance hoặc provider/production proof.** Đã chốt first-run skip45, ảnh polish và cleanup browser.

## Môi trường và ranh giới

- Preview cô lập `http://127.0.0.1:3000`, Chrome headless158/CDP, PostgreSQL mẫu54329; `DEV_BYPASS_AUTH`. Không dùng credential, Supabase Auth/RLS/Storage hoặc Gemini thật. Controller quản lý server/DB và backup `local-preview-261119-2241-artifacts/before-refresh-qa.sql`.
- 16 activity approved; hồ sơ Bản xem thử, 6 submissions và feedback/vocab fixture có ghi nhãn. Mutation qua UI/API mẫu: quick reviews, session nghe mới, ledger hint/reveal, nháp, onboarding45. Không sửa nguồn học, source ứng dụng, migration, Git; không chấm/nộp bài để gọi provider.
- Chrome QA riêng PID3645 đã đóng, profile tạm đã xóa, không còn browser/render-check do QA sở hữu. [Cleanup receipt](browser-261120-0120-lms-refresh-artifacts/cleanup.json). Server/DB controller vẫn được giữ nguyên. Scripts/114 ảnh trực tiếp/receipt trong [artifacts](browser-261120-0120-lms-refresh-artifacts/); [catalog](browser-261120-0120-lms-refresh-artifacts/screenshot-catalog.json) ghi kích thước thật, gồm hai ảnh cũ có prefix sai và không dùng làm bằng chứng viewport.

## Phạm vi đã đi qua

| Nhóm | Bằng chứng browser |
|---|---|
| Hôm nay | Loaded375/768/1440; CTA trước bottomnav ở375, chọn30/45 và đường mở bài; loading được chụp riêng. |
| Thư viện | Loaded375/768/1440 +320; q/topic/skill/status từ native controls; reload và browserBack; IELTS0 đúng scope và empty state; chi tiết L1, bắt đầu phiên nghe. |
| Bốn kỹ năng | W1/R1/S1/L1 ở375/768/1440 +320; đề/editor/audio-player và footer; W1 hint, R1 native selection/capture, L1 transcript lock/reveal; speaking text-only feedback. |
| Bài của tôi | Danh sách6 bài, feedback original/issue/suggestion/example/retry_prompt/limitations, Bản2 và comparison375/768/1440. |
| Sổ từ | Populated list, flashcard, finish/error, mode/route guard, reload/undo, micro-challenge pending và lỗi503, capture/YouGlish nested dialogs. |
| Hỗ trợ | Progress, Settings, Admin, login và offline ở375/768/1440. Admin content/editor/wizard bước1 và invalid-source; không tạo curriculum mới. |
| Onboarding | Cả4 bước375/768/1440, save503 không mất lựa chọn, retry lưu45 và re-entry. First-run fixture pending/default30→native chọn45→Bỏ qua→PATCH200→Today selected45. Controller đã khôi phục baseline/preferences mẫu ban đầu. |

Ảnh loaded chính: `375-today-loaded.png`, `*-today-final.png`, `*-library.png`, `*-my-work-populated.png`, `*-feedback.png`, `*-revision.png`, `*-compare.png`, `*-vocab.png`, `*-review-loaded.png`, `*-settings-final.png`, `*-progress.png`, `*-admin.png`, `*-onboarding-{1,2,3,4}.png`, `*-writing-final.png`, `*-reading-final.png`, `*-speaking-final.png`, `*-listening-final.png`, `*-login-final.png`, `*-offline-final.png`. Tất cả ở artifacts; `*` là375/768/1440. Không dùng ảnh có skeleton làm bằng chứng trang loaded.

## Hành vi trọng yếu đã xác nhận

Receipt: [behavior-results.json](browser-261120-0120-lms-refresh-artifacts/behavior-results.json). Raw attempts cũ được giữ; [attempt classification](browser-261120-0120-lms-refresh-artifacts/attempt-classification.json) chỉ rõ probe/harness/pending/superseded. Bảng này dùng recheck source mới, không dùng số attempt làm coverage%.

| Kiểm tra | Kết quả và bằng chứng |
|---|---|
| Hint ledger | W1 POST503 chỉ hiện lỗi/retry, không mở hỗ trợ; POST201 sau đó mở nội dung đúng nguồn/rubric. Không nâng fixture lên bằng chứng AI. |
| Modal/timer | Source mới:7–9Tab và Shift+Tab luôn trong dialog; timer tick không kéo focus; Escape trả trigger; body overflow được khôi phục. |
| Nested Capture→YouGlish | Native double-click chọn `transducer` ở R1; recovery lookup200 có nhãn Fixture QA. Escape lần1 chỉ đóng child, parent giữ scroll lock và focus trigger; lần2 đóng parent/khôi phục scroll. Audio/video ngoài không được đánh giá. |
| Flashcard guard | Grade1 thẻ→đổi mode hoặc click Library mở3 lựa chọn; arrows/Space không đổi thẻ phía sau modal. |
| Flashcard save/reload | POST503 giữ batch1 và retry; reload giữ Thẻ2/2 cùng Undo, resume GET `vocabulary?filter=all`200. Undo về0→reload Thẻ1/2/Undo disabled. Lưu200 có completion state; không coi lỗi503 là provider proof. |
| Flashcard load error | Mode GET503→màn lỗi;7arrow/Space không tạo POST review ẩn. |
| Micro-challenge pending | Delay1800ms→503: textarea và các nút nhập/đọc chính tả bị khóa; input giữ nguyên sau lỗi. |
| Autosave latest input | Delay3000ms của save cũ; native typing thêm nội dung mới rồi save&exit. Các draft POST200; request cuối chứa toàn bộ input mới, reload editor trả đúng nội dung đó. Đây là gõ nối vào bản cũ, không giả lập thay value bằng JS. |
| Submit lỗi | W1 native mouse move/click→submission POST503 bị intercept; textarea giữ đúng nháp, lỗi/retry hiện rõ. Không tạo bài nộp hoặc gọi provider. |
| Settings | GET200 có activity IDs TEXT L1/W2/S1/R1/W1; hồ sơ45 render đúng. Reminder PATCH503 rollback checkbox về giá trị cũ. |
| Library continuity | Native q=email/topic hội nghị/skill writing/status not_started còn1 kết quả; reload/back giữ đủ4 tham số. Native typing `c` vào select chọn Chưa học. |
| Shared keyboard | Admin ArrowRight chuyển focus/selected tab Nội dung học; account ArrowDown tới Cài đặt, Escape đóng và trả trigger. |
| Onboarding save | POST503 giữ bước4/45, không báo thành công; retry thật vào Today; Settings/re-entry hiển thị45phút/ngày. |
| First-run skip45 | Controller backup và tạo pending/default30; native chọn45 rồi Bỏ qua gửi PATCH200 với targetMinutesDefault45. Today selected45 và Buổi học45phút. Profile gốc được controller restore sau test. |
| Speaking text-only | Fixture S1 hiển thị Không thể đánh giá âm thanh, ghi không có audio thật nên không thể đánh giá phát âm/ngữ điệu; không có điểm phát âm giả. |
| Offline | Owned Chrome emulated offline tới URL chưa mở: SW trả trang Chưa có kết nối mạng; restored network sau capture. |

## Render, controls và critique

Skill `ak-frontend-design` + self-critique-loop/ux-polish-standards đã áp dụng. [Visual critique độc lập](browser-261120-0120-lms-refresh-artifacts/visual-critique.md): vòng1 **20/24**, vòng2 **21/24**, không mục0. Đã chụp lại `*-settings-polished.png`, `*-compare-polished.png`, `render-login-polished/*` sau source cuối: card Bản2 hết chiều cao trắng thừa; copy mật khẩu mobile có nút bên dưới; ba icon Settings nhất quán. Mục dưới2 còn: observation đơn desktop hơi hẹp; state matrix chưa đủ ảnh mới; icon/emoji ở Vocab/review chưa được chứng minh sửa trong vòng2. Những phần này là polish/giới hạn bằng chứng, không tăng điểm bằng suy đoán.

- Bundled render-check đã chạy Today/Library/Writing/Reading/Listening/Flashcards/Settings/Login ở375/768/1440. Không lỗi layout/runtime trong report hoàn tất. Warnings `sr-only` bị checker nhận clipped là accessibility text cố ý. Một số first375 là skeleton vì first compilation/fetch; có ảnh loaded độc lập thay thế.
- Login disabled contrast4.45 ở vòng trước đã được sửa: `render-login-polished` cả3viewport có **0errors/0warnings**. Reading cũng0/0. Listening có1warning12radio glyph16px; DOM đo12label286×78–130px và native click chọn radio thành công, nên đây là checker false positive về hitbox.
- [DOM scans](browser-261120-0120-lms-refresh-artifacts/layout-scans.json): loaded main pages không tràn ngang và controls có ý nghĩa đo được>=44; body/editor/action labels16px. Badge/metadata nhỏ12–14 được liệt kê, không gộp thành editor/action labels. Breadcrumbdot contrast1.64 là separator trang trí; các text có nghĩa được đo không dưới4.5.
- 320 probe riêng Library/Vocab/Settings và4skills: scrollWidth<=viewport, buttons/editors đo được>=44. Radio/checkbox dùng vùng label lớn; không lấy glyph20px làm kích thước hitbox.
- Today cuối375: CTA resume16px,278×48px, y510–558 trước bottomnav y732. Hover desktop thật đổi rgb(15,118,110)→rgb(17,94,89); [ảnh](browser-261120-0120-lms-refresh-artifacts/1440-today-hover.png).

## Lỗi harness và giới hạn

- First compilation chậm, document stream bị hủy khi đổi route/cancel và Node_REPL timeout không tự là lỗi sản phẩm. CDP tab từng `visibilityState=hidden`; đưa tab foreground thì Next hydration tiếp tục. Harness đã reconnect cùng browser được theo dõi, không tạo server mới.
- Raw modal BODY cycle thuộc source trước wrapper cuối và/harness foreground. Recheck source mới allTab/ShiftTab/timer/Escape PASS. Một probe nhầm prompt accordion là modal được đánh HARNESS; không dùng để kết luận UI lỗi.
- Raw reveal retry receipt chụp pending không dùng làm bằng chứng accepted. Revisit session nghe mẫu sau retry xác nhận transcript đã mở/Có hỗ trợ từ ledger thật; receipt `listening-reveal-retry-persisted` là bằng chứng cuối.
- Không bao phủ nativeSafari/điện thoại vật lý, browserzoom200% thật, provider/audio quality, Storage upload thật, Supabase auth/RLS/OAuth hoặc production. Admin create-collision/Drive sync và wizard bước2–4 không được thực thi để tạo thêm nội dung; source/unit gates của controller là nguồn bằng chứng riêng.
- State matrix chưa kiểm hover/loading/success của từng control; không có chứng nhận WCAG toàn bộ hoặc coverage% suy diễn.

Câu hỏi chưa giải quyết: không có quyết định sản phẩm mới. Còn người dùng xem local/ảnh để chấp nhận thị giác và các giới hạn runtime/provider kể trên.
