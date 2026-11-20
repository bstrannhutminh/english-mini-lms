# Rà soát nguồn — làm mới toàn bộ LMS

Ngày: 20/11/2026 · Mốc rà soát: 01:30 Asia/Ho_Chi_Minh.

Status: DONE_WITH_CONCERNS

Kết luận: chưa đủ nghiệm thu. Bốn lỗi behavior/provenance và các thiếu sót contrast/điểm chạm/copy được xác nhận từ nguồn bên dưới. Không phát hiện thay đổi DB/provider, phá append-only, gửi `assisted` từ client hoặc đổi thang SRS. Source review không thay thế browser, provider thật hay người dùng duyệt giao diện.

## Phạm vi và bằng chứng

- Baseline `a29c99e`; toàn bộ diff UI/behavior chưa commit đã được duyệt, gồm các module mới chưa tracked. Không lấy review cũ làm PASS.
- Đọc README trước; luật `.agents/rules/english-mini-lms.md`, Lite track, product-design, hướng dẫn xây dựng, data contract, plan/phases `261120-0013-lms-visual-refresh` và ba báo cáo foundation/discovery/learning.
- Áp dụng `ak-code-review`; controller trực tiếp rà shared UI/layout/tour, Today/Library/onboarding, MyWork, Progress/Settings/Admin/Auth và trạng thái chung. Explorer độc lập rà mọi thay đổi session/vocab, tests và service/caller liên quan. Hai nhánh chỉ đọc nguồn.
- Không sửa nguồn, chạy test/browser/server, đọc env, gọi DB/provider hoặc commit. Chỉ ghi báo cáo này. Các sửa QA sau mốc trên cần rà lại phần bị ảnh hưởng.

## Findings cần sửa

### P2 — Batch hợp lệ bị xóa khi khôi phục kho từ lớn

Nguồn: `src/features/vocab/use-flashcard-deck.ts:58–70`, `src/features/vocab/deck-review-storage.ts:27–31`, `src/features/vocab/use-deck-reviews.ts:42–44`, `src/server/vocabulary/quick-review.ts:54–60`.

Khôi phục lấy `all=true&limit=200` rồi đòi mọi ID trong snapshot xuất hiện trong response. Endpoint chỉ trả 200 từ đầu theo mastery/due, không trả tất cả ID của tài khoản. Với Vault >200 từ, bộ “đến hạn” có thể chứa từ mastery cao nằm ngoài 200 từ này. `restoreDeckSnapshot()` trả null; `resetReviews()` xóa snapshot và pending batch âm thầm. Response hữu hạn không phải bằng chứng ID còn lại không thuộc learner.

Sửa theo nguyên nhân: xác minh đúng các ID snapshot bằng tài khoản hiện tại; lỗi/không đủ dữ liệu phải giữ batch, báo rõ và cho retry/discard có chủ đích. Kiểm meaningful: >200 từ, pending deck chứa ID ngoài top200, reload vẫn giữ mọi grade và `clientReviewId`.

### P2 — Undo grade cuối không xóa snapshot cũ

Nguồn: `src/features/vocab/use-flashcard-deck.ts:86–90,124–134`, caller `src/features/vocab/flashcard-deck.tsx:21`.

Quẹt thẻ đầu → Undo → `batch=[]`, nhưng effect chỉ ghi snapshot khi batch >0. Storage vẫn giữ grade cũ; caller coi không có lượt chưa lưu nên có thể rời trang. Reload phục hồi grade đã Undo và bỏ qua thẻ đầu. Cần cập nhật/xóa snapshot khi Undo làm batch rỗng; kiểm reload sau Undo và sau Undo rồi grade khác.

### P2 — Bỏ qua onboarding không lưu thời lượng đã chọn

Nguồn: `src/features/onboarding/onboarding-view.tsx:48`, `src/contracts/settings.ts:52–66`, `src/app/api/v1/settings/preferences/route.ts:15–18`, `src/server/settings/preferences.ts:37–69`.

Client gửi `targetMinutesDefault`, nhưng schema preferences không nhận key này; `parseJson` bỏ key, `mergePreferences` cũng không merge thời lượng. Chọn45 → Bỏ qua nhận success rồi Today vẫn dùng30. Báo cáo discovery hiện ghi skip lưu thời lượng nên claim chưa đúng.

Cần nối field vào đúng contract/service lưu preferences hoặc dùng luồng đã có phù hợp; giữ flags và các lựa chọn cũ. Test phải đi qua parse schema → merge → `resolveDefaultTargetMinutes`, không chỉ test payload client.

