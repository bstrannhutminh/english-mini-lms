# Sổ Tay Vận Hành — English Mini LMS (Runbook)

Tài liệu này dành cho **BS. Minh** để tự vận hành hệ thống English Mini LMS một cách an toàn, độc lập và dễ dàng nhất.

Cập nhật: 19/10/2026 (sau đợt tái cấu trúc).

---

## 1. Biến môi trường (Environment Variables)

Tất cả secret đặt trong `.env.local` ở máy cá nhân (đã gitignore) và trong **Vercel → Settings → Environment Variables** khi deploy. Không bao giờ commit hay gửi file này qua tin nhắn.

| Biến | Bắt buộc | Dùng cho |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Có | Kết nối Supabase (public, nhúng vào client) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Có | Đăng nhập + truy cập có RLS (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Khuyến nghị | Tác vụ server (storage, media); thiếu thì fallback anon key |
| `DATABASE_URL` | Có* | Kết nối Postgres trực tiếp (Drizzle). *Chấp nhận `POSTGRES_URL` thay thế |
| `GEMINI_API_KEY` | Có | AI chấm bài (Gemini) |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Tùy chọn | Drive sync trong admin — JSON service account nén 1 dòng |
| `GOOGLE_DRIVE_FOLDER_ID` | Tùy chọn | ID thư mục Drive chứa manifest + texts/transcripts/rubrics |
| `TEST_DATABASE_URL` | Chỉ khi chạy test tích hợp | DB test riêng — **tuyệt đối không** trỏ vào DB production |
| `DEV_BYPASS_AUTH` | Chỉ dev local | Xem mục 5 |

Mẫu đầy đủ: `.env.example` (copy thành `.env.local` rồi điền giá trị thật).
App kiểm tra env lúc request, không phải lúc build — thiếu biến sẽ thấy thông báo tiếng Việt nêu đúng tên biến thay vì trang trắng.

## 2. Lệnh phát triển (Dev Commands)

```bash
npm run dev               # chạy dev server tại http://localhost:3000
npm test                  # unit test — hermetic, KHÔNG cần env
npm run test:integration  # test tích hợp — cần TEST_DATABASE_URL (tự skip nếu thiếu)
npm run lint              # eslint
npm run typecheck         # tsc --noEmit
npm run build             # build production — chạy được cả khi thiếu env
npm run db:migrate        # chạy migration Drizzle (cần DATABASE_URL)
npm run seed              # đọc content/english-lab/manifest.yaml → DB (chỉ bài approved)
```

## 3. Deploy lên Vercel

- Vercel deploy từ nhánh **`master`**. Các nhánh `refactor/*`, worktree agent **không** được merge/push thẳng vào `master` — lead merge sau khi verify.
- Sau khi merge vào `master`: Vercel tự build & deploy. Vào **Deployments** kiểm tra bản mới nhất "Ready".
- Nếu vừa đổi biến môi trường: **Deployments → bản mới nhất → Redeploy** để áp dụng.
- Kiểm tra nhanh sau deploy: mở `/api/v1/health` (xem mục 4), đăng nhập thử, vào `/today`.

## 4. Health endpoints

| Endpoint | Ai truy cập | Trả về |
|---|---|---|
| `GET /api/v1/health` | Công khai | Tối giản: `{ status: "ok", time }`. **Không** lộ env/DB/host/số learner |
| `GET /api/v1/admin/health` | Chỉ admin (đã đăng nhập role=admin) | Cờ boolean có/không của từng env, trạng thái kết nối DB, số migration đã áp dụng. Không giá trị secret, không message lỗi gốc |

Dùng `/api/v1/health` để kiểm "app còn sống không" từ bên ngoài (UptimeRobot…). Mọi chẩn đoán chi tiết vào `/api/v1/admin/health` sau khi đăng nhập admin.

## 5. Chạy local không cần tài khoản (DEV_BYPASS_AUTH)

Để xem app nhanh trên máy dev mà không đăng nhập Supabase:

```bash
# trong .env.local — CHỈ dùng trên máy cá nhân
DEV_BYPASS_AUTH=true
npm run dev
```

- Chỉ có tác dụng khi `NODE_ENV=development`; trên Vercel/preview/production biến này **vô hiệu**.
- Khi bật: session proxy bỏ qua redirect đăng nhập, `server/auth.ts` trả learner dev.
- **Nhớ xóa/đặt `false`** trước khi chia sẻ link hay chụp màn hình cho người khác.

---

## 6. Sao lưu định kỳ hàng tuần (Weekly Backup)

Hệ thống lưu trữ 2 thành phần chính:
1. **Cơ sở dữ liệu (Postgres trên Supabase)**: Lịch sử học, bài nộp, nhận xét AI, sổ từ vựng, nhật ký token.
2. **File âm thanh ghi âm (Bucket `learner-media` trên Supabase Storage)**: Các file `.webm`, `.m4a` giọng nói của bác sĩ khi luyện Speaking/Shadowing.

### Cách chạy sao lưu:

- **Trên Windows (PowerShell)**:
  ```powershell
  .\scripts\backup.ps1
  ```
- **Trên Linux / macOS / Git Bash**:
  ```bash
  chmod +x ./scripts/backup.sh
  ./scripts/backup.sh
  ```

### Kết quả sao lưu:
- Bản sao lưu được lưu tự động vào thư mục `./backups/YYYY-MM-DD/` (đã được cấu hình tự động loại khỏi Git trong `.gitignore` để bảo mật tuyệt đối).
- Cấu trúc thư mục sao lưu:
  ```text
  backups/
  └── 2026-09-23/
      ├── database.sql     # Toàn bộ bảng, dữ liệu và lịch sử học tập
      └── media/           # Các file ghi âm giọng nói theo từng phiên học
  ```
- **Mẹo an toàn**: Bác sĩ có thể nén thư mục `backups/YYYY-MM-DD` thành file `.zip` và copy vào USB hoặc Google Drive cá nhân để phòng ngừa rủi ro.

---

## 7. Khôi phục dữ liệu khi có sự cố (Restore)

### A. Khôi phục cơ sở dữ liệu Postgres:
1. Nếu có `psql` trên máy tính:
   ```bash
   psql "$DATABASE_URL" < backups/YYYY-MM-DD/database.sql
   ```
2. Hoặc khôi phục qua giao diện Supabase Web:
   - Đăng nhập [Supabase Dashboard](https://supabase.com/dashboard)
   - Chọn dự án của bạn -> chọn menu **SQL Editor** bên trái
   - Mở file `database.sql` bằng Notepad/VS Code, copy nội dung và paste vào ô SQL Editor, nhấn **Run**.

### B. Khôi phục file âm thanh (Media):
- Nếu bucket `learner-media` bị xóa nhầm, tạo lại bucket mới mang tên `learner-media` (chế độ **Private**).
- Kéo thả các file trong thư mục `backups/YYYY-MM-DD/media/` vào bucket qua giao diện **Storage** trên Supabase Dashboard.

---

## 8. Hướng dẫn đổi API Key an toàn (Key Rotation)

Khi cần cấp lại key hoặc đổi tài khoản AI:

### A. Đổi Gemini API Key:
1. Truy cập [Google AI Studio](https://aistudio.google.com/) -> Đăng nhập tài khoản Google -> Chọn **Get API key** -> Tạo key mới.
2. **Trên máy tính cá nhân**:
   - Mở file `.env.local`
   - Cập nhật dòng `GEMINI_API_KEY=AIzaSy...` bằng key mới.
   - Lưu file và chạy lại dev server.
3. **Trên Vercel (khi đã deploy)**:
   - Vào [Vercel Dashboard](https://vercel.com/dashboard) -> Chọn dự án `english-mini-lms` -> Chọn tab **Settings** -> **Environment Variables**.
   - Tìm biến `GEMINI_API_KEY`, nhấn nút menu 3 chấm (...) -> **Edit**.
   - Dán key mới và nhấn **Save**.
   - Vào tab **Deployments**, chọn bản deploy mới nhất -> nhấn **Redeploy** để áp dụng key mới.

### B. Đổi Supabase Keys:
- Nếu đổi mật khẩu database hoặc project API keys trên Supabase, hãy cập nhật các biến tương ứng (`DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) trong `.env.local` và trên Vercel theo cùng các bước ở trên.
- **Lưu ý quan trọng**: Tuyệt đối không bao giờ chia sẻ công khai hoặc gửi file `.env.local` qua tin nhắn/email công cộng.

---

## 9. Theo dõi chi phí Gemini hàng tháng từ `usage_events`

Mỗi lần Gemini chấm bài viết, nhận xét phát âm, hoặc phân tích từ vựng, hệ thống đều tự động ghi một bản ghi vào bảng `usage_events` gồm:
- `model_name`: Tên mô hình AI được sử dụng (ví dụ `gemini-2.5-flash`)
- `token_input`: Số token đầu vào (đề bài, bài nộp của bạn, rubric)
- `token_output`: Số token đầu ra (nhận xét, sửa lỗi của AI)
- `cost_estimate`: Chi phí ước tính tính theo bảng giá Google (USD)

### Cách 1: Xem trực tiếp trên ứng dụng
- Truy cập trang `/admin` trên trình duyệt (đăng nhập bằng tài khoản admin).
- Thẻ **Tổng chi phí & Token tháng này** sẽ hiển thị trực quan:
  - Tổng số lượt chấm bài trong tháng.
  - Tổng input token và output token.
  - Chi phí ước tính bằng USD (và quy đổi sang VND).

### Cách 2: Truy vấn trực tiếp bằng SQL trong Supabase
Dán câu lệnh SQL này vào Supabase SQL Editor:
```sql
SELECT 
  to_char(created_at, 'YYYY-MM') AS thang,
  action,
  model_name,
  count(*) AS so_lan_goi,
  sum(token_input) AS tong_input_token,
  sum(token_output) AS tong_output_token,
  round(sum(cost_estimate)::numeric, 4) AS uoc_tinh_usd
FROM usage_events
WHERE created_at >= date_trunc('month', CURRENT_DATE)
GROUP BY 1, 2, 3
ORDER BY uoc_tinh_usd DESC;
```
*Gợi ý*: Với nhu cầu học cá nhân 30–45 phút mỗi ngày bằng mô hình Flash, chi phí trung bình hàng tháng thường chỉ dao động từ **$0.20 – $1.00 USD/tháng** (khoảng 5.000đ – 25.000đ VNĐ).
