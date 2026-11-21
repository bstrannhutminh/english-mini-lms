# English Mini LMS — Premium Learning Studio Redesign

**Loại:** Implementation Plan / handoff cho Coding Agent  
**Ngày:** 20/11/2026  
**Trạng thái:** Đề xuất đã được người dùng đồng ý về hướng **Dashboard tinh gọn**; chưa coi toàn bộ mã nguồn đã nghiệm thu  
**Workspace:** `ssd_mes` → `AI4A/english-mini-lms` (`Y:\AI4A\english-mini-lms` trên Windows)  
**Đích:** Nâng cấp giao diện *thực sự*, không phải chỉ thay màu, shadow hoặc bo góc.

## 0. Quyết định thiết kế và mục tiêu

**Hướng thẩm mỹ:** Premium Learning Studio — sáng, ấm, tinh tế, trưởng thành, tập trung vào học tiếng Anh công việc/y khoa. Teal là màu nhận diện và CTA, nền trắng/ngà dịu, một ít sắc phụ tiết chế. Không game hóa trẻ em, không rải gradient/pastel trên tất cả card, không thêm KPI/huy hiệu giả.

**Nguyên tắc:** **Một hành động chính trên mỗi màn.** Trên `/today`, đó là *Bắt đầu/Tiếp tục bài học hôm nay*. Mọi thứ khác phải hỗ trợ, không tranh vị trí.

Người dùng đã đồng ý rõ phương án:
> **Dashboard tinh gọn:** Một khu vực học chính thật nổi bật, lời chào gần gũi, CTA lớn và nội dung phụ có thứ bậc rõ ràng.

**Định nghĩa hoàn tất:** Mở trang thực tế thấy khác biệt cấu trúc rõ ràng ở cả 375px và 1440px, so sánh được với ảnh concept, người dùng xem và chấp thuận. Không đánh dấu DONE chỉ vì đã sửa class CSS hoặc lint pass.

## 1. Preflight — bắt buộc trước khi ghi file

1. Đọc `AGENTS.md`, `.agents/rules/english-mini-lms.md`, `docs/plan/lite-mvp-track.md`, `docs/plan/product-design.md`, `docs/plan/data-and-tools-contract.md`, `PROJECT_CONTEXT.md`, `plans/261120-0013-lms-visual-refresh/{plan.md,state-current.md}` và mã nguồn thực tế liên quan. Tuân thủ hướng dẫn Next.js 16 ở `node_modules/next/dist/docs/` khi động vào API/framework.
2. `git status --short --branch`, `git diff --stat`, `git diff -- <file>`; xác minh agent/process đang chạy và nhánh/thư mục thực. Repo hiện có **nhiều thay đổi chưa commit**, gồm hàng chục UI file và nhiều file học liệu/Vocabulary/DB từ các công việc khác. Không `reset`, `checkout`, `clean`, `stash` hoặc ghi đè các thay đổi chưa hiểu nguồn gốc. Nếu lỗi `dubious ownership` trên SMB, không sửa Git global config; dùng lệnh local một lần nếu an toàn hoặc nhờ owner kiểm tra.
3. Xác định người dùng đang mở **URL nào**, port nào, server có chạy từ **repo thật hay bản copy preview** (`plans/reports/local-preview-.../app`), và hash/version source mà preview đang phục vụ. Chụp baseline bằng browser độc lập (không sử dụng session có dữ liệu thật), ở **375×812, 768×1024, 1440×900**. Ghi rõ URL, route, state, thời điểm.
4. Đối chiếu tất cả sửa đổi UI chưa commit. Nếu cần thay/loại bỏ các lớp trang trí do đợt `Lively Learning Studio` trước thêm trong `globals.css`, bảo toàn từng phần khác của file và báo diff. Không coi style đó là thiết kế cuối.
5. Không chạm `.env.local`/secret, DB migrations, seed, production, dữ liệu bệnh nhân, provider, nội dung học ngoài phạm vi. Không tự push/deploy.

**Deliverable preflight:** báo cáo ngắn: working tree, file ownership, URL preview, ảnh trước, danh sách file sẽ sửa, rủi ro. Nếu gặp xung đột source đang được agent khác sửa, dừng file đó và báo cụ thể.

## 2. Design specification — ràng buộc chung