### P2 — Listening vẫn nhận video demo khi nguồn thiếu

Nguồn: `src/server/learning/session/listening-session-data.ts:87–109`; caller mới `src/features/session/modes/listening/listening-panel.tsx:119–134`.

Client đã có warning thiếu video, nhưng service vẫn khởi tạo `uVSiFJ85EtM` và mốc95–155s; chỉ thay URL khi `seg.url` truthy. Nguồn thiếu/null vẫn phát video khác bài, warning không nhận trạng thái thiếu thật. Nguyên nhân đã có trước diff; vẫn là phần chưa đạt trong scope nguồn thật, trong khi report learning nói đã bỏ demo.

Cần trả `videoUrl=null` khi nguồn không có URL; xử lý mốc thiếu theo hợp đồng nguồn hợp lệ, giữ transcript gate. Không thay bằng video khác. Kiểm service payload nguồnnull/không cósegment và UI warning.

### P2 — Contrast chưa đạt ở chữ và biên input đã làm mới

Nguồn: `src/features/settings/account-card.tsx:15`, `src/features/settings/reminder-card.tsx:62`, `src/features/progress/recurring-errors-card.tsx:49,84`, `src/features/admin/dashboard-stats.tsx:55`, `src/features/library/library-filter-bar.tsx:37,43`; cùng các native inputs onboarding dùng `border-border`.

Tính từ token hiện tại: `#7b918d` (`slate400`) trên nền trắng = 3.35:1; text 16px của heading/body cần 4.5:1. Success text `#059669` trên nền trắng = 3.77:1. Biên `#dce5e3` trên nền trắng/paper chỉ 1.28/1.21:1; input trắng trong panel/trang sáng cần biên nhận diện đủ 3:1. `field-control` đã dùng `border-border-strong`, nhưng Library/onboarding vẫn tự dùng biên mờ.

Cần đổi đúng owning classes sang semantic text/strong field border; không tăng mọi đường viền trang. Đây là token/source evidence, chưa đo computed DOM. Kiểm cả disabled/focus/loading/error và các nền tint.

### P2 — Một số hành động vẫn thiếu điểm chạm44px

Nguồn: `src/features/admin/content/activity-edit-form.tsx:209–215` (“Thay bằng câu hỏi nhập tay”), `src/features/admin/wizard/step-review.tsx:147–154` (“Tạo bài khác”), `src/features/admin/wizard/step-source.tsx:126` (summary), `src/features/progress/revision-comparisons-card.tsx:105–110` (link luyện thêm).

Các owner đổi chữ16px nhưng hành động còn inline/không có padding hay min-height. Theo line-height hiện tại, vùng bấm có thể chỉ24–26px ở desktop và điện thoại rộng. Dùng Button hoặc inline-flex/min-h-11 phù hợp. Xác minh bounds thật >=44×44 và không gây tràn320px.

### P2 — Copy export hứa nhiều hơn payload thực

Nguồn: `src/features/settings/export-card.tsx:49`, `src/server/settings/export-data.ts:63–78,99–118,130–141`.

“Toàn bộ lịch sử học tập” và link tải âm thanh không có điều kiện, nhưng export bỏ submissions đã soft-delete; không gồm `vocabularyReviews`, `sessionEvents`, `drafts`; `downloadUrl` có thểnull. Cần mô tả đúng các nhóm dữ liệu thực xuất và link âm thanh khi tạo được. Không cần đổi backend hay chính sách dữ liệu cho lỗi copy này.

## Những concern đã đối chiếu và không coi là lỗi

