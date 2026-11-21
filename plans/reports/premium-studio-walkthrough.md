# Premium Learning Studio — triển khai sau duyệt Today

Ngày20/11/2026. **Đã triển khai Phase2–3 vào mã nguồn**, sau yêu cầu “triển khai đi cho tôi”. Gallery20màn: [ảnh trước/sau](premium-studio-review.html). Preview riêng: http://127.0.0.1:3035/today (dữ liệu mẫu). Chưa push/deploy; chưa xem fixture là nghiệm thu provider/production hay người dùng chấp nhận toàn bộ hình ảnh.

## Thay đổi và phạm vi

- **Learning Studio:** header nhỏ, tên bài/timer/trạng thái nháp rõ; desktop đề bài và workspace5:7; mobile nguồn đóng/mở bằng CSS, giữ state và component mounted. Writing có editor lớn; Reading gom3trường vào một vùng trả lời; Speaking lấy recorder làm trọng tâm; Listening giữ player/câu hỏi/transcript lock. Cả8mode thường/IELTS dùng registry hiện có.
- **Thư viện:** search/filter dẫn vào danh sách bài biên tập; title/mục tiêu rõ, status nhẹ; chi tiết bài một hero với CTA30/45rồi đề/nguồn. Giữ URLq/query/topic/skill/status, Back/Forward/reload và data-tour.
- **Onboarding:** desktop có rail4bước và workspace đang hoạt động; mobile stepper nhỏ. Footer safe-area, draft/save/skip/retry giữ nguyên.
- **Bài của tôi/góp ý:** lịch sử ưu tiên tên bài và trạng thái; top3góp ý thành những hàng rộng với câu gốc/cách sửa cạnh nhau, không ba cột hẹp. Bài đã nộp trong disclosure; bản đầu/bản sửa so sánh rõ; vẫn đủ observation, flag/save phrase/limitations/parentId.
- **Vocabulary:** hero ôn từ, danh sách có câu gốc/nguồn, flashcard tập trung phrase/meaning với controls lớn và thanh tiến trình mảnh. Giữ gesture/hotkeys/undo/batch/save retry/YouGlish/TTS; không sửa hooks/contracts/SRS.
- **Progress:** strip số liệu thật →4kỹ năng →lỗi lặp →bản sửa, không vẽ xu hướng giả. **Settings:** phần mô tả tách khỏi content surfaces, giảm card lồng; giữ rollback/confirmations. **Admin:** header/tabs gọn; empty text chỉ nói không ghi nhận bài chấm lỗi. **Login:** intro/form chia cột desktop, form trực tiếp mobile; giữ password/magic-link/errors.
- **Tokens:** nền ngà ấm, surface trắng, teal cho hành động. Bỏ lớp trang trí Lively gradient/pastel/shadow; thêm aliasdanger cho errorstates đang dùng và progress styling có semanticsnative.
- **Next16:** thêm overload type cho kết quả `withLearner`/`withAdmin`, phù hợp generated route checks; runtime bodies giữ nguyên.6test mới chứng minh promisedparams, directcall và lỗi awaitparams được map.

[Danh sách61file nguồn thay trong phase này](premium-studio-artifacts/changed-source-files.json). Kèm1test mới `tests/unit/server/http-route-context.test.ts`. Không sửa DB/provider/seed/học liệu/secret hoặc hành vi controllers; bảo toàn tất cả thay đổi có sẵn trong working tree.

## Kiểm thử thực chạy

| Kiểm tra | Kết quả và giới hạn |
|---|---|
| `npm run lint` | PASS exit0,2cảnh báo ảnh `<img>` có sẵn ở markdown-text/flashcard. |
| `npm run typecheck` | PASS exit0, bao gồm typeAPI mà Next sinh sau build.38lỗi route cũ đã hết. |
| `npm test` | PASS408tests/52files, có invariant append-only/assisted/not_assessable/practice_estimate/transcriptgate/SRS và6test context mới. |
| `npm run build -- --webpack` | **PASS exit0 trên source cuối**, compile/TypeScript/prerender14pages/page data. [Log](premium-studio-artifacts/build-webpack-final-pass.log). |
| `npm run build` mặc định | FAIL Turbopack internal ModuleGraph taskcancel. Không thay config/skiptypecheck để che lỗi. [Log](premium-studio-artifacts/build-turbopack-fail.log). Không chứng nhận defaultTurbopack readiness bằng WebpackPASS. |
| Render-checkToday | PASS exit0,0errors/15warnings đều sr-only chủ ý ẩn; gallery render375sau chỉnh touch targets0errors/0warnings. [Receipt](premium-studio-artifacts/render-check-today/render-report.json). |
| Library/Onboarding |35nativebrowserchecksPASS;12afterviewport samples không overflow. URL/search/history/45payload/revision409; wizard503giữ draft/retry/skip và focus. [Report](premium-studio-discovery-qa.md). |
| Progress/Settings/Admin/Login |16afterviewport samples không overflow, có before/after; settings503rollback và signoutmodal/Escape; login chuyểnmagic-link/requiredpassword/error-prop. [Report](premium-studio-supporting-review.md). Không gửi authprovider thật. |
| Session |21/21nativechecks PASS: source giữ state/mounted, autosave pending/fail/retry, submit503giữ nháp, timer/exit, hint/transcriptreceipt failclosed và revealpayload.32aftermẫu8mode×4width không overflow. [Report](premium-studio-session-qa.md), [receipt](premium-studio-artifacts/session-qa-checks.json). Script dừng ở CDP permission descriptor không hỗ trợ; mic/audio vẫn NOT VERIFIED. |
| Work/Vocab |20afterviewport samples320/375/768/1440 không documentoverflow/clippedcontrols. Native flip/decision/undo/YouGlishdialog/focus/batch503giữpending; vocab503giữ câu; review503giữ answer. So sánh bản đầu/sửa, disclosurebài, assessmentfailedretry. [19checks xác minh](premium-studio-artifacts/work-vocab/verified-checks.json), [focusedfeedback](premium-studio-artifacts/work-vocab/feedback-checks.json). Một lầnclick trước hydrationkhôngcountPASS, focusedretest chờhydration. |
| `git diff --check` / secrets |PASS; changedsource0potentialsecret values; dotenv vẫnignored. Không chạy integration/seed/migrate. |