- Font: Inter hiện có; hierarchy bằng **size, weight, line-height, whitespace**, tránh hàng loạt thẻ có cùng trọng lượng.
- Màu: teal cho primary action, neutrals ấm cho background; skill accents từ `src/lib/modes.ts`/`MODE_META`, không tự ý tạo bảng màu cho mode khác nguồn sự thật.
- Mobile: chữ nội dung và nhãn tương tác tối thiểu **16px**, touch targets **≥44×44px**, contrast chữ có nghĩa **≥4.5:1** và UI có nghĩa **≥3:1**; xem safe-area/keyboard.
- Desktop: nội dung đọc 60–70ch, dùng grid có chủ đích; responsive không phải chỉ thu nhỏ desktop.
- Tránh **nested card**, quá nhiều badge, đường viền và gradient đậm; tối đa một vùng nhấn mạnh cấp 1 trong viewport chính.
- Motion tinh tế 160–200ms và `prefers-reduced-motion`.
- Không tạo thông số/tính năng giả: streak, tỷ lệ hoàn tất, số bài/từ, điểm, AI feedback đều phải từ contract thực hoặc ẩn/empty state.
- Dùng `src/components/ui`, `src/components/layout`; giữ data-tour, keyboard/focus semantics, ARIA, link routes, URL filters.

## 3. Phase 1 — Dashboard `/today` (ƯU TIÊN SỐ 1, visual gate)

### 3.1 Desktop: composition mới

Bố cục đề xuất theo thứ bậc thị giác:

```
[Sidebar điều hướng]  [Chào + mô tả 1 dòng]            [30 | 45 phút]
                      ┌──────────────────────────────────────────────┐
                      │ NHẮC NHỞ NHẸ: Buổi học hôm nay               │
                      │ [KỸ NĂNG] [THỜI LƯỢNG]                      │
                      │ TÊN BÀI LỚN — 2-3 DÒNG TỐI ĐA              │
                      │ Mục tiêu học ngắn, rõ                       │
                      │                                             │
                      │ [ BẮT ĐẦU / TIẾP TỤC HỌC → ]                │
                      │ Đổi bài · Xem đề bài                        │
                      └──────────────────────────────────────────────┘
                      [Lộ trình 4 bước gọn]  [Từ đến hạn / Tiến độ]
```

- Hero **chiếm trọng tâm**, không chỉ là một card giống các card khác; typography và khoảng trắng đưa mắt về CTA.
- Lời chào cá nhân 1–2 dòng, không để khối chào quá cao.
- Bộ chọn 30/45 phút luôn truy cập được nhưng **không tranh CTA**.
- Lý do đề xuất đặt disclosure/caption; giải thích đầy đủ khi mở.
- Lộ trình 4 bước rút thành timeline/stepper có thể quét nhanh; đưa xuống dưới hero, không cột phụ có 4 thẻ to ngang cấp.
- Vocabulary đến hạn nằm trong tile phụ nhỏ. Streak chỉ hiển thị khi backend có số thật, không biến thành gamification chính.

### 3.2 Mobile: một cột ưu tiên hành động

Thứ tự: **greeting ngắn → 30/45 → hero bài học → CTA trước bottom nav → lộ trình thu gọn → ôn từ → thay bài/thiết lập phụ**. Ở 375×812, không để CTA rơi xuống dưới fold trong state bình thường chỉ vì khối chào/quảng diễn dài; với trạng thái loading, error, no activity, in-progress, revision cũng phải rõ đường tiếp theo.

### 3.3 Logic tuyệt đối giữ nguyên

- `useTodayRecommendation`, `useStartSession`, chọn 30/45, alternate, resume, revision, baseline CTA, due vocab và error retry.
- Không sinh thêm bài, không thay thuật toán đề xuất hoặc API; không thay `data-tour="today-start"`.
- Không hiển thị “đã hoàn thành” khi data chưa xác nhận.

### 3.4 File chủ quản dự kiến

`src/features/today/{today-view,today-hero,recommended-card,continue-block,session-plan,start-controls,due-vocab-teaser,alternate-activities,baseline-banner,today-error-card}.tsx` và `src/components/layout/{page-container,app-nav,side-nav,bottom-tab-bar}.tsx` **chỉ khi thật sự cần**. Các component đang có thay đổi chưa commit: review diff và ownership trước khi sửa.

### 3.5 Visual gate — KHÔNG chuyển Phase 2 nếu chưa đạt

- Chụp **before/after 375px và 1440px** cùng nội dung fixture, cung cấp screenshot chính xác từ app chạy (không thay bằng ảnh AI).
- Người dùng có thể chỉ ra rõ hero chính và CTA trong **2 giây quan sát đầu**.
- UI không còn chuỗi card lớn ngang cấp tranh nhau chú ý.
- CTA start/continue/revision và 30/45 hoạt động trên fixture.
- Có tối thiểu 6 state: fresh, active, revision, empty, loading, error.
- Mời người dùng duyệt thiết kế màn Today trước khi lan cả hệ thống. Nếu chưa có approval, tiếp tục xử lý kỹ thuật nội bộ nhưng **không claim UI accepted**.

