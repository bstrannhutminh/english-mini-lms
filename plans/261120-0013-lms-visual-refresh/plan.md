---
title: "Làm mới UI/UX LMS: không gian học cá nhân"
status: merged-into-261121-1800-lms-comprehensive-upgrade
created: 2026-11-20
priority: P1
branch: feat/lms-architecture-ux-onboarding
---

# Làm mới UI/UX LMS

> **ĐÃ GỘP (21/11/2026):** Plan này được kế thừa và nghiệm thu chung trong
> `plans/261121-1800-lms-comprehensive-upgrade/`. Source của plan vẫn là nền tảng
> (được giữ, không làm lại); acceptance/visual-QA cuối do plan mới thực hiện.
> Không triển khai thêm theo checklist dưới đây.

## Kết quả và ranh giới

Thiết kế lại toàn bộ giao diện và trải nghiệm học hiện có theo yêu cầu ngày 20/11/2026: người học nhận ra việc cần làm ngay, đọc và thao tác thoải mái trên điện thoại, học–nhận góp ý–sửa bài liền mạch. Giữ nhận diện Medical Clean Teal, Inter, stack Next.js 16/TypeScript/Tailwind và các plugin kỹ năng đã có.

Phạm vi gồm Hôm nay, Thư viện và chi tiết bài, onboarding, bốn không gian học và biến thể IELTS, Bài của tôi/feedback/so sánh, Sổ từ/flashcards/review/capture, Tiến độ, Cài đặt, Quản trị, Đăng nhập và các màn loading/error/offline. Xử lý lỗi tương tác đã xác nhận trong đợt QA khi chúng ảnh hưởng trực tiếp đến các luồng này.

Ngoài phạm vi: thêm môn hoặc bài học, thay provider/stack, migration DB, tính năng thông báo mới, bảng xếp hạng, đổi chính sách dữ liệu, push/merge/deploy. Dữ liệu mẫu chỉ phục vụ xem và kiểm thử local; curriculum vẫn từ manifest approved.

Trạng thái hiện tại: **đã bàn giao bản local, chờ người dùng chấp nhận thị giác**. Người dùng đã duyệt triển khai ngày20/11/2026 qua “oke tôi trông cậy ở nơi bạn hết nhé”; source scope đã hoàn tất và đóng băng. Plan giữ `in-progress` vì acceptance còn thiếu bằng chứng, không dùng phê duyệt triển khai hoặc checklist cũ để suy ra UI cuối đã được chấp nhận.

## Design brief

```text
Register:  Product
Scene:     Bác sĩ học sau giờ làm trên laptop hoặc điện thoại, trong ánh sáng thay đổi; cần bắt đầu nhanh và tập trung 30–45 phút.
Direction: Không gian học sáng, bình tĩnh, có nhịp biên tập; đề bài và bài làm là nội dung chính vì việc đọc, luyện và sửa cần nhiều sự chú ý.
Color:     Restrained; bg oklch(98% 0.004 195), text oklch(25% 0.018 195), accent oklch(51% 0.096 186); Teal đậm cho hành động, lựa chọn và focus. Kiểm tra computed contrast trước nghiệm thu.
Type:      Inter hiện có + fallback hệ thống; 400/500/600; trục tương phản bằng kích cỡ và trọng lượng. Nội dung/nhãn thao tác >=16px, dòng đọc thoáng 1.6, đoạn dài 60–70ch.
Signature: Một nhiệm vụ học chính đi cùng lộ trình bốn bước gọn; trang làm bài giống một bàn học chia đề bài và vùng trả lời rõ ràng.
Dials:     variance 3, motion 2, density 4; giảm mật độ vì người học cần đọc dài và thao tác bằng ngón tay.
```

Màu và font giữ quyết định đã có. Thay đổi rõ ở bố cục, thứ bậc, nhịp khoảng trắng, chiều cao controls và cách mở thông tin phụ. Viền mảnh/nền dịu thay hộp viền lồng nhau; shadow dành cho overlays. Các kích cỡ/màu/khoảng cách/motion có semantic token và dùng thống nhất.

## Bằng chứng khảo sát

- Nguồn: `src/app/globals.css`, `src/components/layout/*`, `src/components/ui/*`, `src/features/*`; kiến trúc route/service/contract đang tách rõ. `MODE_META`, `MODE_REGISTRY`, `data-tour` và public API là touchpoint cần bảo vệ.
- Màn Hôm nay live 375px: phần chào/chọn thời lượng và các dòng giải thích chiếm nhiều chiều cao; CTA bắt đầu xuống sát thanh điều hướng. Desktop: các khối trắng có trọng lượng tương đương, chữ nhỏ trong lộ trình, cột nội dung hẹp dù còn nhiều chỗ.
- Khung làm bài từ ảnh QA: đề và textarea có sẵn hai cột, nhưng tiêu đề ở header bị ẩn thị giác, nhiều hộp nền/viền, nhãn gợi ý tách khỏi nội dung và trạng thái lưu bị ẩn trên mobile.
- [QA đã xác nhận](../reports/qa-261119-1600-lms-ui-ux.md): hint khi event503, schema Settings activityId, flashcards mất batch, phím tắt tác động nền dialog, focus/modal/tabs/menu, controls/contrast, hint W2 và reminder rollback.
- [Baseline mới](../reports/visual-261120-0013-lms-refresh.md), [scout](../reports/scout-261120-0013-lms-visual-refresh.md) và [review kế hoạch](../reports/plan-review-261120-0013-lms-visual-refresh.md) ghi phạm vi/ảnh và quyết định. Artifact độc lập: [bản mẫu](design-proposal.html), chỉ minh họa thiết kế để duyệt.

