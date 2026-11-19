# QA runtime giao diện LMS — 19/11/2026

Trạng thái: **PASS trong môi trường QA local độc lập**. Bằng chứng giao diện, hành vi và cold fallback ngoại tuyến đã hoàn tất; môi trường tạm đã dọn.

## Môi trường và ranh giới

- Google Chrome headless cài sẵn, Playwright có sẵn; viewport **390×844** và **1280×844**. Next.js **16.3.6**, `next dev --webpack`, bind `127.0.0.1:3100`.
- Source/public/content copy theo allowlist vào thư mục tạm; `node_modules` symlink. Không copy/đọc `.env*`, không cài dependency, không sửa source từ agent QA.
- PostgreSQL tạm SSL `127.0.0.1:54329`, hai DB QA độc lập. `pg_dump` trước migration, trước seed, và trước tạo DB kiểm tra bootstrap mới. Chỉ seed **16 activities approved** từ `content/english-lab/manifest.yaml`; không clone IELTS, không tạo nội dung học mới.
- Persona `QA Learner` dùng auth bypass chỉ trong development. Nhánh PWA trước đăng nhập kiểm riêng với bypass **tắt**, cookie trống và Supabase placeholder. Không sử dụng tài khoản thật, Gemini/Drive, dữ liệu clinic hoặc DB người dùng.

## Kết quả đã quan sát

| Kiểm tra | Kết quả | Bằng chứng |
|---|---|---|
| Bootstrap hai trình duyệt đồng thời ở DB mới | PASS | 390/1280 vào wizard, không pageerror, đúng một learner row; `bootstrap-results.json` |
| Wizard 4 bước, bỏ qua, lưu 45 phút, lỗi và thử lại | PASS | Skip PATCH thật; save POST thật; lỗi 503 được intercept rồi bỏ intercept để save thành công; `runtime-results.json` |
| Hôm nay sau complete profile | PASS | Đúng `/today`, chào QA Learner, 45 phút selected ở cả hai viewport; `final-runtime-results.json` |
| Hôm nay có phiên đang dở | PASS | Một CTA vào học nhìn thấy ở phần đầu; gợi ý nằm trong details đóng; mở và đổi W2→W1 thật; `today-final-results.json` (12/12) |
| Thư viện | PASS | 16 thẻ approved; Email→3; Viết→4; tìm không có kết quả và xoá lọc; deep link `?topic=giao-tiep-hoi-nghi`→6; W1 detail |
| Cài đặt nhắc học | PASS | Toggle hit area 44×44; time field 16px; lưu `21:30` thật rồi reload giữ đúng |
| Các màn và module vừa tách | PASS | Today/library/vocab/my-work/admin/settings/login/progress, onboarding 4 bước và W1/W2/R1/S1/L1; render, hydration/pageerror, overflow, targets, fields; `final-runtime-results.json` (190/190 sau sửa selector dev overlay) |
| Bốn kỹ năng | PASS | Sessions được tạo qua API thật (201; 409 tái dùng phiên active hợp lệ), đúng plugin và Focus; hai viewport; textarea cuối không bị footer che |
| Word target | PASS | **W1: 120–150**, **W2: 80–100**, khớp đề đã duyệt; không dùng mục tiêu mặc định đoán |
| Timer chạy sau reload | PASS | 45:00→44:57; không reset về 45 phút |
| Timer tạm dừng và tiếp tục | PASS | Reload giữ 44:57 và trạng thái paused; resume→44:56 |
| Deadline khi tick bị trì hoãn | PASS | Timer storage deadline 4 giây + main-thread delay thật 4,5 giây → wrap-up; đây là instrumentation thời gian, không chờ 45 phút |
| Thoát khi lưu lỗi | PASS | Intercept draft 503: giữ `/learn`, đóng overlay để thông báo lỗi thấy được; bỏ intercept → save 200 thật → today; reload lấy lại draft |
| Phiên mất/kết nối lại | PASS | `context.setOffline(true/false)` → banner/ẩn banner; `timer-results.json` (10/10) |
| Hết giờ: lưu lỗi, nộp lỗi, học thêm | PASS | Draft503/submission503 giữ trang, đóng modal, hiện lỗi; Học thêm 5 phút hoạt động; không gọi Gemini; `expiry-results.json` (5/5) |
| PWA trước đăng nhập | PASS chức năng | `/offline`200, `/today`→login; SW cache 5 public assets, không cache API/bài cá nhân; native offline `/learn/...`→fallback; online→login; pageerrors0 |
| PWA cold fallback có CSS | PASS | Browser/context mới, chỉ login rồi SW install; native offline, không warm stylesheet của offline page; font16/icon28/card trắng/retry49,59px, không overflow; `service-worker-results.json` (7/7) |
| Contrast nút fallback cuối | PASS | Nền `#0f766e`, chữ trắng16px, tỉ lệ **5,47:1** quan sát từ computed style trên cold fallback; `offline-contrast-results.json` |