## 4. Phase 2 — Learning Studio: 4 kỹ năng và IELTS

**Mục tiêu:** cảm giác *bàn học chuyên biệt*, không phải form quản trị hai cột.

- Desktop: shell header nhỏ nhưng nổi tên bài + timer + autosave; vùng **Source/Prompt** và **Workspace** có kích thước phù hợp nhiệm vụ; thanh hành động dễ thấy nhưng không che editor.
- Mobile: trình tự đọc đề → thao tác → nộp rõ ràng; cho phép đóng/mở đề **mà không unmount/mất state**; keyboard không che action bar; timer/save status rõ.
- Writing: đề bài có bố cục biên tập, editor rộng/thoáng, word count và hướng dẫn không tạo card lồng nhau.
- Reading: nguồn y khoa dễ đọc, font size control, Smart Capture bôi đen; 3 trường ý chính/dịch/thuật ngữ dễ quét.
- Speaking: tình huống nói + khu vực thu âm là trọng tâm; permission/error/upload/redo hiển thị dễ hiểu, không “giả vờ” chấm phát âm không có audio.
- Listening: player + câu hỏi là trọng tâm; transcript vẫn **khoá theo server receipt**, gợi ý/hỗ trợ không tự reveal; shadowing giữ nguyên.
- Feedback và revision: ưu tiên **1–3 việc cần sửa**, trước/sau, CTA bản 2; các observation dài đọc được, không dồn vào sidebar nhỏ.
- IELTS: chỉ practice; không báo band chính thức; shared mode registry không thay.

**Touchpoints:** `src/features/session/shell/*`, `src/features/session/modes/{writing,reading,speaking,listening}/*`, `src/features/my-work/{list,detail}/*`, `src/components/ui/*` khi cần. **Không thay** `use-session-controller`, contracts, plugin interface, data model nếu không có lỗi chức năng xác nhận và phê duyệt phạm vi.

**Acceptance:** screenshots 375/768/1440 cho W1/R1/S1/L1 + feedback/revision; autosave pending/fail/retry, submit503 giữ nháp, timer/exit, media denied/upload error, listening locked/reveal post, keyboard/focus/modal. Những môi trường/provider chưa kiểm phải ghi “not verified”.

## 5. Phase 3 — Discover & Supporting UX

- **Library:** search và filter xuất hiện trước danh sách; card học có title, mục tiêu, mode, thời lượng, status rõ; không quá nhiều badge; giữ `q/query/topic/skill/status` và URL/back/reload, approved activities.
- **Onboarding:** 4 bước thành wizard thở hơn, progress rõ, lựa chọn trước đó còn giữ khi save lỗi, CTA tiếp tục/lưu rõ.
- **My Work:** danh sách bài nộp ưu tiên tên bài, tình trạng chấm, nhánh sửa, link feedback; không biến thành bảng quản trị.
- **Vocabulary:** sổ từ đọc được nguồn/câu ví dụ, ôn đến hạn nổi hơn; flashcard thao tác lớn, mặt trước/sau tập trung vào từ, tiếp tục giữ YouGlish/TTS/review batches/hotkeys/focus.
- **Progress:** đúng số liệu thật và giới hạn evidence; hierarchy: tổng quan → bốn kỹ năng → lỗi lặp → revision; không vẽ đường xu hướng giả khi chưa đủ mẫu.
- **Settings/Admin/Login:** đồng bộ design language nhưng không hy sinh rõ ràng/chức năng; màn Admin có thể mật độ cao hơn Today.

**Touchpoints:** `src/features/{library,onboarding,my-work,vocab,progress,settings,admin,auth}/*`, shell/navigation và UI primitives. Đặc biệt `src/features/vocab/{flashcard-deck,flashcard}.tsx` cùng contracts/vocab đang có thay đổi đồng thời; **không ghi đè** cho đến khi xác minh ownership.

**Acceptance:** ảnh 375/1440 của từng màn và state empty/loading/error; filter/back/restore; flashcard flip/undo/save retry/YouGlish; Settings rollback; onboarding skip/retry; admin guard.

## 6. Phase 4 — Verification, visual critique và handoff

### Static & test gates

Chạy từ đúng thư mục repo, với môi trường hợp lệ:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Không chạy integration nếu chưa được phép dùng `TEST_DATABASE_URL`. Không tự seed/migrate DB. Không mặc định “test pass” nếu lệnh bị lỗi runner/SMB; ghi rõ lệnh, exit code và hạn chế.

### Browser/visual gates

