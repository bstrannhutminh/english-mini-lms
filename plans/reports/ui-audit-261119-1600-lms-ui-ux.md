# Audit UI/UX từ nguồn — 19/11/2026, 16:00

Outcome: có vi phạm/thiếu hụt ở nguồn; **không phải kết luận đã test toàn UI bằng browser**. Rà các hành trình có dữ liệu và bàn phím còn thiếu trong QA trước; không sửa source/tests/env/Git hay báo cáo cũ. Áp dụng `ak-test` cùng practical principles, UI workflow, report format. Đã đọc README, AGENTS/project rules; giữ invariant và quyết định sản phẩm hiện có.

Authority: luồng Lite làm → nộp → góp ý → bản sửa, assisted tính từ event server; nguồn approved; full tuple Vocabulary Vault; mobile target ≥44px/input ≥16px; saving/loading/error phải rõ. Quy tắc bàn phím dựa ngữ nghĩa `role=dialog/tab/menu` mà app tự công bố, không yêu cầu focus trap cho panel inline. WCAG contrast AA normal text 4.5:1; large text chỉ được ngưỡng3:1 khi ≥24px thường hoặc ≥18.67px đậm. Không coi caption nhỏ là vi phạm input16px.

## Freshness và bằng chứng

- HEAD đầu/cuối: `a29c99e7fa2a854826dfb0935a61839ba262921c`. Tracked source sạch; thay đổi có sẵn: `next-env.d.ts`, untracked `.1devtool/`, đều không đụng.
- Fingerprint riêng của reviewer trên **430 file `src/` + `public/`**, theo path + bytes: `38b9003287574c340ee0202c106dc6bdbb7c685d7effd575aff650f4a5052e19`, giống ở hai lần đo. Đây là thuật toán reviewer, không thay fingerprint `06a3cd3` của controller.
- Có17 `page.tsx`. Rà route families qua owner/caller, không đọc mọi dòng của430 file và không suy luận coverage100% từ số file.
- Thực chạy chỉ2 probe hermetic không network/DB: library topic query và wizard409→PATCH dưới đây. Không thêm test/artifact/source; không chạy bộ suite/build trùng tester. Browser worker riêng nhận probe nhưng kết quả chưa nằm trong báo cáo nguồn này.

## 10 nhóm material, theo ưu tiên

### 1. P1 — Gợi ý có thể mở dù event hỗ trợ chưa ghi; thêm P2 nội dung hint sai bài

**Source-confirmed:** `src/features/session/shell/use-session-controller.ts:98–107` bỏ boolean của `postEvent('hint')`, luôn `setHintShown(true)`. `use-session-events.ts` trảfalse khi network/HTTP lỗi. `hint-bar.tsx` vẫn hiện nội dung và hứa bài sẽ gắn “Có hỗ trợ”. Server `create-submission-and-assess.ts:91–103` chỉ tính assisted từ event đã lưu.

Repro browser: `/learn/[writing-session]` → intercept POST events trả503 → Xin gợi ý. Expected: giữ gợi ý khóa và báo retry vì chưa có event. Source predicts: hint hiện. Nếu sau đó nộp khi chưa có hint/reveal khác, server không có bằng chứng để gắn assisted. **Client reveal đã chứng minh từ nguồn; nhãn bài sau nộp cần fixture/integration riêng**, không tuyên bố đã chạm DB. Listening reveal xử lý boolean đúng, không gán lỗi này cho tất cả reveal.

Nội dung riêng: WritingPlugin luôn dùng `writing-hint.tsx`, không nhận data; hint “Dear Organizing Committee”/conference abstract cũng hiện cho **W2 clinical summary80–100 từ** và IELTS Writing. Repro W2→Xin gợi ý với events200; expected hướng dẫn khớp prompt approved, source hiện hướng viết email hội nghị. Đây khác lỗi word-count đã sửa; không tự tạo hint/nguồn mới trong audit.

### 2. P2 — Đợt ôn flashcards chưa lưu bị bỏ khi đổi mode hoặc chuyển route nội bộ

