# Tối ưu UI/UX — English Mini LMS (đợt sau M3)

Anh Minh ơi, sau khi vá xong M3, tôi đã rà soát UI/UX toàn app. App đang **dùng được và có nhiều điểm hay** (flashcard quẹt ngon, auto-save nháp, tour hướng dẫn, copy tiếng Việt giải thích khái niệm tốt), nhưng có 3 vấn đề lớn:

1. **PWA đang chết lặng**: thiếu file icon → service worker không install được → app cài lên màn hình không có icon và không cache gì.
2. **Giao diện admin thiên về dev**: dropdown hiện enum tiếng Anh trần (`draft/approved/retired`), bài nghe bắt viết JSON trần, lỗi báo tên field tiếng Anh — bác sĩ tự soạn bài sẽ rất vất vả.
3. **Không có design system thật**: 506 chỗ inline style, màu mode lệch nhau giữa các màn, ~20 chỗ `alert()`/`confirm()` native, không skeleton/offline page.

Tài liệu này chia 5 đợt, **mỗi đợt = 1 phiên chat Antigravity**, dán prompt → đọc Implementation Plan → duyệt → kiểm theo "Xong khi". Làm theo thứ tự — Đợt 1 rẻ nhất mà hiệu quả lớn nhất.

---

## Đợt 1 — Quick wins: hồi sinh PWA + dọn friction hàng ngày (~1 phiên)

**Prompt:**

```
Đợt quick win UI/UX — đúng các chỗ sau:

1. PWA icon (QUAN TRỌNG — PWA đang chết): public/icons/ chưa tồn tại →
   manifest.json trỏ icon-192.svg/icon-512.svg đều 404 → sw.js cache.addAll
   reject → service worker không bao giờ activate.
   - Tạo icon đơn giản chữ "E" nền brand (#2563eb): icon-192.png, icon-512.png,
     icon-512-maskable.png (padding an toàn ~20%), apple-touch-icon.png 180x180
     (iOS KHÔNG hỗ trợ SVG — layout.tsx:26-28 đang trỏ svg).
   - Sửa manifest.json + layout.tsx trỏ PNG; thêm manifest shortcuts
     ("Học hôm nay" → /today, "Ôn từ" → /vocab/flashcards); đổi
     background_color về màu nền app thật (hiện #0f172a tối → splash đen
     rồi nhảy trắng).

2. Dọn friction /today (màn dùng mỗi ngày):
   - today-view.tsx:402 bỏ "Mã: {id}" (lộ ID kỹ thuật cho người học).
   - Streak badge chỉ hiện khi streak > 0 (:188-193).
   - Empty state :460 bỏ jargon "manifest.yaml" → hướng dẫn người dùng
     được (vd "Chưa có bài nào — vào Thư viện hoặc nhờ quản trị thêm bài").
   - Loading thay emoji ⏳ + animate-spin bằng spinner CSS thật.

3. my-work-compare.tsx:37 — Bản 1/Bản 2 grid 2 cột cố định nén trên
   mobile → stack dọc dưới ~768px (tabs hoặc accordion cũng được).

4. my-work-assessment-status.tsx:59-74 — "Đang chấm" tự poll mỗi ~5s
   (tối đa ~2 phút) thay vì bắt bấm "Làm mới" tay.

5. Thống nhất thang mastery: flashcard đang "Level x/4", vocab-review
   "Cấp độ x/5" — cùng masteryLevel → hiển thị 1 thang thống nhất (x/5).

6. reading-session-view.tsx:91-98 — đoạn văn demo fake "Trang 42" khi
   thiếu segment → đổi thành empty state rõ "Bài này chưa gắn đoạn đọc"
   (KHÔNG render nội dung giả như thật; banner vàng nhỏ hiện tại không đủ).

7. Sửa animation chết: class animate-fadeIn (flashcards-view.tsx:387,432)
   và animate-in/zoom-in-95 (session-wrap-up-modal.tsx:25-26) chưa định
   nghĩa; @keyframes spin chỉ có trong writing view nên spinner màn
   speaking (speaking-session-view.tsx:600) không quay — đưa keyframes
   dùng chung vào globals.css.

8. today/page.tsx:13 initialTargetMinutes hardcode 30 → đọc
   targetMinutesDefault từ preferences/onboarding.

Lập Implementation Plan trước, chờ tôi duyệt. Sau sửa chạy typecheck+lint+build.
```

