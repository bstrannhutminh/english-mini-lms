# Review độc lập — redesign LMS

Ngày: 19/11/2026, Asia/Ho_Chi_Minh. Nhánh được giao: `feat/lms-architecture-ux-onboarding`. Đối chiếu dirty diff với `HEAD`, plan `261119-0417-lms-architecture-ux-onboarding` và phase 01–06. Báo cáo này giữ checkpoint **trước khi controller sửa các finding**; số dòng dưới đây thuộc nguồn đã đọc trong checkpoint, có thể dịch khi sửa.

Phạm vi: review-only; không sửa source, Git, DB, provider, secrets; chỉ tạo báo cáo này. Đã đọc README trước, luật dữ liệu, Lite track, product/contracts, plan/phase, caller liên quan. `CLAUDE.md` không tồn tại ở root. Áp dụng `ak-code-review` và spec compliance. Không chạy bộ test/build lặp với tester; chỉ chạy phép render hermetic nêu dưới. Không có bằng chứng browser, thiết bị thật, Supabase hay Gemini live.

## Finding có bằng chứng

### 1. P1 — “Lưu nháp & thoát” vẫn rời phiên khi lưu thất bại

- Nguồn: `src/features/session/shell/session-shell.tsx:98–106`; `src/features/session/hooks/use-autosave-draft.ts:40–56`.
- `saveNow()` trả `false` khi HTTP/network lỗi, nhưng handler bỏ qua kết quả và `router.push('/today')` trong `finally`. Confirmation hứa giữ bản nháp; state phiên chỉ ở bộ nhớ nên phần chưa lưu bị mất khi unmount.
- Tái hiện: viết thêm sau lần autosave gần nhất → chặn POST drafts hoặc mất mạng → Thoát → Lưu nháp & thoát → trang Today vẫn mở, quay lại không có phần mới viết.
- Phân loại: **lỗi handler có từ baseline**, redesign đưa nó vào nút Thoát mới luôn sẵn trong header; vì vậy đường data-loss được mở rộng. Không gán toàn bộ nguyên nhân cho redesign.
- Cần giữ người học trong phiên và thông báo retry nếu có nội dung cần lưu mà save trả false. Nội dung trống cần được xét riêng để vẫn thoát được.

### 2. P2 — Skip thất bại đưa người học trở lại wizard, không báo lỗi

- Nguồn: `src/features/onboarding/onboarding-view.tsx:45–68`; `src/app/(main)/today/page.tsx:35–40`; `src/features/onboarding/onboarding-presets.ts:128–134`.
- Catch của PATCH preferences vẫn đẩy `/today`; flag `onboardingSkipped` chưa lưu nên Today lại redirect `/onboarding`. UI không báo lỗi.
- Tái hiện: learner baseline pending, chưa skipped → PATCH preferences trả 503 → bấm “Bỏ qua, vào học ngay” → về wizard thay vì vào học, không thấy nguyên nhân.
- Mới trong redesign. Cần báo lỗi và cho retry; không coi navigation là skip thành công khi persistence thất bại.

### 3. P2 — Hydration timer bị hủy trong StrictMode; tick vẫn lệch deadline

- Nguồn: `src/features/session/hooks/use-session-timer.ts:38–59,63–75,86–90`; caller `src/features/session/shell/session-shell.tsx:58,98–107`.
- Với saved timer, effect đặt `hydratedRef.current=true`, rồi defer setState bằng `setTimeout`. React StrictMode setup → cleanup → setup xóa timeout lần đầu; setup lần hai bị ref chặn. Timer hiện đủ `targetMinutes` và chạy kể cả saved state đã pause/expire. Reproduce trong Next dev: pause timer, reload phiên cùng tab; stored paused state không được áp lại.
- Running tick lấy `prev-1` thay vì đọc deadline. Khi interval bị trễ/suspension, số trên màn hình lệch wall clock đến lần `visibilitychange` tiếp theo; pause có thể ghi lại remaining stale và kéo dài timer. Sync visible đơn lẻ chưa chứng minh đúng deadline mọi tick.
- Save & exit mới hứa “Tạm dừng phiên học” nhưng không `timer.pause()`; persisted deadline vẫn chạy ngoài route. Học 5 phút → lưu/thoát → chờ 10 phút → mở lại: mất thêm 10 phút dù đã chọn tạm dừng.
- Mới trong phần persistence. Test hiện tại của `timer-storage` chỉ kiểm hàm tính; không kiểm lifecycle hook/StrictMode/exit.