Lỗi compilerWebpackWasmHash ban đầu được xử lý bằng giữ lại và tách cacheWebpack cũ ra `/private/tmp/lms-premium-webpack-cache-before-clean`; build sạch rồi build lại trênsourcecuối đềuPASS. Không đổi dependency/config. Các lần lỗi fixture do missingpuremodule/hydrationcache được giữ trong receipts, đã khắc phục ở bản preview riêng; không dùng chúng làm lỗi sản phẩm hoặc chứng nhận PASS.

## Ảnh và visual critique

[Gallery20màn](premium-studio-review.html) cho phép chọn375/1440và mở preview. Session8modes có before/after320/375/768/1440; Discovery3màn cóbefore375/1440,after4width; Work/Vocab5màn cóbefore375/1440,after4width; Supporting4màn cóbefore375/1440,after4width. Các matrix là fixture mặc định và một số state trọng yếu, không phải mọi tổ hợpstate.

Đã xem trực tiếp Writingdesktop, Feedbackdesktop, Vocabularydesktop, Flashcardmobile, Onboardingdesktop và Settingsdesktop; các reviewer cũng trực tiếp xem ảnh chủ quản trong report. Hierarchy chuyển từ nhiều card màu sang một workspace chính; khoảng cách và heading có thứ bậc; feedback chia câu gốc/cách sửa để đọc ngang khi đủ chỗ và dọc trên mobile; source/editor có chiều rộng theo nhiệm vụ; selected/focus/CTA có nghĩa. Đã sửa progressbar bản thẻ thành6px theo pixels thực thay cho nativebar đậm. Không dùng điểm tự chấm làm acceptance của người dùng.

Font hệ thống fallback được dùng nhất quán before/after; chưa đối chiếu Interproduction. Preview fixture có1ngoại lệ có chủ đích: loginemail được thay bằng `minh@example.test` chỉ ở bản copy để không đưa email cá nhân vào ảnh. Nguồn sản phẩm giữ nguyên.

## Preview, rollback và kiểm thử tay

Preview `http://127.0.0.1:3035` chạy từ `/private/tmp/lms-premium-studio-preview`, actualcomponents +syntheticprops/API, không có env/DB/provider. Processmain3000không bị dừng; source repo thật đã đổi nhưng preview riêng là nơi kiểm ảnh xác định. Restart chỉ process3035doagent sở hữu để xử lý cachehydratestale. [Hash nguồn61files](premium-studio-artifacts/final-source-hashes.json) khớp59UI/tokenfiles trong preview sau normalize2ngoại lệ;2HTTPfiles chỉ cần build/unit, không dùng fixture. Hashsync nằm trong artifactstừngowner; cần normalizeTailwindscan2dòng và loginfixtureemail khi so toànpreview.

Thử trên điện thoại với app thật đã đăng nhập:

1. Hôm nay chọn30/45→bài Writing; nhập vài câu, đóng/mởđề, lưu nháp/rời/quaylại. Xác nhận chữ không mất và trạng thái lưu rõ.
2. Thư viện search/filter→Back/reload; onboardingsave lỗi nếu mô phỏng rồi retry vẫn giữ lựa chọn.
3. Listening chỉ xem transcript sau receiptserver; Speaking từ chối quyềnmicro rồi cấp lại/thu thật; nộp và xemfeedback/bản sửa.
4. Sổ từ mởcâu gốc, ôn/lật/undo/YouGlish; nếu mạnglỗi kết quảđợt vẫn còn và cóthửlại. Settings đổi giờ nhắc, gặp lỗi phải trả về giá trị cũ.

Rollback chỉfile thuộcphase: bản nguồn60file có sẵn trướcphiên được giữ tại `premium-studio-artifacts/baseline-owned/`, SHAmanifest `baseline-source-hashes.json`. File mới `onboarding-view.module.css` và testcontext mới chỉ xóa khi được yêu cầurollbacktươngứng; không dùng gitreset/checkout/stash vì workingtreecó nhiều việc khác. PhaseToday có snapshotriêng từ lượt trước.

Còn chưa nghiệm thu: nativephone/Safari/keyboard/safe-area, audio/mic upload/provider thật, toàn bộ empty/loading/error mọiroute, fullscreenreader/contrast mọiUIstate, fontproduction và uservisualacceptance cácmàn vừa triển khai. Không gọi đãdeploy hay pilotready.