**Source-confirmed:** `use-flashcard-deck.ts:58–63,73–85` đổi due/all rồi reset batch/history; không flush/confirmation. `deck-top-bar.tsx:28–35,47–66` có Link trở về Sổ từ và toggle mode; `beforeunload` tại100–110 chỉ dành unload document. Navigation Next/internal và mode-change không được handler này bảo vệ. MainNav vẫn hiện ở route flashcards.

Repro fixture ≥3 từ: `/vocab/flashcards` → quẹt1 thẻ → “Ôn tự do” hoặc nav Hôm nay. Expected: lưu hoặc hỏi bỏ kết quả trước khi reset/unmount. Source predicts batch bị bỏ, chưa POST quick reviews (chỉ auto-submit ở cuối bộ thẻ/finish). Browser cần ghi index/request; không dùng từ người học thật để tạo side effect.

### 3. P2 — Phím tắt flashcards vẫn thay đổi bài nền khi confirmation đang mở

**Source-confirmed:** `use-deck-keyboard.ts:27–43` chỉ loại INPUT/TEXTAREA, không loại dialog/button; ArrowRight quyết định “know”, Space preventDefault+lật. `flashcard-deck.tsx` giữ confirm local nhưng không truyền trạng thái này vào `useFlashcardDeck`; disabled tại `use-flashcard-deck.ts:212–218` chỉ busy/isFinished.

Repro: quẹt1/3→Kết thúc→confirmation “Lưu kết quả”→ArrowRight hoặc Space trên nút. Expected: thao tác chỉ trong dialog, batch bất biến đến khi chọn. Source predicts thẻ nền có thể đổi/batch thêm, Space có thể bị chặn activation native. Browser kiểm activeElement/index/body; đây là **mutation ngoài dialog**, không đếm lại như finding focus trap đơn thuần.

### 4. P2 — Keyboard semantics/focus thiếu ở controls có role công bố

- **Modal source:** `modal.tsx:48–62` chỉ focus panel/ESC/scroll lock, không trap/inert nền, không restore trigger. Effect phụ thuộc onClose; `SessionShell` truyền `onCancel` inline nên timer mỗi1s làm callback đổi, effect có thể focus panel lại khi người học đang Tab. Probe `/learn/*` active→Thoát→Tab vào nút→chờ1.2s; kiểm focus bị kéo về panel. Probe Settings confirm Tab/Shift+Tab đủ vòng và cancel→focus trigger. Runtime focus trajectory **browser pending**; thiếu cơ chế đã thấy từ nguồn. YouGlish có restore focus riêng nhưng vẫn không trap; không nói nó thiếu restore.
- **Tabs source:** `tabs.tsx:37–43,61–67` Arrow chỉ đổi selected, không focus tab kế/preventDefault/roving tabIndex. Probe Library focus All→ArrowRight→Enter: expected focus+selected đồng nhất; source predicts focus tab cũ, Enter có thể chọn lại tab cũ.
- **UserMenu source:** role menu/menuitem + aria-haspopup tại `user-menu.tsx`, chỉ ESC/pointer ngoài; không ArrowDown/Up vào item. Probe avatar Enter→ArrowDown/Up→ESC, ghi focus; không đòi chức năng menu không có trong UI.
- **Vocab source:** `vocab-item-card.tsx:88–92` accordion summary là onClick div không role/tabIndex/onKeyDown. Từ thứ2 trở đi mặc định đóng: keyboard không mở được vùng “Câu của tôi”. Probe fixture2words→Tab tìm header thứ2→Enter/Space.

Không phát hiện component Drawer/Sheet trong route owners đã rà. Today alternate picker là section inline, **không yêu cầu modal trap** cho nó.

### 5. P2 — Input populated Vocabulary/Review còn12–14px, Review label chưa nối textarea

**Source-confirmed:** `vocab-item-card.tsx:177–183` textarea “Câu của tôi” có label đúng nhưng text-xs/sm:text-sm =12/14px. `review-card.tsx:106–112` textarea cũng12/14px, label phía trên là span không htmlFor/id/aria-label; mode controls min-h32px. `save-phrase-button.tsx` trigger “Lưu cụm từ” min-h9=36px; SmartCapture close/error-close chưa có target44px.