## Phases

| Phase | Kết quả | Phụ thuộc | Trạng thái |
|---|---|---|---|
| 1 | [Tokens, controls và khung điều hướng](phase-01-foundation.md) | Duyệt brief/bản mẫu | Completed — triển khai nguồn |
| 2 | [Hôm nay, Thư viện và onboarding](phase-02-discovery-and-onboarding.md) | 1 | Completed — triển khai nguồn |
| 3 | [Không gian học và góp ý/sửa bài](phase-03-learning-workspace.md) | 1 | Completed — triển khai nguồn |
| 4 | [Sổ từ, Tiến độ, Cài đặt, Quản trị và các trạng thái](phase-04-supporting-pages.md) | 1–3 | Completed — triển khai nguồn |
| 5 | [Kiểm tra browser, critique và bàn giao](phase-05-verification.md) | 1–4 | In-progress — local đã giao, chờ visual acceptance |

## Tiêu chí nghiệm thu

Các tiêu chí kết hợp ban đầu được tách theo loại bằng chứng, giữ nguyên ý định và ngưỡng. `[x]` chỉ xác nhận phần được mô tả, không bao gồm phần còn unchecked; fixtures không chứng minh provider/production.

- [x] Hôm nay có một CTA chính trong mẫu loaded375×812; CTA resume16px,278×48px,y510–558 trước nav y732 với hồ sơ mẫu bình thường. Có đường mở bài và chọn30/45 trong browser.
- [ ] Toàn bộ đường mở/tiếp tục<=2 thao tác, tên dài không tràn và các state Today fresh/in-progress/revision/noactivity/error30/45 được kiểm đầy đủ.
- [x] Desktop/mobile đã tái bố cục; màn đại diện loaded375/768/1440 và tập320 Library/Vocab/Settings/4skills không tràn ngang trong DOM scans.
- [ ] Không tràn ngang/chồng controls trong mọi tổ hợp state có dữ liệu320/375/768/1440, gồm bàn phím điện thoại thật và safe-area.
- [x] Body/editor/input/nhãn thao tác16px và vùng bấm44+ trên các mẫu DOM được đo; text có nghĩa không dưới4.5:1; token border/UI mạnh đạt3:1. Login disabled được sửa và checker polished0errors/0warnings.
- [ ] Mọi vùng bấm>=44×44px, text>=4.5:1 và meaningful UI>=3:1 ở toàn bộ disabled/loading/focus/error; metadata12–14px và separator trang trí đã được phân biệt, không quy thành body/action labels.
- [x] Điều hướng5 vùng/tài khoản/cài đặt và links giữ source contracts; browser account menu/tabs và đường tới các vùng đã đi qua.
- [x] Library giữ q/query alias/topic/skill/status và link `?topic=` cũ theo unit/source; native reload/back giữ4 bộ lọc trong browser. Tham số lạ/lặp/hash có unit/source proof.
- [ ] `data-tour` first-run/replay/next/back/skip toàn route và IELTS runtime đầy đủ; không suy từ registry/source rằng các biến thể đã browser PASS.
- [x] Library tìm kiếm/bộ lọc/suggestion/count theo phạm vi đúng từ source/unit; native q/topic/skill/status và IELTS0/empty state đã xác nhận local.
- [x] Wizard4 bước, skip45 first-run, re-entry, save503 giữ lựa chọn và retry45 thành công đã xác nhận local; không báo thành công khi request thất bại.
- [x] W1/R1/S1/L1 đề/player/editor/feedback text-only đọc được và bố cục đã render375/768/1440/320; source plugin interface giữ nguyên.
- [x] W1 submit503 giữ nháp; autosave cũ pending→gõ thêm→save&exit→reload giữ input mới nhất trong native browser. Header mobile có trạng thái lưu/thử lại ở source và ảnh.
- [x] Listening transcript lock/accepted ledger/retry persisted giữ gate trong browser mẫu; không mở hỗ trợ từ receipt còn pending.
- [ ] Timer background/reload/expiry, autosave failure, media invalid/permission/upload/retry/Shadowing, bàn phím và audio thật còn thiếu nghiệm thu runtime.
- [x] W1 hint503 không reveal→event201 mới mở; W2 hỗ trợ lấy approved objective/rubric ở source. Unit hint pending/failed/retry và provenance đạt trong suite cuối.
- [x] Append-only/server-side assisted/not_assessable/practice_estimate được bảo vệ ở source/unit; S1 text-only fixture hiện giới hạn không thể đánh giá âm thanh. Không nâng fixture thành chấm provider thật.
- [ ] W2 hint runtime và luồng assisted/submission/audio thật được xác minh end-to-end ở môi trường provider thật.
- [x] Feedback mẫu ưu tiên việc cần sửa, đủ original/issue/suggestion/example/retry_prompt/limitations; mở được Bản2/so sánh từ MyWork local.
- [ ] MyWork pending/failed/retry và các observation/text dài đủ state chưa được browser kiểm đầy đủ; observation đơn desktop còn hẹp theo critique.
- [x] Flashcard mode/route guard không bỏ batch âm thầm; save503 giữ batch/retry200, reload/undo/loaderror và hotkeys nền modal/error đã xác nhận. Micro-challenge pending503 khóa đúng input; input/loading guards có source proof.
- [ ] Vault>200 restore có source/unit proof nhưng chưa có browser fixture đủ lớn; detail/edit và các nhánh input/loading/success/empty chưa được probe đầy đủ.
- [x] Modal trap/restore focus, Tab/Shift+Tab/timer/Escape/scroll lock và nested Capture→YouGlish được browser xác nhận; tabs/menu dùng Arrow/Home/End/Escape ở source và probes liên quan.
- [x] Settings parse IDsTEXT hợp lệ/45 và reminder503 rollback được browser xác nhận; export/delete copy khớp source behavior qua review.
- [x] Quản trị giữ thao tác biên tập có chủ đích và guard tạo mới/collision ở source đã review, không ngầm PATCH nguồn cũ.
- [ ] Admin wizard2–4/create-collision/partial-retry/Drive sync chưa được browser thực thi; không tạo thêm nội dung học để suy ra PASS.
- [x] `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` đạt trên lượt delivery cuối;50 files/394 tests, exit0 cả4 lệnh.
- [x] DOM/HTTP/browser probes bao phủ các regression trọng yếu được liệt kê trong báo cáo QA; attempts harness/pending/superseded được phân loại, không dùng số attempt làm coverage%.
- [ ] Bao phủ toàn bộ state/regression còn lại, thay vì gộp các critical paths đã đạt thành mọi acceptance đã đạt.
- [x] Render-check375/768/1440 trên màn đại diện và critique2 vòng20→21/24, không mục0; mục5/8/12 còn1 được ghi rõ.
- [ ] Người dùng xem ảnh/local và chấp nhận hướng thị giác của bản cuối.
- [ ] NativeSafari/điện thoại vật lý/zoom200% và integration/provider/audio/Storage/Supabase Auth/RLS/OAuth thật chưa được kiểm. Production ngoài phạm vi; local fixtures không thay các bằng chứng này.