### 4. P2 — `/offline` bị auth guard chuyển tới `/login` lúc cài PWA

- Nguồn: `public/sw.js:5–22,85–90`; `src/lib/supabase/session-proxy.ts:84–90,100–115`; `src/components/pwa-register.tsx:7–12`; `src/app/layout.tsx:46`.
- Worker install `cache.addAll` có `/offline`, PwaRegister chạy ở cả login. `/offline` chưa thuộc public paths, nên install ở trạng thái chưa đăng nhập lấy response redirect/login và cache dưới key `/offline`; sau đó navigation offline trả trang login thay cho fallback đã thiết kế.
- Tái hiện có auth cấu hình: xóa registration/cache → mở login chưa đăng nhập, chờ worker install → tắt mạng, mở Today → xem response cache key `/offline` là login. Đây là suy luận theo caller/guard; chưa chạy browser/network.
- Mới do thêm offline route. Cần cho route công khai, đảm bảo worker cache đúng fallback; giữ nguyên không cache API/media/bài làm.

### 5. P2 — Word target hardcode làm W2 bị hướng dẫn sai

- Nguồn: `src/features/session/modes/writing/writing-panel.tsx:24–25,90–99`; nguồn học `content/english-lab/texts/w2-summary-ultrasound-prompt.md:1–7`.
- Mọi activity dùng 120–150 từ và màu inRange chung. W2 yêu cầu 80–100 từ; bài 90 từ đúng đề vẫn bị hiển thị chưa đạt mốc, hướng người học viết thêm sai yêu cầu. IELTS writing cũng đi cùng plugin nên không thể áp email target cho mọi biến thể.
- Tái hiện: mở W2 → gõ 90 từ → prompt ghi 80–100 nhưng counter ghi “khuyến nghị 120–150”. Mới trong redesign.
- Cần dựa trên nội dung/rubric/contract nguồn hiện có; nếu không có target xác nhận thì chỉ hiện word count, không tự áp mốc.

### 6. P2 — Tie-break theo hồ sơ chưa triển khai dù phase đánh dấu xong

- Nguồn: `src/server/today/pick-activity.ts:33–42,129–155`; `src/server/today/service.ts` caller `getLearnerPracticeContext` → `pickRecommendedActivity`; `src/app/(main)/library/page.tsx` cùng caller. Phase 03 yêu cầu learner priority/self-assessment khi số bài bằng nhau.
- PracticeContext không chứa goals/selfAssessment/priorities; query không đọc hồ sơ. Stable sort số bài giữ `writing` ở tie all-zero. Wizard preview (`onboarding-presets.ts:145–176`) chọn kỹ năng tự đánh giá thấp nhất, nhưng Today/Library không nhận dữ liệu đó.
- Tái hiện: learner mới, 0 bài ở 4 kỹ năng, có đủ approved candidate; chọn speaking=1, các kỹ năng khác=5 → preview ưu tiên Nói → Today vẫn chọn Viết. Đây là **thiếu requirement mới**, không phải regression thuật toán baseline.
- Cần truyền optional preference/self-assessment vào pure context, chỉ tie-break khi counts ngang nhau; giữ ưu tiên nháp → bản sửa và tính hermetic/deterministic. Không thay thứ tự dựa history khi counts khác nhau.

### 7. P2 — Reading Markdown mới có thể bỏ mất nội dung nguồn sau heading