**Xong khi (điện thoại):** Add to Home Screen thấy icon "E" đúng; mở app splash không bị màn đen; /today không còn "Mã: W5", không "0 ngày liên tiếp"; màn So sánh ở /my-work đọc được trên điện thoại; bài "Đang chấm" tự cập nhật khi xong.

---

## Đợt 2 — Nền design system (làm 1 lần, để mọi thứ sau đẹp đều)

**Quyết định đã chốt:** KHÔNG cài shadcn/ui (giữ app nhẹ cho PWA/offline, solo-dev dễ bảo trì). Chọn hướng: **Tailwind thuần + design tokens thật + ít component dùng chung + lucide-react cho icon**.

**Prompt:**

```
Dựng design system tối thiểu — đúng các chỗ sau:

1. Tokens: globals.css đã khai --color-primary/--color-surface/... nhưng
   không map Tailwind v4 → thêm @theme block map tokens thành utilities
   (bg-primary, text-muted, radius...). Thống nhất 1 MODE_CONFIG dùng chung
   (màu + icon + label Việt cho writing/reading/speaking/listening/shadowing)
   ở src/lib/ hoặc src/components/ — hiện re-declare 3 nơi và màu lệch nhau
   (speaking purple ở today nhưng amber ở library) → xoá bản trùng, trỏ về 1.

2. Component dùng chung tối thiểu (src/components/ui/): Button (variants
   primary/secondary/ghost/danger, size đảm bảo ≥44px touch), Card, Badge,
   Modal/ConfirmDialog, Toast (thay alert/confirm/prompt), Spinner,
   Skeleton, EmptyState (icon + text + CTA). Viết tay Tailwind, không kéo
   radix; dùng clsx+tailwind-merge đã có sẵn.

3. Icon: thêm lucide-react; thay emoji làm icon chức năng ở nav/badge/nút
   (giữ emoji trong copy nội dung học nếu muốn ấm).

4. Thay ~20 chỗ alert()/window.confirm()/prompt() bằng Toast +
   ConfirmDialog: rà các chỗ today-view.tsx:144,154,159; flashcards-view
   .tsx:252,408; settings-view.tsx (5 chỗ); my-work-feedback.tsx:39-42;
   admin-view.tsx:106,127; onboarding-view.tsx:91,95; vocab-list-view
   .tsx:122; my-work-submission-body.tsx:44.

5. Thêm loading.tsx + error.tsx + not-found.tsx cho các route chính
   (today, library, my-work, progress, vocab) — hiện chuyển route trắng màn.

6. Refactor dần inline style: 506 chỗ style={{}} — đợt này chỉ dọn các
   file nặng nhất đụng vào (vocab-list-view ~44, my-work-feedback ~37),
   chuyển sang class/token; phần còn lại dọn dần khi chạm tới.

Lập Implementation Plan trước, chờ tôi duyệt. Nhớ npm run build sau sửa.
```

**Xong khi:** `npm run build` xanh; bấm các thao tác trước đây hiện alert() giờ hiện toast/dialog đồng nhất; màu mỗi mode giống nhau ở mọi màn; chuyển route có skeleton thay trắng màn.

---

## Đợt 3 — Admin "cho bác sĩ": không cần biết JSON/slug/enum

**Mục tiêu:** anh tự thêm/sửa bài và câu hỏi nghe mà không cần hiểu thuật ngữ kỹ thuật. Đây là đợt quan trọng nhất vì admin là chỗ anh chạm nhiều nhất khi soạn nội dung.

**Prompt:**