Repro browser390px: mở vocab populated item, `/vocab/review` fixturedue, mở capture từ nguồn. Đo computed font/target trên **input/control** cụ thể. Expected ≥16px fields/≥44px targets theo rule. Không đếm tất cả caption/text-xs thành bug; long medical prompt12px là vấn đề readability cần xem visual, tách khỏi vi phạm field rõ ở đây. Login/Onboarding/Session textarea đã sửa16px, không lặp finding cũ đã đóng.

### 6. P2 — Contrast primary action thường chưa đạt4.5:1

**Exact source:** `globals.css:14` primary=#0d9488, ActionBar submit tại `action-bar.tsx:60` bg-primary/text-white, text-base16px/font-semibold600. Contrast trắng/#0d9488 tính theo relative luminance =**3.74:1**, không đủ4.5 normal text. Button48px cao không làm font16px thành large text.

SharedButton dùng bg-teal-600, installed Tailwind4 token `oklch(60% 0.118 184.704)`; **không tự gánhex0d9488** cho token này. Browser lấy computed color rồi CSS Color4 conversion để đo đúng. Offline retry đã#0f766e =5.47:1, không lặp lại như lỗi còn mở. Đề xuất dùng token Teal đậm đã có cho nền active normal-text; giữ brand, không đổi palette toàn app trong audit.

### 7. P2 — Topic/search/filter feedback Library không nhất quán

**Source-confirmed:** `library-explorer.tsx:36,89,92–94` đổi topic local nhưng suggestion prop ban đầu không đổi; SuggestionsStrip chỉ ẩn theo query, không theo topic/skill/status. `library-filter-bar.tsx` ẩn IELTS tab khi topicScoped count0 nhưng owner không reset selected skill, có thể không còn tab selected và grid0. Query placeholder có “chủ đề” nhưng `filter-activities.ts:56–61` không search topic/name.

Repro: `/library` suggestionWriting→chọn topicReading, inspect recommendation cònWriting; chọn IELTS→đổi topicwithoutIELTS, inspect selectedtab/result; nhập tên chủ đề. **Pure probe đã chạy:** activity titleUltrasound/topicdoc-sach-y-khoa, query đúng tên `Đọc–dịch & kỹ thuật y khoa`→count0. Expected suggestion/bộ lọc phản ánh phạm vi hiện tại và lời hứa placeholder. Ba triệu chứng cùng owning filter feedback, không cộng thêm như route errors khác.

### 8. P2 — Wizard “bài mới” tự PATCH nguồn/segment cũ khi ID collision

**Source-confirmed:** `step-source.tsx:25–32,54–62` auto sourceId theo title; `wizard-submit.ts:36–48` create409→PATCH existing mà không hỏi reuse/replace; caller `lesson-wizard.tsx:89–125` áp lên source, segment, activity. New wizard chỉ nhận existingActivityIds, không source/segment inventory.

Repro isolated/intercept: tạo lesson mới cùng title của nguồn trước nhưng URL/transcript khác; sourceId/segmentId collision. Expected không thay nội dung lesson cũ dưới hành động tạo mới nếu chưa chọn reuse/replace. **Hermetic probe chạy thực:** createFn ném ApiClientError409→updateFn nhận `src-yt-same-title` cùng URL mới. Tác động tới bài approved cũ phụ thuộc reference DB, **chưa kiểm live**; nguyên nhân PATCH collision đã xác nhận. Giữ retry idempotence đúng phiên tạo dở, không đề xuất đảo quyền curator/admin hay chặn sửa nguồn có chủ đích.

### 9. P2 — Capture ngoài sách vẫn lưu provenance source_type=book

**Source-confirmed:** `smart-capture-popup.tsx:102–111` luôn source_typebook; `use-smart-capture` caller Writing/Listening truyền sourceRef “Bài viết…”/“Bài nghe…”. VocabFilterBar hiển thị book là “Sách / tài liệu”.