- Nguồn: `src/features/session/modes/reading/passage-card.tsx:93–99`; `src/components/ui/markdown-text.tsx:14,29–35`.
- MarkdownText chia block theo dòng trống. Nếu block bắt đầu heading, nó chỉ render `heading[2]` rồi bỏ các dòng sau. Reading trước hiển thị toàn source text; đổi sang parser này mở lỗi mất đoạn gốc khi nguồn dùng heading rồi body ngay dòng kế.
- Phép kiểm đã chạy: `renderToStaticMarkup(React.createElement(MarkdownText, {text: '# Source heading\nThis source sentence must remain visible.'}))` → `<p class="font-bold">Source heading</p>`, body biến mất.
- **Parser defect có từ baseline**, nhưng mới ảnh hưởng Reading qua caller đổi trong diff. R1–R4 hiện có dòng trống sau heading nên các fixture đó không mất đoạn; nguồn approved không có invariant bắt buộc dòng trống.
- Cần giữ toàn bộ dòng nguồn khi render heading/body; thêm regression kiểm body còn tồn tại. Không chỉ chỉnh fixture để che lỗi.

## Ma trận nghiệm thu và gate bắt buộc

| Gate | Kết quả checkpoint | Bằng chứng / giới hạn |
|---|---|---|
| Acceptance / phase 01 Focus shell | Present ở source | MainShell dùng isFocusRoute; `/learn/*`, `/onboarding` ẩn AppNav; không chứng minh layout 390/1280 |
| Acceptance / phase 01 PWA | FAIL | PNG/manifest/zoom present; offline guard lỗi finding 4 |
| Acceptance / phase 02 wizard + first-run | Present một phần | 4 step, PATCH skip, POST completion; completion lưu baseline completed, skipped false, completedAt, tour flag; skip error finding 2 |
| Acceptance / saved default duration | PASS source | Today resolve 45 từ preferences → useTodayRecommendation → useStartSession gửi targetMinutes thật; không chứng minh DB live |
| Acceptance / phase 03 Today | FAIL một phần | Plain-Vietnamese reasons đã đổi; single RecommendedCard, bỏ QuickLinks; tie-break missing finding 6; above-fold/mobile chưa xem |
| Acceptance / phase 04 modes/timer | FAIL | 4 plugins giữ registry; timer, target từ, Markdown findings 3/5/7; ActionBar `fixed` có bottom padding shell, chưa chứng minh không overlap ở viewport/zoom/error dài |
| Acceptance / phase 05 library | PASS pure filtering; UI chưa đủ | Topic và uncategorized, modeSkill cho IELTS cả core-skill/dedicated IELTS, search accent-insensitive, status lấy learner-specific server state; query topic parse vẫn giữ; chưa browser |
| Acceptance / ≥44px targets | FAIL source | Font controls Reading `min-h-8 min-w-8`=32px (`passage-card.tsx:65`); rate controls YouTube `min-h-9`=36px. Mới/chạm trong diff |
| Acceptance / ≥16px fields | FAIL source | Select mới ở `library-explorer.tsx:125`, `vocab-filter-bar.tsx:65` dùng text-sm=14px; onboarding inputs, Writing/Reading/Speaking textarea đã text-base |
| Acceptance / colors/chrome | Present source | Primary action Teal tokens, skill badge theo existing mode palette; không chứng minh visual/contrast toàn app |
| Business regression / learning invariants | Không thấy đổi cơ chế | Không sửa submission/assessment/provider; assisted server-owned, append-only, text-only pronunciation not_assessable, practice_estimate/limitations và transcript server gate còn ở source. Test evidence do tester chịu trách nhiệm |
| Public contracts / ownership | PASS source trong diff | Preferences thêm optional onboardingSkipped additive; route dùng withLearner + parseJson; learner.id từ auth; auth chỉ gom projection/add baseline, không đổi role bootstrap; không migration mới |
| Pattern gate | PASS trọng tâm | contracts, withLearner, features/plugin shell; không thêm dependency; không đưa rule/phase ID vào code |
| Error gate | FAIL | Skip không báo thất bại, save-exit rời khi save false; submit timer.stop trước kết quả có từ baseline, không gán thành lỗi mới |
| Phase 06 tests/lint/type/build/review/docs | Chưa kết luận | Không chạy lặp full suite/build; chưa có ảnh desktop/mobile, real provider hay DB; checklist phase chưa là proof |