```
Làm admin thân thiện với người không rành kỹ thuật — đúng các chỗ sau:

1. Việt hoá mọi enum/label trong form (activity-form.tsx:146-258):
   mode → Viết/Đọc/Nói/Nghe/Shadowing/IELTS-*; difficulty →
   Thử/Làm quen/Trung bình/Nâng cao; slot baseline/practice/assessment →
   Đầu vào/Luyện tập/Cuối kỳ; output text/audio → Nộp chữ/Nộp tiếng;
   answerReveal → Không hiện/Sau khi nộp/Theo yêu cầu; reviewState →
   Nháp/Đang duyệt/Đã duyệt/Từ chối/Ngừng dùng. Thêm hint 1 dòng nghiệp
   vụ dưới mỗi field khó (vd answerReveal giải thích khi nào đáp án hiện).

2. QuestionsEditor (điểm gãy nhất — questions-editor.tsx:46-77 đang là
   textarea JSON trần): đổi thành FORM từng câu — mỗi câu 1 card gồm
   [nội dung câu hỏi] [4 ô đáp án] [radio chọn đáp án đúng] [giây mốc
   thời gian]; nút "Thêm câu" / xoá câu; serialise ra đúng schema
   id/prompt/options/correct_option_id/timestamp_reference phía dưới.
   Giữ 1 toggle "Nâng cao: sửa JSON" cho trường hợp dán sẵn. Validation
   báo lỗi theo số thứ tự câu tiếng Việt ("Câu 2: chưa chọn đáp án đúng").

3. ID tự sinh, ẩn quy ước: giữ auto-suggest ở activity-form (điểm tốt)
   nhưng đổi label "Mã bài (id)" → "Mã bài (tự đề xuất — không cần sửa)";
   source-form/segment-form tự sinh src-*/seg-* từ tên nhập, ẩn khỏi mắt
   người dùng (vẫn cho sửa ở chế độ nâng cao).

4. Transcript input dễ hơn (segment-form.tsx:112 format "giây|giây|text"):
   thêm helper — mỗi dòng hiển thị 3 ô [bắt đầu][kết thúc][nội dung] hoặc
   ít nhất placeholder ví dụ + nút "Kiểm tra định dạng" báo lỗi từng dòng
   bằng tiếng Việt ("Dòng 3: thiếu dấu |").

5. Lỗi validation Việt hoá (form-ui.tsx:43): map tên field → tiếng Việt
   (durationMinutes → "Thời lượng"), message zod → câu người đọc được.

6. StateBadge bảng (content-tables.tsx:20) dùng lại REVIEW_STATE_BADGES
   đã có sẵn trong admin-view.tsx:10-31.

7. Drive sync dịch jargon (drive-sync.tsx:69,89,117): "manifest.yaml" →
   "file danh sách bài trên Drive"; "Dry-run" → "Xem trước (chưa ghi)";
   thêm 1 đoạn tooltip giải thích ngắn.

8. Nút "Ẩn bài nhanh" trên list admin: toggle reviewState
   approved↔retired 1 chạm từ bảng, có ConfirmDialog, không cần vào form.

Lập Implementation Plan trước, chờ tôi duyệt.
```

**Xong khi (nhờ thử tay):** anh tự thêm 1 bài nghe mới từ đầu đến cuối trên điện thoại — gồm cả 3 câu hỏi trắc nghiệm — không cần gõ JSON, không gặp chữ tiếng Anh nào trong form; lỗi nhập sai báo tiếng Việt chỉ đúng chỗ sai.

---

## Đợt 4 — Session & mobile: phiên học không bị đứt

**Prompt:**

```
Sửa trải nghiệm trong phiên học trên điện thoại:

1. Timer persist: cả 4 session view giữ secondsRemaining trong state →
   bác sĩ bị gọi điện/app bị kill mất giờ học. Lưu deadline vào
   sessionStorage theo sessionId (hoặc derive từ server session start),
   khôi phục khi remount; cộng trừ khoảng app bị ẩn (visibilitychange).

2. Ẩn bottom nav trong phiên học: learn/[sessionId] hiện nằm trong
   (main)/layout nên nav + "← Thoát" luôn hiện → dễ bấm nhầm thoát.
   Phiên học = chế độ focus: ẩn bottom nav, nút thoát nhỏ + ConfirmDialog
   "Nháp đã lưu, thoát phiên?".

3. Touch target: nút pause ⏸ (listening-session-view.tsx:332-345 ~24px),
   nút back flashcards-view.tsx:617-623, nút flag my-work-feedback.tsx
   :324-343, nút "Đổi bài" today-view.tsx:381-386 → đưa lên ≥44px.

4. iOS zoom + input: layout.tsx:32-38 đang userScalable=false → bỏ chặn
   (đọc văn y khoa cần zoom); input text-xs ở onboarding/settings → ≥16px
   để iOS không auto-zoom (admin đã đúng chuẩn).

5. Offline fallback: sw.js HTML network-first không cache → offline hiện
   lỗi trình duyệt trần. Thêm /offline page + fallback trong sw.js; cân
   nhắc cache shell /today để mở được khi mất mạng (ghi rõ giới hạn).

6. onboarding ô "Khung giờ học" text input tự do (onboarding-view.tsx
   :279-285) → đổi select/time picker native.

7. Gỡ 2 nút "Bài tiếp theo →" trùng nhau trong my-work-header.tsx
   :75-95 và :213-232.

Lập Implementation Plan trước, chờ tôi duyệt.
```