Repro fixture `/learn/[listening-session]` reveal đúngservergate→chọn thuật ngữ transcript→mocklookup→intercept POSTvocabulary. Expected provenance đúng video/transcript, source predicts `source_type:'book'`. Tương tự email Writing. Full6tuple cơ bản vẫn có phrase/ipa/context_meaning/original_sentence/source_ref/my_attempt; **không cáo buộc thiếu example_sentence** vì field đó không thuộc tuple persisted contract. Không có bằng chứng nguồn clinic/bệnh nhân thật bị dùng.

### 10. P2/P3 — Settings promises cần phân biệt persistence, delivery và xóa audio

**Source-confirmed data-control gap:** `submissions-card.tsx:61–62,confirmation` hứa audio bị xóa vĩnh viễn; `submission-mutations.ts:64–77,104–117` soft-delete trước, storage remove best-effort, có thể skip vì config hoặc bỏ qua lỗi, không phản hồi failure riêng tới UI. Expected chỉ xác nhận xóa audio khi storage đã xác nhận hoặc nêu trạng thái còn chờ/lỗi. **Không kết luận file nào thực còn trên Storage**, cần isolated mocked remove-error/integration riêng; không sửa policy giữ lịch sử soft-delete đã được chọn.

**Delivery gap, chưa tính như live defect:** ReminderCard hứa “Thông báo nhắc nhở…”; search bounded `src/public/scripts` chỉ thấy keys ở auth/preferences/contracts/settings, không thấy Notification/push/send consumer. Lưu toggle/time có thật; cơ chế gửi ngoài repo không kiểm. Cần controller xác minh operational route trước tuyên bố notification hoạt động. Đề xuất copy phân biệt “lưu giờ học” và “gửi thông báo” nếu không có delivery route.

**Browser-pending hypothesis:** `settings-view.tsx:57,74–79` optimistic setReminders không rollback503. Probe GETfalse→PATCH503→toggle, đọc switch sau toast và sau reload. Chỉ kết luận UX misleading khi browser chứng minh state thất bại vẫn trông đã bật; nguồn không tự chứng minh cảm nhận này.

## Ma trận route families đã rà

| Family | Owner / hành trình nguồn | Kết luận bounded |
|---|---|---|
| Root/Login/Offline | Auth form, PasswordInput, offline criticalCSS/native retry/public route | Source labels và field16px Login đúng; offline tự chứa, contrast retryđãđúng; auth live không chạy |
| Main shell/Tour/Menu | AppNav/Focus routing/Tour/Modal/Tabs/UserMenu | Focus route pattern đúng; keyboard gaps nhóm4; không thấy Drawer owner |
| Onboarding | 4steps, POSTfinish/PATCHskip, sharedfocus/defaultminutes | Skip failure giữwizard và báo lỗi; completion/default đã sửa trước, không gán stale finding |
| Today | Continue/detail recommendations/alternate/reset dataRef | Một primary CTA default khi phiên dở+currentActivity; targetMinutes flow giữ; browser abovefold không tự chứng minh |
| Library/detail | Filter/search/status/topic, approved safe shape, start/revision link | Nhóm7; server-list không chọn rubric/answers; ownership query có learnerId |
| Learn4skills+IELTS | Registry, controller/timer/hints/events/media/submit/capture | Timer/save/expiry failure repairs còn ở source; hint integrity và content nhóm1; speaking text-only vẫn not_assessable; Listening reveal guard đúng |
| Vocab/list/edit/capture | Fulltuple, source filter, myAttempt/mastery | Nhóm4/5/9; mastery0–4 hiển thị x/5 là quyết định đã chốt, không đề xuất đổi thang |
| Vocab/flashcards/review | Batch/finish/retry/undo/modal/hotkeys/microchallenge | Nhóm2/3/5; savefail route có retry/abandon rõ, không coi empty-state là đã test populated |
| MyWork/list/detail/compare | Poll queued/processing, retryfailed, revisionparentId, savephrase, audio | Source append-only/owner preserved; compare responsive source classes, không visualproof. SignedURLexpiry browser-needed, không tự gọi TTL là bug |
| Progress | Evidence/insufficient-data/skill/revision | Giữhonest insufficient-data/source; các caption/excerpt12px chỉ readability recommendation, không input violation |
| Settings | Account/password/reminder/guide/export/delete/logout | Nhóm10; exportJSON scopedlearner+signedURLs, không currentprivatefile access. SDKsignOut currentpackage có cleanup localsession kểcả một số remoteerrors, nên không gán giả “awaitsignOut error chắc chắn vẫnloggedin” |
| Admin/edit/wizard | Label wrapperFields/source+segment+activity/approve/retry | LabelsField wrapinput nên có association; nhóm8. Không chỉnh data thật/approval/DB |
| UI preview | Demo route và sharedcomponent owners | Không test live, không dùng demo như proof auth/provider/userdata |