Các khoảng trống baseline liên quan trực tiếp acceptance: input Login `magic-link-form.tsx:78`, `password-login-form.tsx:87` và Vocab editor `vocab-item-card.tsx:183` vẫn 12–14px; `vocab-item-card.tsx:108–110` mới có chữ mức nhớ x/5, chưa có 5-dot mastery như phase 05 yêu cầu. Không gọi đây là lỗi mới của các file không sửa. Chỉ giữ làm acceptance chưa hoàn tất, không mở audit ngoài scope.

## Đánh giá simplification

Diff đã tách wizard thành header/step/presets, library pure filter và timer-storage: ranh giới hợp lý. Không đề xuất refactor toàn feature/domain. Các orchestrator >200 dòng (`session-shell`, `library-explorer`, `listening-panel`, `step-schedule`, `speaking-recorder`) còn phải cân nhắc theo luật repo; chỉ tách phần trình bày độc lập nếu làm giảm độ phức tạp thật. Không cắt scope đã duyệt, không thay thư viện hay public contract để giảm diff. Sửa 7 finding trước; diff size tự thân không là bug.

## Điểm cần kiểm tra lại sau sửa

1. Narrow tests cho timer StrictMode/background/pause, tie-break, renderer body, target từ và route public; full checks lấy từ tester trên revision mới.
2. Browser 390px/1280px cho wizard/skip, 30→45 saved default, 4 mode/IELTS, timer pause/reload/background, ActionBar error/zoom và library status/topic.
3. DB/provider/live-device chưa kiểm; không có proof để tuyên bố sẵn sàng production.

Câu hỏi chưa giải quyết: không có quyết định nghiệp vụ mới cần hỏi; cần controller xác nhận các sửa và reviewer kiểm revision mới.

Status: DONE_WITH_CONCERNS
Summary: Hoàn tất review độc lập checkpoint; 7 finding cụ thể, phân biệt baseline và requirement mới, các gate kích thước/visual chưa đạt.
Concerns/Blockers: Chưa re-review bản sửa; chưa browser/device/DB/provider; không coi checkpoint này là phê duyệt release.

---

## Re-review bản sửa — 19/11/2026, khoảng 12:19

Phần này thay kết luận checkpoint phía trên cho các finding đã sửa. Đọc lại source hiện tại và caller; không sửa source/Git/DB. **Không còn finding P1/P2 mới có bằng chứng trong phạm vi sửa được giao.**