- Modal: native `showModal()` đưa vào top-layer/inert nền; effect focus chỉ theo open; callback ref giữ Escape/backdrop dùng callback mới; `onCancel` target guard/stopPropagation chặn child YouGlish đóng parent; scroll lock đếm tầng. Các callers giữ `onClose=undefined` khi pending. Không suy ra focus/keyboard browser PASS từ nguồn.
- Tour/tabs/menu: giữ `data-tour`, deep links và 5 vùng; tabs rovingTabIndex + Arrow/Home/End; menu mở tới item, Escape/Tab/blur và logout error có retry. Tour không chạy trong focus routes. Cần probe route transition/native-dialog restore focus.
- Library: `useSearchParams` là trạng thái hiện tại, native History API Next16 nối search params; route force-dynamic không tạo static-Suspense lỗi. Parse URL nhận q/query/topic cũ, tham số lạ an toàn, serializer giữ unrelated params/hash; suggestion chỉ còn nếu activity nằm trong kết quả. Không yêu cầu viết lại URL vì abstract concern SSR.
- Settings: `activityId` text nonempty khớp DB; UUID của submission/media vẫn được giữ. Reminder request có ref khóa đồng thời; failure rollback enabled/time, success dùng response server. Copy delete hiện phân biệt soft-delete và best-effort storage cleanup, đúng service.
- Admin: collision POST409 không PATCH ID có trước. Các Set ghi ID sau POST thành công, tái PATCH chỉ đối tượng thuộc lần wizard hiện tại; reset tạo Set mới. Không yêu cầu thay bằng blanket upsert. Lost-response chưa được gọi là đã thành công/idempotent.
- Hint503/throw không mở trợ giúp; submit khóa khi hint pending. W2 lấy objective/feedbackGuide approved của W2; không dùng email mẫu chung. Reveal Listening vẫn do event accepted và service gate.
- Capture giữ câu gốc + provenance book/text/video/feedback; bản cha có submission ID/revision; câu nghe có timestamp. Ví dụ từ AI ghi sourceType feedback/myAttempt rỗng, không giả làm câu của learner.
- Autosave chờ request trước rồi lấy state hiện tại qua `stateRef`; lỗi lưu chặn thoát. Không coi version closure là lỗi vì service lấy/tăng version hiện tại từ DB. Disclosure giữ editor/recorder mounted; shadowing giữ blob retry.
- Flashcard giữ `clientReviewId` khi retry/restore; service conflict bỏ update SRS/usage. Exit save lỗi giữ batch; discard/cancel có chủ đích; hotkeys kiểm modal/input/loading. Written-review khóa input trong pending và giữ payload đã gửi.
- MyWork giữ original/issue/suggestion/example/retry_prompt/limitations; top 3/rest không bỏ observation, index flag vẫn từ mảng gốc; revision/compare link đúng submission. `modeSkill` mở đúng IELTS-speaking. Điểm hiển thị là ước tính luyện tập; pronunciation vẫn từ structured feedback.
- Progress giữ dữ liệu thật, assisted và thang mastery; Auth/error/offline dùng shared controls, offline có critical CSS riêng. Không thấy service nghiệp vụ hoặc migration bị sửa trong diff refresh.
- ESLint chỉ bổ sung ignore `.next` lồng nhau và artifact runtime copy `plans/reports/**/app/**`; owning source vẫn được lint. Không coi lượt scan generated Next bundle là lỗi nguồn hoặc PASS hiện tại.

## Đối chiếu toàn bộ acceptance

| Tiêu chí | Bằng chứng nguồn | Gate còn lại |
|---|---|---|
| Today 1 CTA, <=2 thao tác, hiển thị trước nav ở 375px | Continue ưu tiên; CTA mới một khối; duration loading bỏ dữ liệu cũ | DOM 375×812, tên dài, revision/noactivity/error chưa kiểm ở reviewer |
| Desktop/mobile320/375/768/1440 không overlap | Grid/containers/disclosure/tables đã tái bố cục | Render/keyboard viewport cần controller |
| Chữ16/control44/contrast | Shared Button/field-control và phần lớn feature đúng | FAIL các owning exceptions phía trên; cần computed styles |
| Nav/tour/IELTS/link URL | Năm vùng, MODE_META/registry, URL serialization giữ contracts | Browser back/reload/tour/menu cần probe |
| Library search/count/suggestion/empty | Scope đếm độc lập từng facet; suggestion thuộc visible | Browser/query/IELTS 0 cần probe |
| Wizard 4 bước/skip/re-entry/lưu lỗi | Fieldset/pending/focus error, blanks giữ nguyên | FAIL skip 45; success/error/re-entry browser cần probe |
| Bốn skill/editor/draft/timer/media | Shared shell/plugins và guard được bảo toàn | FAIL missing video; runtime autosave/timer/upload/audio cần probe |
| Hint/event/W2 + invariants | Accepted event trước reveal; W2 curated; server assisted/append-only không đổi | HTTP 503 → retry → assisted và provider thật còn mở |
| Feedback/revision/compare | Đủ observation fields/limitations; đúng revision links | Populated/pending/failed/compare browser còn mở |
| Flashcard/review/pending/hotkey/modal | Exit dialog và payload lock nối đúng | FAIL 2 storage cases; nested keyboard/focus runtime còn mở |
| Settings/Admin/copy | ID text/rollback/collision sửa đúng | FAIL export copy; HTTP rollback/admin partial retry còn mở |
| Lint/typecheck/unit/build + probes | Worker reports có scoped gates; controller thông báo 386 tests/typecheck | Reviewer chưa đọc full logs; không tự gắn PASS; build/probes cần controller |
| Render 375/768/1440/rubric/người dùng duyệt ảnh | Hướng thiết kế được duyệt triển khai | Không chấm rubric hoặc tuyên bố người dùng duyệt giao diện từ nguồn |