## Probe browser còn cần, không thay thành pass

Ưu tiên: hint event503; active-timer confirmation focus reset; flashcardmode/nav discard và keyboard modal; populated Vocab field/expander; Library topic/IELTS/search; sourcecollision request trace; Settings switch503. Đã gửi exactpaths/lines tới controller/browserworker. Dùng fixture/intercept được phép; không cần gửi real clinical/user data.

Additional bounded hypothesis: ReviewCard textarea/mode vẫn editable khi submitpending (`review-card.tsx:106–112`, `review-session.tsx:61–95`). DelayedPOST→edittext→result→Next có thể làm phần chưa gửi biến mất. Cần browser cho thấy thực unsent edit mất trước khi thêm như finding độc lập; không mở thêm suite hay sửa code. MyWork signedaudio10min expiry cần error/refresh probe nếu acceptance yêu cầu nghe sau phiên mở lâu; không thay TTL đã chọn.

## Recommendations, không phải defect counts

Đọc dài trên điện thoại: cân nhắc tăng thân đoạn y khoa/microchallenge/feedback từ12px lên14–16px theo context, giữ caption ngắn gọn; xem visual390px có dữ liệu trước. Đồng bộchromeTeal/inlineSVG còn thiếu ở populated secondary views khi owner muốn; không coi mọi emoji trong nội dung là lỗi chức năng. Dùng semantic link/button cho expand và navigation, không đổi workflows/user thresholds từ concerns abstract.

Mandatory gates: source freshness PASS trong scope đọc; route-owner audit DONE;2hermeticprobes thực chạy. Browser/render/accessibilitycomputed/liveprovider/DB/patientboundarytest không tự chạy. Không claim toàn app green, performance, speedup/costsaving hoặc zero provider cost. Không có process/server/browser do reviewer tạo; không có cleanup runtime cần làm.

Status: DONE_WITH_CONCERNS
Summary: Hoàn tất audit nguồn trên các nhóm màn hình của 17 page routes; 10 nhóm rủi ro đáng kể, nổi bật event gợi ý, mất đợt ôn flashcards, bàn phím/accessibility, bộ lọc chủ đề và collision nguồn quản trị. Đã chuyển probe browser cụ thể cho controller.
Concerns/Blockers: Chưa có receipt browser cho các rủi ro; audit nguồn không chứng minh runtime/visual/DB/provider. Không sửa nguồn; controller cần tổng hợp browser và xác định scope sửa khi người dùng yêu cầu.

---

## Điều tra bounded K01 / V01 — response Settings và lưu myAttempt

Theo yêu cầu controller sau browser: Settings hiện “Máy chủ trả về dữ liệu không đúng định dạng mong đợi”, Account fallback sai tên/vai trò; Vocab GET có4 từ nhưng lần lưu myAttempt chưa được thấy sau reload. Đọc đúng route/service/schema và chạy probe hermetic, không gọi app/DB/Supabase hoặc sửa source.

### K01 — P2 contract mismatch đã xác nhận bằng nguồn và parse

Request của `use-settings-data.ts:49` là **GET `/api/v1/settings`**, không phải `/me`; không tìm thấy `/me` route trong inventory API hiện tại. Route `api/v1/settings/route.ts` trả nguyên `getSettingsOverview(learner.id)`.