| Finding checkpoint | Kết quả hiện tại | Bằng chứng nguồn |
|---|---|---|
| 1. Save-exit dù save false | CLOSED ở source | `session-shell.tsx:98–113`: có content mà save false → giữ route/state, đóng confirmation để error ActionBar hiện; content trống được thoát; chỉ pause và navigate sau điều kiện lưu đạt |
| 2. Skip error loop | CLOSED ở source | `onboarding-view.tsx:45–71`: catch đặt lỗi, giữ wizard; chỉ PATCH thành công mới push/refresh Today |
| 3. Timer StrictMode/deadline/exit | CLOSED ở source | `use-session-timer.ts:28–53`: mỗi setup đọc saved state, cleanup không chặn replay; mọi tick/visible tính deadline; pause lấy remaining hiện tại theo deadline (`58–66`); save-exit gọi pause. `timer.stop()` chuyển sau submit thành công (`session-shell.tsx:80–85`) |
| 4. Offline auth guard | CLOSED ở source | `session-proxy.ts:84–90` thêm `/offline` public; không đổi guard API/learner-media hay chính sách cache |
| 5. W2 word target | CLOSED + regression test | `word-target.ts` chỉ nhận range/minimum nêu trong prompt; `writing-panel.tsx:25–28,101–106` không tự áp 120–150 khi không có target. Test nguồn W1/W2 và IELTS minimum pass |
| 6. Hồ sơ tie-break + preview | CLOSED + regression test | `practice-context.ts:93–113` đọc goals của learner hiện tại, safeParse; có profile dùng cùng fallback selector như preview; không có profile giữ legacy count-sort. `pick-activity.ts:76–79` dùng shared selector; counts vẫn ưu tiên trước self-assessment/goals; nháp/bản sửa giữ ưu tiên cũ. Test mới tie mặc định wizard chọn S1 pass |
| 7. Markdown mất body | CLOSED + regression test | `markdown-text.tsx:29–35` render các dòng sau heading thay vì bỏ; test giữ body/list, HTML escape pass |

Đã đọc thêm sửa auth bootstrap sau lỗi do controller phát hiện ở browser: `auth.ts:26–29,63–75,93–104` dùng `onConflictDoNothing({ target: learners.userId })` ở cả real-login và dev insert, nếu insert thua race thì SELECT theo đúng userId. Không UPDATE/ghi đè role/preferences của row thắng, không đổi chính sách bootstrap admin, dev bypass vẫn gated `development`. Hướng sửa đúng nguyên nhân duplicate `learners_user_id_unique`; review này không tự chạy race DB, không coi source là proof live.

Dimension repairs kiểm nguồn: font controls Passage và playback-rate YouTube đều min-h/min-w 11 =44px; Library/Vocab select text-base=16px; Reminder switch target ≥44px và time field 16px; mobile brand link min-h-11. Các giới hạn baseline về Login/Vocab editor và 5-dot mastery ở checkpoint vẫn là giới hạn nghiệm thu toàn app, không tự biến thành đã sửa chỉ vì các controls mới đạt. Không kiểm lại mọi field/chrome của toàn app trong vòng sửa này.

Compatibility/business/public-contract gate của bản sửa: không thêm band/CEFR estimate, không đổi schema body/response học tập; profile selector là internal optional context, defaults legacy khi chưa có hồ sơ; nguồn word target lấy prompt approved đã trả cho panel; Markdown giữ React escape; ownership auth/query theo userId/learnerId; append-only, assisted, text-only not_assessable và listening server-gate không bị đổi. Không có dependency/migration mới trong các sửa này.

### Kiểm chứng thực chạy

- Lượt narrow đầu: 7 file / 32 test PASS — `markdown-text`, `learning-focus`, `onboarding-presets`, `word-target`, `timer-storage`, `pick-activity`, `filter-activities`.
- Sau sửa tie fallback thêm regression: chạy lại riêng `pick-activity.test.ts`, 10/10 PASS (trước 9 test). Không chạy lại các file không đổi.
- Chưa có lifecycle hook test thực React/StrictMode từ reviewer; timer được kiểm qua source và helper tests. Full lint/type/build/suite và browser do tester/controller đang thực hiện; không sao chép kết luận chưa có receipt.

### Conditional Simplify — kết luận độc lập

Đã đánh giá trên live diff, không bỏ qua gate: `git diff --shortstat` ở vòng cuối là **61 tracked file, 1396 insertions, 1687 deletions** (chưa tính untracked). Vượt ngưỡng 400 LOC/8 file; riêng diff onboarding 137+/181- cũng vượt 200 thay đổi đơn file. Vì vậy điều kiện review simplification đã kích hoạt.