## Thứ tự xác minh tiếp

1. Sửa 4 behavior findings; test parse/merge thật cho skip 45, storage Undo/Vault lớn và missing video. Rà lại revision mới.
2. Sửa owning contrast/targets/export copy; kiểm computed DOM/state/bounds.
3. Controller dùng logs full lint/typecheck/unit/build và probe browser đã có; không rerun khi revision/input không đổi. Phân biệt source/package checks với provider/audio thật, DB Auth/RLS và người dùng duyệt ảnh.

Câu hỏi chưa giải quyết: Không có quyết định sản phẩm cần hỏi lại. Những gate runtime/visual trên còn thiếu bằng chứng, không phải PASS.

## Xác minh lại các sửa lỗi — 01:39 ngày 20/11/2026

Phạm vi lượt này chỉ gồm 7 findings ở trên, cùng helper focus dialog vừa thêm. Giữ nguyên findings và bảng ban đầu làm lịch sử; trạng thái dưới đây là nguồn hiện tại. Không sửa app, chạy lại test, browser, DB hoặc provider.

| Finding ban đầu | Trạng thái nguồn hiện tại | Bằng chứng |
|---|---|---|
| Restore Vault >200 làm mất batch | RESOLVED ở nguồn | `use-flashcard-deck.ts:58–85` dùng `fetchVocabularyList("all")`. API list lấy learner từ session; `getLearnerVocabulary` lọc learnerId, không limit. Restore giữ thứ tự snapshot và thay bằng nội dung hiện tại. Thiếu ID/lỗi mạng trả lỗi, giữ snapshot, có retry và discard chủ động. |
| Undo batch cuối giữ grade cũ | RESOLVED ở nguồn | Effect `use-flashcard-deck.ts:91–99` không chạm storage trong loading/error; sau tải thành công, batch rỗng gọi `clearDeckSnapshot()`. |
| Skip45 không persist | RESOLVED ở nguồn | `preferencesPatchSchema` nhận enum30/45; `mergePreferences` chỉ merge `targetMinutesDefault` khi gửi. Test mới đi qua schema parse → merge, giữ flags/giờ học cũ và từ chối60. `resolveDefaultTargetMinutes` đã đọc cùng key này. |
| Listening nhận demo sai nguồn | RESOLVED ở nguồn | `listening-source-media.ts` mặc định null/0/0; loader lấy metadata nguồn thật bằng helper, không còn URL demo hoặc mốc fallback95–155. Transcript gate không đổi. Hai unit cases kiểm nguồn thiếu và URL/mốc thật. |
| Contrast/biên field | RESOLVED cho các owner đã báo ở nguồn | `slate400=#607471`, `emerald600=#047857`; các field Library/onboarding/reminder đã dùng `border-border-strong`. Tính token: slate400/white4.96, slate400/paper4.69, emerald600/white5.48, strongborder/paper3.16. Cần computed DOM để nghiệm thu các state. |
| Hành động44px | PARTIALLY_RESOLVED | Nút thay câu hỏi và link Progress đã min-h-11. `step-review.tsx:148–154` “Tạo bài khác” và `step-source.tsx:126` summary mã định danh vẫn inline/không min-height; chưa đủ để đóng finding. |
| Copy export quá rộng | RESOLVED ở nguồn | Copy mới nêu hồ sơ/phiên/bài chưa xóa/nhận xét/sổ từ, link âm thanh chỉ khi tạo được, không gồm nháp/lịch sử lượt ôn; khớp payload thực. |

Modal: helper mới `containDialogFocus` dừng key propagation; Tab từ dialog hoặc cuối danh sách quay về đầu, Shift+Tab từ đầu/dialog về cuối; không có phần tử khả dụng thì giữ focus dialog. `Modal` tiếp tục effect `[open]`, callback ref, target guard cancel và scroll lock đếm tầng. Không coi source helper là bằng chứng nested iframe/native-dialog keyboard PASS.

### Nhánh liên quan trực tiếp đến lỗi tải flashcard còn mở

