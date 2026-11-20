# Bản đồ UI cho thiết kế lại English Mini LMS

Ngày: 20/11/2026 · Phạm vi: đọc nguồn, tài liệu Lite và QA 19/11; không chạy browser, server, DB hoặc provider.

## Kết luận

Có thể thiết kế lại đồng bộ tại `globals.css` → primitive UI/layout → feature views, giữ nguyên route, service, schema học tập và plugin. Nên sửa các lỗi tương tác QA đã xác nhận trong cùng phạm vi nghiệm thu; thay màu/bố cục đơn thuần sẽ giữ lại lỗi ghi nhận hỗ trợ và mất đợt ôn.

Nguồn hiện tại: HEAD `a29c99e`, không có tracked UI edits khi scout; `.1devtool/` và các báo cáo QA là untracked có sẵn. Đọc README trước, bốn tài liệu bắt buộc và `.agents/rules/english-mini-lms.md`; dùng skill `ak-scout`. Các báo cáo QA ghi HEAD cùng revision nhưng scout không tự tái hiện runtime.

## Token, font, shell hiện tại

- `src/app/globals.css`: Tailwind 4 `@theme`; teal primary `#0d9488`, dark `#0f766e`, nền trắng/slate, bốn accent kỹ năng, `shadow-card`/`shadow-pop`, motion 160–200ms và reduced-motion. Comment giữ quyết định D-6 Medical Clinical & Calming, không dùng style trẻ em từ `design-system/MASTER.md`.
- `src/app/layout.tsx`: `Inter` qua `next/font/google`, subset latin/vietnamese, `--font-sans`; viewport theme teal; PWA metadata/register ở root.
- Primitive `src/components/ui/{button,card,badge,modal,tabs,toast,empty-state,skeleton}.tsx`: Button ≥44px; Card bo16px; Modal bottom sheet mobile/center desktop. Token semantic đã có nhưng Button/layout/feature vẫn dùng trực tiếp nhiều `teal-*`, `slate-*`, `red-*` — cần thống nhất nếu đổi art direction.
- `src/components/layout/main-shell.tsx` + `focus-routes.ts`: `/learn/*`, `/onboarding` ẩn chrome. Route thường: sidebar desktop≥lg240px; topbar mobile56px; bottom navigation64px+safe-area.
- `nav-items.ts`: Hôm nay/Thư viện/Bài của tôi/Sổ từ/Tiến độ; Settings/Admin qua UserMenu. Giữ route, `aria-current`, badge đến hạn và `data-tour` khớp `src/components/tour-steps.ts`.
- `page-container.tsx`: narrow `max-w-xl`, default `max-w-2xl lg:max-w-4xl`, wide `lg:max-w-6xl`; một số feature còn tự khai max-width/padding khác.

## Touchpoints và hợp đồng cần giữ