Các tách cần thiết đã có: `practice-context.ts` 116 dòng sở hữu DB reads, `pick-activity.ts` 149–153 dòng sở hữu lựa chọn, `learning-focus.ts` 38 dòng chia sẻ ranking giữa preview và recommendation. `word-target`, timer-storage, library filter là hàm nhỏ có test cho quyết định sản phẩm. Split mới giữ caller import cũ qua re-export, không gây thay public contract.

Không thấy phần nào cần thêm abstraction hoặc refactor bắt buộc trước giao bản này. Các panel/controller >200 dòng còn nhiều JSX nhưng từng action rõ, chưa có bằng chứng lỗi vì chiều dài. Không yêu cầu cắt scope hay chia cơ học để đạt số dòng. Cần lưu ý “pure picker” vẫn re-export DB context vì compatibility, nên đây là tách trách nhiệm source, không tuyên bố module import hoàn toàn cách ly DB.

### Trạng thái nghiệm thu cuối của review

Source repair gate cho 7 finding: PASS. Business/public-contract/error compatibility trong phạm vi sửa: PASS source. Conditional Simplify: đã thực hiện, không còn thay đổi cần thiết được xác định. Full acceptance (mọi route/field, ActionBar 390/1280, hook trong browser, offline install, DB/provider/device): CHƯA ĐƯỢC REVIEWER XÁC NHẬN, nhận bằng chứng từ tester/controller ở bước tiếp theo.

Câu hỏi chưa giải quyết: không có câu hỏi nghiệp vụ/thiết kế mới; còn verification receipt của full checks/browser.

Status: DONE_WITH_CONCERNS
Summary: Đã re-review và đóng 7 finding ở source, xác nhận auth conflict repair và compatibility; narrow tests pass, Conditional Simplify hoàn tất.
Concerns/Blockers: Không có source blocker mới trong phạm vi sửa; cần full tester/browser proof và giữ rõ giới hạn baseline/full-app acceptance đã nêu.

---

## Review cuối sau Conditional Simplify

Đã đọc `code-simplifier-261119-1203-lms-redesign.md`, 7 sibling mới và caller; kiểm riêng controller/wrap-up sau hai sửa cuối. Phần này cập nhật kết luận source sau extraction. Không có source edit từ reviewer. Full checks/browser trên revision cuối do controller/tester xác nhận riêng.

| Extraction | Đối chiếu độc lập |
|---|---|
| `use-submission-list` | Giữ fetch schema API, mount-cancel flag, loading/error/retry và kết quả `submissions`; WorkList giữ local mode/status filter và revision-chain |
| `use-session-controller` | Giữ stateRef/autosave, timer sessionId, canSubmit/buildSubmission/parentId, stay-after-submit, events/hotkeys, capture/toast cleanup; SessionShell nối đủ props từ hook tới plugin/header/overlays/actionbar |
| `listening-lesson-header` | Chỉ nhận activity/submission/currentStage; assisted đọc submission server, không suy đoán; transcript/reveal/question state vẫn thuộc ListeningPanel |
| `speaking-upload-status` | Caller vẫn chỉ hiện khi có blob và đã dừng ghi; media ready/error/uploading, busy và callback retry truyền nguyên; không đổi audio upload/submission invariant |
| `library-filter-bar` | Giữ controlled query/status/skill/reset và topic-scoped counts; owner state/filter memo vẫn ở explorer; IELTS và learning-status logic không đổi |
| `vocab-page-header` | Giữ hai link review/flashcards, data-tour hook và markup; không đưa filtering/SRS state sang header |
| `onboarding-ielts-options` | Giữ none/academic/general, aria-pressed và controlled draft patch; không tự thêm band/điểm hay thay contract |

14 file gốc/mới của extraction hiện đều ≤200 dòng. Live tracked diff cuối đọc là **68 file, 1403+/1982-**, chưa tính untracked: Conditional Simplify đã kích hoạt và đã thực hiện. Những vùng tách có nhiệm vụ thật; không thấy cần thêm abstraction/refactor bắt buộc. Kết luận này dựa trách nhiệm/caller và preserved behavior, không dùng số dòng làm bằng chứng sản phẩm đạt nghiệm thu.

