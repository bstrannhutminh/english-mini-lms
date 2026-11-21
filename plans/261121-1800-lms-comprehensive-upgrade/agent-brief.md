# Brief chung cho các agent — Cải tiến toàn diện English Mini LMS (21/11/2026)

Repo: `/Volumes/SSD ME/AI4A/english-mini-lms` (Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4, Supabase, Drizzle). Một người học duy nhất (BS. Minh, bác sĩ) học tiếng Anh 30–45 phút/ngày, **chủ yếu trên điện thoại**. Người dùng đã duyệt trước mọi thay đổi trong phạm vi brief này — không hỏi lại, làm tới khi xong.

Đọc trước khi sửa: `AGENTS.md`, `.agents/rules/english-mini-lms.md`. Next 16 khác bản bạn biết: nếu đụng API của Next (routing, loading, Link…), đọc guide tương ứng trong `node_modules/next/dist/docs/` trước.

## Mục tiêu đợt này

1. Học dễ nhất: ít chạm, ít cuộn, luôn thấy việc tiếp theo.
2. UI/UX chuyên nghiệp ngang trang học online tốt (Coursera, IELTS prep), nhưng bình tĩnh, cá nhân, không gamification công khai.
3. Mượt: skeleton đúng hình trang, transition nhẹ, không nháy layout, mobile-first 390px.

## Luật cứng (vi phạm = hỏng việc)

- KHÔNG đổi logic nghiệp vụ, API route, contracts hiện có (chỉ được THÊM trường tuỳ chọn), DB schema, migration, seed, nội dung `content/`. KHÔNG thêm dependency. KHÔNG đọc/in `.env*`. KHÔNG commit, push, stash, reset, checkout file.
- Invariant: submissions append-only (`parent_id`); `assisted` do server tính; thiếu audio → `pronunciation: not_assessable`; điểm chỉ gọi "ước tính luyện tập" (`practice_estimate`), tuyệt đối không viết "band chính thức"; feedback luôn hiện đủ `location, original, issue, suggestion, example, retry_prompt` + `limitations`.
- Giữ nguyên mọi `data-tour="..."`, `MODE_META`/`modeMeta`/`MODE_REGISTRY`, tên prop public của hook/controller, hành vi autosave/timer/hint/transcript-gate/flashcard batch.
- Chỉ sửa file trong PHẠM VI SỞ HỮU của bạn (ghi trong task). File ngoài phạm vi: chỉ đọc. Agent khác đang sửa song song các thư mục khác; KHÔNG sửa `src/app/globals.css`, `src/app/learning-studio.css`, `src/components/**`, `src/lib/modes.ts` (Leader sở hữu). Cần primitive/class mới → tự viết component trong thư mục feature của bạn và ghi vào báo cáo.
- File ≤ 200 dòng, tên kebab-case mô tả rõ, comment mô tả ngắn ở đầu component. Không `any`, không `alert/confirm`, hạn chế `style={{}}`.
- Tiếng Việt cho mọi chữ hiển thị; code/comment kỹ thuật tiếng Anh hoặc Việt đều được, theo file hiện có.
- Mobile: vùng chạm ≥ 44px (`min-h-11`), chữ nội dung/nút ≥ 16px (`text-base`). `text-sm` chỉ cho metadata phụ (nhãn eyebrow, thời gian, chip). Không tràn ngang ở 320–390px.

## Ngôn ngữ thiết kế "Clinical Studio" (đã có sẵn, dùng lại)

Màu: teal `primary` cho hành động/chọn/focus; nền trang `bg-surface-muted` (ngà ấm), bề mặt `bg-surface` (trắng); chữ `text-text` / `text-text-secondary` / `text-text-muted`; viền `border-border`, `border-border-strong`; 4 màu kỹ năng qua `modeMeta(mode)` (`badgeClass`, `iconClass`, `softBgClass`, `tone`). Trạng thái: success emerald, warning amber, error red (xem `Badge` tone).

Primitive mới trong `@/components/ui` (import từ barrel):
- `<SkillTile mode="writing" size="sm|md|lg" />` — ô icon kỹ năng nền nhạt. Dùng làm điểm nhận diện đầu mỗi thẻ bài học/bài nộp.
- `<ProgressRing value max size strokeWidth label toneClass>…</ProgressRing>` — vòng tiến trình SVG, children hiển thị giữa vòng.
- `<StatTile label value hint icon iconClass />` — ô số liệu.
- `<SegmentedControl options value onChange ariaLabel fullWidth />` — công tắc chọn một (client).
- `<Card elevated interactive padded>` — thẻ `rounded-2xl border bg-surface`; `elevated` thêm `shadow-card`; `interactive` thêm hover nổi.
- `<Skeleton className>` đã có shimmer. `Button`, `Badge`, `Icon`, `EmptyState`, `Modal`, `ConfirmDialog`, `Tabs`, `useToast` giữ nguyên API.
- Icon có sẵn (`<Icon name>`): send lightbulb stethoscope lock unlock volume target stop graduation-cap layers home book file-text pen bar-chart pen-tool book-open mic headphones flame play pause clock refresh sparkles cards compass calendar bookmark save check check-circle x alert-triangle info flag user settings shield log-out chevron-down chevron-left chevron-right arrow-left arrow-right plus search trash external-link eye eye-off. Không thêm icon mới.