| Vùng | UI owners chính | Điểm nối/rủi ro khi thiết kế lại |
|---|---|---|
| Auth | `src/features/auth/login-form.tsx`, `password-login-form.tsx`, `magic-link-form.tsx`, `password-input.tsx` | Giữ hai cách đăng nhập, trạng thái sent/error và lời hướng dẫn cùng trình duyệt; không lấy demo làm proof Supabase auth. |
| Onboarding | `src/features/onboarding/onboarding-view.tsx`, `onboarding-header.tsx`, `step-{goals,schedule,skills,preview}.tsx` | Focus wizard4 bước, bỏ qua, quay lại; POST `/api/v1/onboarding`, PATCH preferences; `src/contracts/onboarding.ts`, `settings.ts`; không biến selfAssessment thành chứng nhận. |
| Today | `src/features/today/today-view.tsx`, `today-hero.tsx`, `recommended-card.tsx`, `start-controls.tsx`, `session-plan.tsx`, `continue-block.tsx` | Một CTA chính, chọn30/45, tiếp tục/đổi bài, lý do gợi ý, empty/error; `use-today-recommendation.ts`, `use-start-session.ts`; contracts today/session. |
| Library | `src/features/library/library-explorer.tsx`, `library-filter-bar.tsx`, `topic-filter-strip.tsx`, `activity-card.tsx`, `activity-detail.tsx` | UI server-owned metadata approved từ page; `filter-activities.ts` pure filter; `src/contracts/library.ts`; không đưa đáp án vào card/detail. |
| Học | `src/features/session/shell/{session-root,session-shell,shell-header,action-bar,session-columns,shell-overlays}.tsx`; `modes/{writing,reading,speaking,listening}/*-panel.tsx` | Page truyền data thuần vào SessionRoot; registry tra plugin trong client vì plugin chứa functions. Giữ `modes/types.ts`, `registry.ts`, `src/lib/modes.ts` và `src/contracts/{submission,session,media}.ts`. |
| Controller học | `src/features/session/shell/use-session-controller.ts`; `hooks/use-{session-timer,autosave-draft,submit,session-events,smart-capture}.ts` | Không remount/reset editor/recorder/timer do bố cục; giữ save thất bại chặn thoát, parentId revision, listening `staysAfterSubmit`, reveal gated. |
| Bài của tôi | `src/features/my-work/list/work-list-view.tsx`; `detail/{feedback-detail-view,priority-observations,submission-panel,feedback-panel,compare-view,detail-header}.tsx` | Giữ top3 ưu tiên, pending/failed/retry/flag, bản gốc/bản sửa và limitations; `use-revision-session.ts`, `use-assessment-polling.ts`, `src/contracts/submission.ts`, `my-work/types.ts`. |
| Sổ từ | `src/features/vocab/{vocab-list,vocab-filter-bar,vocab-item-card,flashcard-deck,flashcard,review-session,review-card}.tsx` | Tuple đầy đủ và mastery/due; `api.ts` + `src/contracts/vocabulary.ts`; batch chưa lưu, keyboard/gesture, mic/speech, YouGlish modal cần state-safe khi bố cục đổi. |
| Tiến độ | `src/features/progress/progress-view.tsx`, `progress-stat-cards.tsx`, `skill-breakdown-card.tsx`, `recurring-errors-card.tsx`, `revision-comparisons-card.tsx` | `src/contracts/progress.ts`, `hasSufficientData`, independent/assisted và evidence links; không thêm trend/band không có chứng cứ. |
| Cài đặt | `src/features/settings/settings-view.tsx`, `use-settings-data.ts`, `*-card.tsx` | GET settings parse chung; PATCH prefs, export/delete/signout cần trạng thái thật; `src/contracts/settings.ts`, `src/server/settings/*`. |
| Admin | `src/features/admin/admin-app.tsx`, `content/*`, `wizard/*`, `dashboard-*.tsx`, `drive-sync-*.tsx` | Tabs/table/form/wizard; giữ role guard, review_state, API ownership; `admin-api.ts`, `src/contracts/{admin-content,admin-dashboard}.ts`; không đổi nguồn đã có khi action là tạo mới. |
| Error/loading/demo | `src/app/_shared/{route-error-screen,loading-screen,not-found-screen}.tsx`; `src/app/offline/page.tsx`, `src/app/ui-preview/*` | Đồng bộ trạng thái với design system; demo chỉ phục vụ kiểm visual, không chứng minh DB/provider/auth. |

`src/app/(main)/*/page.tsx` là caller mỏng. `(main)/layout.tsx` giữ auth guard, learner identity, vocab due badge, ToastProvider/TourHost. Không chuyển nghiệp vụ vào route/UI để tiện bố cục.

## Lỗi QA đã xác nhận và owner khả dĩ

Nguồn: `plans/reports/qa-261119-1600-lms-ui-ux.md`; receipt browser/fixture của lượt19/11, không phải chạy lại hôm20/11.

| Mức | Lỗi đã quan sát | Owner cụ thể |
|---|---|---|
| P1 | W/R/S hint hiện khi event503; W1 nộp DB tạm vẫn `assisted=false` | `session/shell/use-session-controller.ts` bỏ qua boolean `postEvent`; `hooks/use-session-events.ts`; `shell/hint-bar.tsx`. Source hiện vẫn khớp nguyên nhân. Listening reveal503 giữ khóa đã PASS, không gộp sai. |
| P2 | Settings GET200 fail parse khi `activityId=W1/R1` | `src/contracts/settings.ts` đòi UUID trong `settingsSubmissionSchema.activityId`; `server/settings/service.ts` + `settings/use-settings-data.ts`. |
| P2 | Flashcards bỏ batch khi due/all đổi | `vocab/use-flashcard-deck.ts`, `deck-top-bar.tsx`, `flashcard-deck.tsx`. |
| P2 | ArrowRight quẹt thẻ nền khi confirmation mở | `vocab/use-deck-keyboard.ts`, `use-flashcard-deck.ts`, `flashcard-deck.tsx`. |
| P2 | Tab ra ngoài modal; timer kéo focus; Tabs/menu focus sai | `ui/modal.tsx`, `ui/tabs.tsx`, `layout/user-menu.tsx`, callback onCancel của `session-shell.tsx`; xử lý shared primitive trước. |
| P2 | Input vocab12/14px; nút36px; submit contrast3.744:1 | `vocab/vocab-item-card.tsx`, `review-card.tsx`, `deck-controls.tsx`, `my-work/detail/{flag-button,save-phrase-button}.tsx`, `session/shared/smart-capture-popup.tsx`, `session/shell/action-bar.tsx`, `globals.css`. |
| P2 | W2 summary80–100 từ nhận hint email hội nghị | `session/modes/writing/writing-hint.tsx`, `writing/index.ts`; hint cần khớp activity approved, không sinh curriculum mới. |
| P2 | Reminder PATCH503 vẫn hiện optimistic state | `settings/settings-view.tsx`, `reminder-card.tsx`, `use-settings-data.ts`. |
| Responsive/state | Vocab tràn320/768px; Review cho sửa lúc POST pending | `vocab/vocab-filter-bar.tsx`, `vocab-list.tsx`, `review-session.tsx`, `review-card.tsx`; không gán mất nội dung đã nộp nếu chưa có receipt. |