### Sửa thêm trong nhánh hết giờ

Review phát hiện hai đường lỗi còn bị wrap-up che sau vòng trước, cả hai có trước extraction; controller đã sửa và reviewer đọc lại source:

- `use-session-controller.ts:75–91`: save false → setError, đóng confirmExit và showWrapUp, giữ route/state. Empty draft vẫn thoát; success mới pause rồi navigate.
- `use-session-controller.ts:50–69`: sau awaited submit, đóng showWrapUp bất kể result; success mới stop timer. Điều này làm error ActionBar hiện khi POST fail, và cho Listening review/shadowing hiện ngay khi nộp thành công từ modal hết giờ. Không đổi submission append-only/payload/parentId.
- `wrap-up-modal.tsx`: chuyển sang shared Modal/Button/Icon, primary Teal, targets 44/48px, không functional emoji; copy không tuyên bố nháp đã lưu trước response. Modal z70, SubmitOverlay z100 nên overlay nộp vẫn ở trên; success/failure đóng wrap-up và shared Modal cleanup mở lại scroll nền.

Hai đường lỗi này **CLOSED ở source**; cần browser thực hiện expiry + save/submit failure để xác nhận runtime. Không coi read-only source review là đã chạy hai tình huống đó.

### Corrections kích thước và compatibility

Đã đọc diff các sửa browser của controller: Button `sm` min-h-11; Login email/password text-base + min-h-11, eye h/w11; My-work container max-width, status targets min-h11, empty library Link có min-h11; Admin ID links min-h/min-w11, status select min-h11/text-base, textarea shared bỏ text-sm; Settings admin link/Progress practice/Mobile brand min-h11. Đây là sửa kích thước/markup, không đổi auth/API/filter/value/schema. Login baseline field gap được đóng ở source trong vòng này. Không tuyên bố các baseline field khác hoặc 5-dot mastery đã sửa khi file tương ứng chưa đổi.

Reuse bằng chứng narrow tests ở phần re-review trước cho các pure helper không đổi. Báo cáo simplifier nêu 80 tests/11 files và ESLint14 files PASS: đó là receipt của simplifier, không phải lượt chạy riêng của reviewer. Full required checks và browser revision cuối đang do tester/controller thực hiện; reviewer không chạy trùng toàn suite/build.

Gate cuối trong phạm vi giao: extraction/callback/state/markup PASS source; sửa original7 và expiry error paths PASS source; business/ownership/public-contract/invariants không thấy regression; Conditional Simplify DONE. Không còn concrete P1/P2 blocker ở source được review. Nghiệm thu visual/runtime/toàn app cần receipt cuối riêng.

Câu hỏi chưa giải quyết: không có câu hỏi nghiệp vụ mới; còn full-check/browser receipt và giới hạn acceptance toàn app đã nêu.

Status: DONE_WITH_CONCERNS
Summary: Review cuối xác nhận 7 extraction giữ hành vi, đóng các nhánh lỗi expiry, giữ invariant và corrections kích thước; không còn source blocker cụ thể trong phạm vi.
Concerns/Blockers: Chưa tự xác nhận browser/device/DB/provider và full gates sau hai file sửa cuối; cần controller gắn receipt đúng revision.

---

## Receipt TodayView — một CTA chính khi có phiên dở

Đọc lại `src/features/today/today-view.tsx` và caller components `RecommendedCard`, `ContinueBlock` sau sửa cuối. Không sửa source, không chạy lại suite/build trùng tester.