`handleFilterModeChange` reset reviews nhưng giữ `items/currentIndex` cũ. Khi fetch thất bại, `loading=false` và `error` có giá trị; `useDeckKeyboard` disabled và `handleCardDecision` không kiểm error. Với focus trên body, ←/A hoặc →/D ở màn lỗi có thể grade thẻ đang ẩn, đến thẻ cuối còn tự submit. Snapshot effect bỏ qua error nên các lượt ẩn không được lưu tạm. Nguồn: `use-flashcard-deck.ts:41–47,81–85,101–103,122–124,170–176`; `flashcard-deck.tsx:44–48`. Controller đã nhận concern; cần khóa tương tác khi error trước khi nghiệm thu nhánh load failure.

### Gate đã đọc, và phạm vi hiệu lực

- Đã đọc `verification-261120-0051-lms-refresh-artifacts/final-checks.json`: lint/typecheck/build exit0; logs tương ứng có lệnh thật, build Next16.3.6 compiled/static generation hoàn tất. Đây là revision **trước** các fix của lượt này, không quy thành current PASS.
- `unit-01.log` ghi48 files/386 tests PASS; bản này còn preferences7 tests, storage4 tests, chưa gồm các tests mới. Test nguồn hiện tại có preferences2 cases mới, source-media2, storage case ID ngoài200; reviewer không chạy lại hoặc suy ra đã PASS.
- Controller đang chạy checks sau sửa. Cần gắn logs của revision mới để đóng lint/typecheck/test/build. Browser/HTTP vẫn cần: Undo→reload; snapshot >200; loaderror không grade nền; missing video; skip45 reload; target bounds; native Tab/ShiftTab/Escape + nested YouGlish/focus/scroll; reminder rollback.

Status hiện tại: DONE_WITH_CONCERNS — 6/7 findings đã giải quyết ở nguồn; finding44 còn2 điểm và nhánh hotkeys/error đã nêu. Không có câu hỏi sản phẩm cần hỏi lại.

## Xác minh nguồn cuối — 01:50 ngày 20/11/2026

Status: DONE trong phạm vi re-review nguồn. Cả 7 findings ban đầu và nhánh phím tắt khi tải lỗi đã được giải quyết ở working tree. Các ghi nhận trước giữ làm lịch sử; không còn finding nguồn mở trong phạm vi đã giao.

Chỉ đọc lại 3 file hiện có (`use-flashcard-deck.ts`, `step-review.tsx`, `step-source.tsx`), helper mới `load-flashcard-data.ts` và test tương ứng. Không mở audit mới hoặc sửa app.

- `busy` của flashcard gồm `error !== null`. `handleCardDecision`, Undo/flip, gesture và `useDeckKeyboard` đều kiểm `busy`, nên màn lỗi không còn grade hoặc submit thẻ ẩn. Retry chủ động xóa error, đặt loading trước khi tải; snapshot effect vẫn bỏ qua loading/error.
- “Tạo bài khác” dùng inline-flex/min-h-11/padding; summary mã định danh dùng min-h-11/py-3. Cùng 2 owner đã sửa trước, finding44 đã đóng ở nguồn. Link “Xem trong Thư viện” ở Wizard done còn được chuyển thành một anchor44+ riêng, bỏ Button lồng trong Link.
- `loadFlashcardData()` giữ nhánh deck thường khi không có pending; pending lấy `fetchVocabularyList("all")` đã xác minh là toàn Vault của learner hiện tại. Restore giữ thứ tự và `clientReviewId`, dùng dữ liệu hiện tại. Không xác minh được ID thì throw; helper không có đường clear/mutate storage và caller catch giữ snapshot, đưa vào trạng thái lỗi có retry/discard chủ động.
- Ba unit cases mới kiểm lựa chọn API khi không có pending, pending ID ngoài200 đầu cùng `clientReviewId`, và reject khi ownership không xác minh được mà giữ pending. Đây là test luồng IO có ý nghĩa; không dùng kết quả mock làm bằng chứng DB/Auth/provider chạy thật.

Gate còn lại: controller đang chạy full checks sau sửa; reviewer chưa đọc kết quả của revision mới trong lượt này. Native-dialog/browser probes cuối, bounds/contrast computed, HTTP failure/retry và người dùng xem ảnh vẫn thuộc nghiệm thu runtime/visual. Không nâng logs trước sửa thành current PASS.

Câu hỏi chưa giải quyết: Không có. Không có source concern mở trong phạm vi re-review cuối.