Kiểm tra kích thước chỉ xác nhận các controls/fields nhìn thấy ở các trạng thái đã đi qua. Đây không phải chứng nhận WCAG, screen reader hoặc đo contrast đầy đủ.

## Ảnh để review

Ảnh **`final-*`** là viewport thật sau `scrollTo(0,0)`; ảnh **`*-bottom-*`** kiểm cuối editor riêng. Ảnh fullPage cũ có thể đặt sticky/fixed header giữa ảnh dài: chỉ giữ lịch sử, không dùng làm hình bàn giao cuối.

- [Hôm nay — điện thoại](browser-qa-261119-1203-artifacts/final-today-390.png), [desktop](browser-qa-261119-1203-artifacts/final-today-1280.png).
- [Onboarding bước 1](browser-qa-261119-1203-artifacts/final-onboarding-step1-390.png), [bước 2](browser-qa-261119-1203-artifacts/final-onboarding-step2-390.png), [bước 3](browser-qa-261119-1203-artifacts/final-onboarding-step3-390.png), [bước 4](browser-qa-261119-1203-artifacts/final-onboarding-step4-390.png).
- [Thư viện](browser-qa-261119-1203-artifacts/final-library-390.png), [Bài của tôi](browser-qa-261119-1203-artifacts/final-my-work-390.png), [Sổ từ](browser-qa-261119-1203-artifacts/final-vocab-390.png).
- [Viết](browser-qa-261119-1203-artifacts/final-W1-390.png), [Đọc–dịch](browser-qa-261119-1203-artifacts/final-R1-390.png), [Nói](browser-qa-261119-1203-artifacts/final-S1-390.png), [Nghe](browser-qa-261119-1203-artifacts/final-L1-390.png), [W2 desktop](browser-qa-261119-1203-artifacts/final-W2-1280.png).
- [Modal hết giờ](browser-qa-261119-1203-artifacts/final-expiry-modal-390.png), [lỗi lưu lúc hết giờ](browser-qa-261119-1203-artifacts/final-expiry-save-error-390.png), [lỗi nộp lúc hết giờ](browser-qa-261119-1203-artifacts/final-expiry-submit-error-390.png).
- [Cold fallback trước đăng nhập](browser-qa-261119-1203-artifacts/service-worker-offline-before-auth-390.png).

## Ghi chú về harness và giới hạn

- Log ban đầu ghi va chạm tạo learner dev lần đầu. Root sửa conflict-safe insert; kiểm lại bằng **DB thứ hai sạch** và hai load đồng thời, không chỉ priming DB cũ.
- Các lỗi hình học, cỡ field và tràn ngang ban đầu đã gửi root, sửa và kiểm lại. Log đầu giữ lịch sử; không dùng để kết luận source cuối còn lỗi.
- Cold fallback đầu thiếu CSS đã được sửa bằng critical CSS ngay trong HTML và cache v4. Ảnh cuối lấy từ browser mới, có CSS và contrast đo được; không dùng việc warm trang ngoại tuyến để che lỗi.
- Harness đầu đếm cả link gợi ý ngoài lưới, kỳ vọng nhầm word target, đếm hidden Next dev-overlay `nav`, và đếm geometry nội dung details đã đóng. Selector sửa theo DOM/paint thật và kiểm lại. API409 tạo phiên trùng được tái dùng theo contract, không làm mới nội dung DB.
- Các suite giao diện chặn đăng ký SW và ẩn Next dev portal; caught console noise do SW bị harness chặn được ghi trong `next-*.log`. Suite PWA riêng cho SW hoạt động thật. Video/âm thanh YouTube, microphone và provider không được xác nhận; các requests bên ngoài bị chặn trong matrix kỹ năng.
- Lỗi 503 của onboarding/draft/submission dùng network intercept chỉ cho **nhánh lỗi**, ghi nhãn trong JSON. Các lần save/profile/draft thành công là API và DB tạm thật.
- Chưa xác nhận: điện thoại thật/Safari, Supabase magic-link/password/RLS thật, Storage/upload/audio, Gemini feedback hoặc submit thành công với provider, production/deploy, người học duyệt giao diện.

## Dọn môi trường

Đã đóng browser QA, dừng Next PID79584 và PostgreSQL PID41945, xoá scratch. `cleanup.json`: `remainingOwned=[]`, không listener cổng3100/54329, `scratchRemoved=true`, source hash mismatches bằng0. Lượt xoá đầu gặp race khi Next đang thoát (`ENOTEMPTY`); chờ process exit quan sát được rồi xoá lại thành công. Không dừng process người dùng.

Lưu `source-hashes.json`, DB snapshots, JSON results, logs và `harness-reference.txt` trong artifacts. Harness không còn chạy và không tạo file JS/CJS trong source/lint scope.

Câu hỏi chưa giải quyết: Không.