Class tiện ích (đã định nghĩa trong `src/app/learning-studio.css`):
- `shadow-card` (bóng nhẹ 2 lớp), `shadow-lift` (hover), `rounded-2xl` = 16px.
- `pressable` (nhấn co 0.98) — thêm vào nút/link tự viết. `card-lift` — thẻ bấm được nổi khi hover.
- `hero-wash hero-wash-{writing|reading|speaking|listening}` — nền thẻ chính có wash màu kỹ năng góc trên phải.
- `stagger` — đặt trên container, các con trực tiếp lần lượt hiện. `page-enter` đã tự áp trong `PageContainer`. Animation dùng fill `backwards` nên an toàn với phần tử `fixed`.
- `eyebrow` — nhãn nhỏ viết hoa. `scroll-strip` — dải cuộn ngang ẩn thanh cuộn (chip lọc trên mobile).

Quy ước bố cục:
- Tiêu đề trang: `text-2xl sm:text-3xl font-semibold tracking-tight`; tiêu đề mục: `text-lg font-semibold`; thân: `text-base leading-relaxed`.
- Thẻ: `rounded-2xl border border-border bg-surface p-5 sm:p-6` (+ `shadow-card` cho thẻ chính). Tránh thẻ lồng thẻ; trong thẻ dùng đường kẻ `border-t border-border` hoặc nền `bg-surface-muted rounded-xl`.
- Mỗi màn có đúng 1 hành động chính (nút primary). Trên mobile, hành động chính của màn chi tiết nên dính đáy: `fixed inset-x-0 bottom-(--nav-height)` (trên thanh tab) hoặc `sticky bottom-…`, kèm padding đáy bù cho nội dung.
- Trạng thái rỗng/lỗi/đang tải phải có hình hài rõ (EmptyState, Skeleton đúng bố cục thật).

## Công cụ kiểm chứng (bắt buộc dùng)

- Preview cô lập đã chạy sẵn: `http://localhost:3111` (bản sao tại `/private/tmp/lms-leader-preview`, đăng nhập giả lập, DB mẫu). Đồng bộ source của bạn sang preview: `bash /private/tmp/lms-leader-sync.sh` (chạy sau mỗi đợt sửa; hot-reload tự chạy). KHÔNG đụng dev server port 3000, KHÔNG khởi động server khác.
- Chụp ảnh: `python3 /private/tmp/lms-shots.py <tag> [m|d] <route>=<tên>[+] ...` → `/private/tmp/lms-shots/<tag>-<tên>-{m,d}.png` (m = 390×844 mobile, d = 1440×900 desktop; hậu tố `+` = chụp cả trang, cắt tối đa ~1900px). Script in `overflowX=` (phải = 0) và lỗi console. Ví dụ: `python3 /private/tmp/lms-shots.py a1 m /library=library+`. Hãy MỞ ẢNH RA XEM (tool đọc ảnh) trước/sau khi sửa và tự phê bình như một designer khó tính. Dùng tag riêng theo tên agent để không đè ảnh của nhau. Ảnh baseline trước khi sửa: `/private/tmp/lms-shots/base-*.png`.
- Dữ liệu mẫu: submissions `26111900-0000-4000-8000-000000000201` (W1 bản 1, có feedback), `…202` (W1 bản 2, parent 201), `…203` (R1, assisted), `…204` (S1 text-only), `…205` (W2 đang chấm), `…206` (L1 chấm lỗi). Phiên đang mở: W2 `/learn/a052c9ba-00b2-4ab2-b0a6-a1264c9d2ffb`, R2 `/learn/ca866c1b-f4f9-4cb4-8d18-8ceaaa2bffa2`, S2 `/learn/01d8cb20-b01e-480a-9909-c9b3f2eefdfc`, L1 `/learn/f8f50347-16ba-46af-8be0-e5c89f5bb056`, IELTS W `/learn/ddcbf8f3-65ff-45ad-b6de-9a92241d0b4b`. Bài thư viện: `/library/W1`, `/library/L1`, `/library/I-W1`. Gemini trong preview là khoá giả → nộp bài sẽ ra trạng thái "chấm lỗi"; đừng nộp bài thật trừ khi cần xem trạng thái đó.
- Gates trước khi báo xong (chạy ở repo gốc): `npm run typecheck`, `npx eslint <các thư mục của bạn>`, `npm test`. Agent khác đang sửa song song nên typecheck có thể báo lỗi ở file KHÔNG thuộc bạn — bỏ qua lỗi đó (ghi vào báo cáo), nhưng file của bạn phải sạch. Không chạy `npm run build` (Leader chạy cuối).

## Báo cáo khi xong (trả về trong câu trả lời cuối)

1. Danh sách file đã sửa/thêm (đường dẫn), mỗi file 1 dòng lý do.
2. Trước → sau cho từng màn (ngắn), kèm đường dẫn ảnh sau cùng đã xem.
3. Kết quả gates (lệnh + pass/fail thật, không đoán).
4. Việc chưa làm / rủi ro / đề nghị Leader xử lý (ví dụ cần class dùng chung).