Expected envelope: `{ learner: LearnerProfile|null, submissions: SettingsSubmission[] }`. Projection learner khớp `learnerProfileSchema`: idUUID, displayName string|null, rolelearner/admin, preferencesobject|null, timezone string|null, createdAtstring. **Mismatch nằm ở submissions[].activityId**:

- `contracts/settings.ts:26` dùng `uuidSchema` cho `activityId`.
- `server/settings/service.ts:31` trả `activities.id`; `db/schema.ts` khai báo `activities.id`/`learningSessions.activityId` là **text**, các giá trị thực hợp lệ như `W1`, `R1`, `IL1`.
- Probe hermetic với learner hợp lệ + một submission activityIdW1 trả `success:false`, issue nguyên văn `{path:['submissions',0,'activityId'], code:'invalid_format', message:'Invalid UUID'}`.
- `api-client.ts` chuyển schema rejection dù HTTP200 thành `ApiClientError code='invalid_response'`; `use-settings-data.ts` catch giữ `data.profile=null`, nên Account hiển thị fallback “BS. Minh”/Learner. GET không submissions sẽ không lộ lỗi này, giải thích vì sao empty-screen QA chưa bắt.

Đây là lỗi contract **P2 confirmed**, không do reload quá nhanh. Browser cần gắn raw HTTP200 payload shape và console issue path để nối đúng receipt K01; không cần ghi dữ liệu thật để tái hiện. Không thay loại mã activity hay learnerUUID; owning contract cần phản ánh activity text khi scope sửa được cho phép.

### V01 — chưa xác nhận response mismatch; source roundtrip PASS

Luồng nguồn: `VocabItemCard.handleSaveAttempt` → `vocab/api.ts patchVocabulary` → PATCH `/api/v1/vocabulary/[id]` → `parseJson(updateVocabularyRequestSchema)` → `updateVocabulary(id,learner.id,body)` → `{vocabulary: toVocabularyItem(updated)}`.

Request field names/types **nguyên văn**:

| Field | Type |
|---|---|
| `my_attempt` | string, optional |
| `mastery_level` | integer0–4, optional |
| `context_meaning` | string, optional |

Expected response **`{vocabulary: {...}}`**, cùng `vocabularyItemSchema` mà list GET dùng cho từng item:

| Field | Type |
|---|---|
| `id`, `learnerId` | UUID string |
| `phrase` | string |
| `ipa`, `contextMeaning`, `originalSentence`, `sourceType`, `sourceRef`, `myAttempt` | string hoặc null; key vẫn bắt buộc |
| `masteryLevel` | integer |
| `dueAt`, `createdAt`, `updatedAt` | string; serializer chuyển Date thành ISO |

`capture.ts updateVocabulary` map `my_attempt`→`myAttempt`, UPDATE theo cả vocabId/learnerId, `.returning()`, rồi `toVocabularyItem`. Serializer/payload hiện không khác tên/envelope giữa PATCH và GET. Probe hermetic với row Drizzle-shape và `myAttempt:'Saved attempt'` → `updateVocabularyResponseSchema.safeParse({vocabulary:toVocabularyItem(row)}).success === true`.

Vì vậy **không gán V01 thành cùng lỗi K01**. Chưa có raw PATCH response/client issue hoặc DB trước/sau để phân biệt mutation chưa xong lúc reload, owner404/server lỗi, response thực lệch fixture/schema, hay state UI. Cần browser/controller ghi status+body shape (không secret), đúng `vocabulary.myAttempt`, console schema issue nếu có; chờ toast “Đã lưu câu của tôi!”/request complete trước reload, sau đó so DB/GETbefore-after. Không đọc DB hay tạo sửa source trong điều tra này.

Status: DONE_WITH_CONCERNS
Summary: K01 được xác nhận: Settings submissions[].activityId nhầm UUID trong khi activity code là text, làm toàn hồ sơ HTTP200 fail parse. V01 PATCH vocabulary source/serializer roundtrip khớp schema; chưa đủ bằng chứng để kết luận lần lưu lỗi.
Concerns/Blockers: Cần raw PATCH/GET và DB before-after receipt của browser/controller cho V01; không được coi reload chưa chờ response là proof không persist.