**Xong khi:** đang làm bài mà bị gọi điện 5 phút → quay lại timer vẫn đúng; trong phiên học không còn bottom nav; pinch-zoom được đoạn sách; gõ form không bị màn hình tự phóng to; tắt mạng mở app thấy trang offline thân thiện.

---

## Đợt 5 — Polish "xịn" (làm sau cùng)

**Prompt:**

```
Nâng visual cho hoàn thiện:

1. Skeleton đồng nhất: Today card, library grid, my-work list, progress —
   skeleton đúng hình dáng nội dung thay spinner.
2. Micro-motion: transition mượt cho flashcard flip (giữ nguyên gesture
   hiện có), modal scale-in, toast slide-in, button press state — dùng
   CSS transition keyframes trong globals.css, không kéo thư viện nặng.
3. Bảng màu mode hoàn chỉnh + áp dụng đều: chip mode, badge, progress
   bar, streak — 1 palette từ MODE_CONFIG.
4. Empty state có illustration nhẹ (icon lucide lớn + copy ấm) cho
   library trống, vocab trống, today trống.
5. Header/hero /today: greeting theo giờ + streak + target progress ring.
6. Dark mode: sau khi tokens chuẩn (Đợt 2), thêm prefers-color-scheme —
   bác sĩ hay học tối; nếu effort >S thì để backlog.
7. Rà lại toàn bộ inline style còn sót → token/class.

Lập Implementation Plan trước, chờ tôi duyệt.
```

---

## Thứ tự ưu tiên tổng (nếu chỉ làm được vài việc)

| # | Việc | Vì sao trước |
| - | ---- | ------------- |
| 1 | Icon PWA + apple-touch-icon PNG (Đ1) | PWA hiện chết hẳn — app "cài lên màn hình" là mục tiêu chính của anh |
| 2 | QuestionsEditor form từng câu (Đ3) | Chỗ gãy lớn nhất: anh không thể tự soạn câu hỏi nghe bằng JSON trần |
| 3 | Việt hoá enum/label + lỗi validation admin (Đ3) | Anh dùng admin hàng tuần để thêm bài |
| 4 | Toast/dialog thay alert() (Đ2) | ~20 chỗ alert native trên PWA trông rất "web thô" |
| 5 | Timer persist + ẩn nav trong phiên (Đ4) | Bảo vệ giờ học của người hay bị gián đoạn |
| 6 | My Work compare responsive (Đ1) | Màn học-từ-feedback quan trọng nhất, hiện khó đọc trên đt |
| 7 | Design tokens + MODE_CONFIG chung (Đ2) | Nền để mọi polish sau này không lệch nhau |
| 8 | Auto-poll "Đang chấm" (Đ1) | Bớt 1 thao tác tay mỗi bài nộp |
| 9 | Offline fallback (Đ4) | PWA hoàn thiện |
| 10 | Skeleton + micro-motion (Đ5) | Cảm giác "xịn" — làm sau cùng |

## Lưu ý

- Thêm dependency mới duy nhất: `lucide-react` (nhẹ, tree-shake). Không cài shadcn/radix — giữ bundle nhẹ cho PWA.
- Flashcard swipe, guided tour, auto-save, copy Việt giải thích khái niệm — **giữ nguyên**, chỉ đồng bộ styling.
- Chưa verify visual trên iPhone thật — sau mỗi đợt nhớ test tay trên điện thoại (màn compare 375px, form admin trên mobile).