## Tiến độ và bàn giao

Controller giữ kế hoạch và quyết định scope. Giao file ownership riêng cho UI worker nếu triển khai song song; review và browser verification dùng context mới. Cập nhật trạng thái thực tế của toàn bộ phase khi hoàn tất. Docs chỉ cập nhật owning surface khi behavior/setup đổi; báo cáo nghiệm thu nằm trong `plans/reports/`.

Full-plan sweep đã backfill phase1–4; phase5/acceptance giữ các gate chưa kiểm. [PM sync report](../reports/pm-261120-lms-refresh-final.md), [Verification/Walkthrough cuối](../reports/verification-261120-lms-refresh-final.md), [Browser QA](../reports/browser-261120-0120-lms-refresh.md), [điểm tiếp tục](state-current.md). Không dùng tỷ lệ checkbox làm tỷ lệ coverage hoặc human acceptance.

| Checklist | Đã xác nhận | Còn lại |
|---|---:|---:|
| Phase1 — triển khai nguồn | 5/5 | 0 |
| Phase2 — triển khai nguồn | 4/4 | 0 |
| Phase3 — triển khai nguồn | 5/5 | 0 |
| Phase4 — triển khai nguồn | 6/6 | 0 |
| Phase5 — bàn giao/nghiệm thu | 12/19 | 7 |
| Tổng checklist phase | 32/39 | 7 |
| Acceptance tách theo bằng chứng | 20/32 | 12 |

Đây là số item thực tế sau full-plan sweep, không phải coverage% hoặc tỷ lệ hoàn tất nghiệm thu. Bốn phase triển khai hoàn tất; plan/phase5 vẫn `in-progress` để giữ human visual acceptance và các gate chưa kiểm.

Đã duyệt: hướng thiết kế và toàn bộ phạm vi trên. Phê duyệt ngày20/11/2026 kế thừa bản mẫu/kế hoạch đã trình; triển khai local, kiểm tra và bàn giao để người dùng xem lại.