QA đã sửa phân loại V01: Câu của tôi PATCH/API/DB/reload giữ đúng UUID. Không đưa V01 vào scope như lỗi persist còn mở.

## Rủi ro chỉ từ source, chưa coi là bug runtime

- Library suggestion không theo topic/filter; IELTS selected có thể bị ẩn; placeholder search chủ đề nhưng haystack không có topic. Owners `library-explorer.tsx`, `library-filter-bar.tsx`, `filter-activities.ts`.
- Admin wizard create409→PATCH nguồn/segment cũ khi ID collision. Owners `admin/wizard/{step-source,wizard-submit,lesson-wizard}.tsx/.ts`; cần bảo vệ action tạo mới/reuse/replace cụ thể, không đổi quyền admin.
- Smart Capture luôn `source_type=book` dù Writing/Listening. Owner `session/shared/smart-capture-popup.tsx` và `hooks/use-smart-capture.ts`; giữ tuple/provenance đúng.
- Copy xóa audio vĩnh viễn chưa phản ánh Storage removal best-effort; `settings/submissions-card.tsx` và `server/settings/submission-mutations.ts`. Reminder delivery route ngoài repo chưa xác nhận; không nói thông báo đã hoạt động từ toggle lưu giờ.
- Vocab accordion header là div clickable chưa có bàn phím; `vocab-item-card.tsx`. Cần probe keyboard riêng khi acceptance gồm điều khiển bàn phím.

## Phạm vi thiết kế lại đề nghị

1. Chốt hướng trưởng thành, yên tĩnh, phù hợp BS. Minh trên nền teal/Inter đã có; tăng phân cấp nội dung, giảm các box lồng nhau, quy chuẩn heading/body/action; không tự đổi quyết định brand D-6.
2. Chuẩn hóa token và primitives: action color đủ contrast, input16px, target44px, focus/keyboard/dialog/feedback state. Giữ API props công khai nếu không có lý do đổi.
3. Đồng bộ main shell/navigation + toàn bộ learner views, onboarding/auth, focus học4 skill, feedback/compare/vocab/progress/settings; Admin/Offline/loading/error dùng cùng primitives, không dựng shell thứ hai.
4. Gộp sửa các lỗi QA xác nhận với kiểm hồi quy chính xác; source-only concerns cần probe trước nếu thay nghiệp vụ vượt phạm vi visual.
5. Nghiệm thu với dữ liệu thật hoặc fixture có nhãn:390/1280px và vùng320/768px, pending/error/empty/populated, keyboard/focus, save/re-entry, hint503 không reveal, batch không bị bỏ, settings mã activity text, W2 đúng hướng. Unit pass không thay browser/điện thoại vật lý/provider thật.

Giữ nguyên stack; append-only revisions, assisted server-derived, audio→not_assessable, practice_estimate/limitations, approved content, tuple sổ từ, private media, không clinic/patient data; không thêm Zalo/v2 hoặc dependency mới. Hoàn thành scout không cấp quyền sửa code, commit/push/deploy; controller giữ gate Implementation Plan của project.

Status: DONE_WITH_CONCERNS
Summary: Đã lập bản đồ token/shell/feature owners và các điểm nối contract; phân biệt lỗi QA runtime với source-only concerns.
Concerns/Blockers: Chưa tự chạy browser/DB/provider; hướng visual cuối và phạm vi implementation do controller xác định từ yêu cầu người dùng.