- Capture 320/375/768/1440px ở Today, Library, Onboarding, Writing, Reading, Speaking, Listening, feedback, Vocabulary/Flashcards, Progress, Settings (Admin/Login thêm khi có fixture an toàn).
- Có ảnh **before/after cùng route, same state, same viewport** và *visual diff/critique* theo 6 tiêu chí: **primary hierarchy**, spaciousness, readability, mobile usability, consistency, polish. Không dùng điểm số tự chấm làm chứng nhận người dùng đã hài lòng.
- Kiểm overflow, focus visibility, keyboard tab order, control height, sticky top/bottom, safe-area, zoom 200%, reduced-motion, long title/error/empty/loading.
- Nếu preview đang chạy từ **isolated copy**, rebuild/sync riêng khi không đụng process của agent khác, xác nhận source hash/app version. Không kết luận “source đổi => user thấy đổi” khi chưa có URL preview và ảnh.
- Viết Walkthrough: file chỉnh, ảnh, kiểm thử thực chạy, regression, phần chưa kiểm, cách test tay, kế hoạch rollback.

### Definition of Done

- [ ] Người dùng duyệt hình ảnh **Today**.
- [ ] Tất cả màn có ảnh desktop/mobile sau sửa.
- [ ] Nhận diện giao diện thay đổi ở cấp **composition/visual hierarchy**, không chỉ CSS màu.
- [ ] Không regression 30/45, resume/revision, autosave, transcript lock, media, SRS/YouGlish và URL filters.
- [ ] Lint/typecheck/unit/build PASS thật trên source đã thay, hoặc ghi blocker trung thực.
- [ ] Không sửa secret, DB, clinic data; không push/deploy khi chưa được giao.
- [ ] User visual acceptance; chưa có thì ghi `pending`, không báo dự án hoàn tất.

## 7. Rủi ro & cách giảm

| Rủi ro | Giảm thiểu |
|---|---|
| Working tree đang chứa nhiều thay đổi của agent khác | Preflight diff/file ownership; sửa theo slice, kiểm hash, không reset/stash |
| CSS mới còn lẫn gradient từ đợt trước | Audit tất cả layer; chỉ giữ token và pattern đúng Premium, bỏ trang trí dư bằng diff có chủ đích |
| Preview không phản ánh repo | Xác nhận process CWD, hash, origin và URL; ghi ảnh thật sau rebuild/sync |
| Redesign phá state/controls của session | Giữ hooks/contracts; test autosave/hint/media/timer/submit và focus |
| Flashcard/YouGlish thay đổi đồng thời | Khoanh vùng file, kiểm tra owner trước khi chạm |
| Thêm nhiều màu khiến UI thiếu premium | Teal + neutrals ấm, badge tối giản, một visual focal point |
| Test giả/fixture được coi như production | Tách local fixture, browser, provider thật, native-device thành các loại bằng chứng riêng |

## 8. Bản giao việc để dán cho Coding Agent

> Bạn là Senior Frontend Engineer và Product Designer cho `english-mini-lms`. Người dùng không hài lòng vì một đợt UI refresh trước chỉ đổi màu/card mà **không có chuyển đổi thị giác**. Hãy thực hiện **Premium Learning Studio** theo file này, ưu tiên **Dashboard tinh gọn**: lời chào nhẹ, hero bài học rõ ràng, CTA lớn, thông tin phụ có phân cấp. Đây là lần redesign composition thực sự, không được chỉ thay Tailwind classes.
>
> Bắt đầu đọc `AGENTS.md`, `.agents/rules/english-mini-lms.md`, các tài liệu Lite và Next.js 16 docs; kiểm tra `git status/diff` vì đang có nhiều thay đổi chưa commit của các agent khác. Không reset/stash/ghi đè, không sửa DB/provider/secret, không push/deploy. Xác định app đang chạy từ repo thật hay isolated preview; chụp **baseline 375 và 1440**. Lập implementation plan/file ownership ngắn; sau đó triển khai Phase 1 Today làm mẫu chuẩn, tạo **before/after screenshots từ browser thật** cùng state. Chỉ mở rộng sang các màn khác khi hướng thị giác khớp brief; nêu mọi visual gate chưa được người dùng duyệt. Tiếp tục Phase 2–4 trong phạm vi đã duyệt, bảo toàn logic học, API contracts, assisted, append-only, transcript lock, not_assessable và practice_estimate.
>
> Sau mỗi phase, chạy các test phù hợp, chụp mobile/desktop và ghi receipt. Cuối đợt chạy lint/typecheck/unit/build, báo trung thực những lệnh chưa chạy được. Không gọi dự án "hoàn tất" khi chưa có ảnh đối chiếu và user visual acceptance.

---

**Ghi chú:** Đây là tài liệu kế hoạch, **không phải xác nhận code đã hoàn thành**. Những sửa giao diện đã thực hiện trước đó vẫn tồn tại trong working tree và cần được Coding Agent rà lại, không phải mặc nhiên chấp nhận.