- `today-view.tsx:62–73` chỉ đưa JSX RecommendedCard sang biến; giữ đủ activity/reason/targetMinutes/starting/onStart/alternateCount/swapping/onSwap.
- `87–107`: ContinueBlock vẫn hiện cho phiên dở. Khi có cả phiên dở và currentActivity, card gợi ý nằm trong native `details` không có `open`, nên mặc định đóng; summary ≥44px. Người học mở “Muốn chọn bài khác?” để dùng nguyên CTA/đổi bài, còn hành động tiếp tục phiên hiện trực tiếp như trước. Khi không có phiên dở, card gợi ý vẫn hiện trực tiếp.
- Local `selection.dataRef === data`, `handleSelectAlternate` → new_session và đóng drawer; `showAlternates`/close/currentId và `useStartSession(targetMinutes)` không đổi. Không đổi targetMinutes persistence/API/body/contracts.
- Loading skeleton, error+retry, empty state, dailyPlan, due-vocab và baseline reminder giữ nguyên điều kiện. Mục mở rộng không xóa card hay callback, không làm mất đường chọn bài/start/revision/continue vốn có.

Source acceptance cho thay đổi CTA ở trạng thái có phiên dở + bài gợi ý: PASS. Không thấy regression callback/state/render condition trong diff này. Screenshot/count CTA và thao tác details trên mobile/desktop cần browser receipt cuối của controller; không suy luận vị trí above-fold từ JSX.

Status: DONE_WITH_CONCERNS
Summary: TodayView giữ đầy đủ luồng gợi ý/đổi bài/start và trạng thái tải/lỗi/rỗng; mặc định chỉ ContinueBlock hiện CTA chính khi có phiên dở cùng bài gợi ý.
Concerns/Blockers: Không có source blocker mới; full checks/browser trên revision TodayView cuối đang do tester/controller xác nhận.

---

## Receipt offline tự chứa CSS — review delta cuối

Đã đọc lại `src/app/offline/page.tsx` và `public/sw.js` sau browser cold-cache finding của controller. Review source-only cho delta này, không truy cập mạng/DB hay chạy lại build trùng tester.

- HTML fallback có critical CSS ngay `<style>`; selector scope `.offline-fallback*`, dùng system font, màu/kích thước/card/scroll độc lập Tailwind/Inter/font file. Icon là SVG render trong HTML. Retry là native `<a href='/today'>`, không cần Next router/hydration/JS để điều hướng. Root vẫn có asset links/scripts, nhưng phần hiển thị và retry thiết yếu của fallback không phụ thuộc chúng.
- Main/headline/copy giữ ngữ nghĩa trang ngoại tuyến. Link cao tối thiểu48px, keyboard-focus outline rõ, `overflow:auto` cho nội dung dài/zoom. Không có loader chặn nội dung hay thao tác retry khi JS không tải.
- Reviewer đo contrast chữ trắng trên nền retry ban đầu #0d9488 =3.74:1, đã yêu cầu sửa; source hiện dùng #0f766e =**5.47:1**, hover #115e59. Khoảng trống contrast này CLOSED ở source; không xem đây là audit contrast toàn app.
- Cache namespace hiện `english-lms-shell-v4`; install lấy lại offline HTML, activate xóa cache namespace cũ. Không mở rộng cache API/auth/media/bài nộp; offline HTML chỉ có copy tĩnh, không dùng learner/profile/secret. `/offline` tiếp tục public như sửa trước, không đổi API/schema/ownership.
- Cleanup EOF `practice-context.ts` do controller báo là whitespace; không thêm behavior liên quan review này.

Source gate critical CSS/native retry/privacy/public-route/accessibility của delta: PASS. Không còn concrete source blocker trong phạm vi offline. Styled cold-cache/browser frame và build receipt đúng revision cuối do controller/tester gắn riêng; không biến source check thành bằng chứng thiết bị/provider/live.

Status: DONE_WITH_CONCERNS
Summary: Offline HTML đã tự chứa phần hiển thị/điều hướng thiết yếu, cache v4 cập nhật fallback; contrast retry được sửa đạt5.47:1, không đổi privacy/contracts.
Concerns/Blockers: Không có source blocker mới; reviewer chưa tự chạy browser cold-cache hay full build revision cuối, cần receipt controller/tester.
