# Hướng dẫn sử dụng LMS — 14/10/2026

Chào anh, app vừa được cập nhật. Dưới đây là hướng dẫn đăng nhập và tạo đề. Nếu kẹt ở bước nào, anh cứ **chụp màn hình** gửi em nhé.

---

## 1. Đăng nhập

Mở đường link app như thường lệ. Có 2 cách vào:

### Cách 1 — Mật khẩu (nhanh, không cần chờ email)

App vừa thêm đăng nhập bằng mật khẩu. Khi nào em tạo xong sẽ **nhắn riêng mật khẩu** cho anh — lúc đó anh chỉ cần:

1. Email `nhutminh1989@gmail.com` đã điền sẵn, nhập mật khẩu em gửi → bấm **Đăng nhập**.

> Nếu báo *"Email hoặc mật khẩu không chính xác"* → nhắn em để em đặt lại mật khẩu mới.

### Cách 2 — Link qua email (như trước giờ anh vẫn dùng)

1. Ở trang đăng nhập, bấm dòng chữ nhỏ: **"Hoặc đăng nhập bằng liên kết gửi qua Email (Magic Link)"**.
2. Bấm **"Gửi link đăng nhập qua Email"** → mở hộp thư `nhutminh1989@gmail.com` (check cả mục **Spam/Quảng cáo**).
3. **QUAN TRỌNG:** bấm link trong email mở bằng **đúng trình duyệt anh hay dùng** (Safari trên iPhone / Chrome trên Samsung).
   - Nếu link mở ngay trong khung xem email của Gmail thì app không nhận → anh bị quay lại trang đăng nhập.
   - Mẹo chắc ăn: **giữ tay vào link → Copy → dán thẳng vào Safari/Chrome** rồi mở.

### Nếu vẫn không vào được — giúp em chẩn đoán

Anh cho em biết anh đang thấy **màn hình nào** (chụp màn hình luôn càng tốt):

| Anh thấy gì | Nghĩa là |
|---|---|
| Trang trắng trơn / chữ lỗi 500 | Lỗi phía server — em xử lý |
| Báo *"Email hoặc mật khẩu không chính xác"* | Em đặt lại mật khẩu |
| Báo *"Lỗi kết nối máy chủ"* | Server đang ngủ/lỗi — em khởi động lại |
| Bấm link email xong bị quay lại trang đăng nhập | Làm theo "mẹo copy link" ở Cách 2, bước 3 |

Kèm theo: anh đang dùng điện thoại hay máy tính, trình duyệt gì (Safari/Chrome), và khoảng mấy giờ gặp lỗi.

---

## 2. Tạo đề (bài học mới)

Anh có **2 cách** tạo bài mới:

### Cách A — Tạo thủ công trong trang Admin

1. Đăng nhập → gõ thêm `/admin` vào sau tên miền.
2. Chọn tab **📚 Nội dung học** → bấm nút **＋ Bài mới**.
3. Điền thông tin bài (loại bài: Nghe/Nói/Đọc/Viết/IELTS, tiêu đề, nội dung...) → **Lưu**.
4. **Lưu ý quan trọng:** bài mới tạo luôn ở trạng thái **Nháp (draft)** — chưa hiện trong Thư viện.
   - Muốn bài lên Thư viện: bấm **Sửa** bài đó → đổi **Trạng thái (reviewState)** sang **approved** → Lưu.
   - Nếu báo lỗi khi duyệt: bài còn thiếu nội dung bắt buộc (vd. bài Nghe cần có transcript + link nguồn + ít nhất 1 câu hỏi). Gửi em ảnh thông báo lỗi để em hỗ trợ.

### Cách B — Đồng bộ từ Google Drive (tạo hàng loạt)

1. Anh thêm file nội dung vào **thư mục Drive** của dự án (đúng cấu trúc `manifest.yaml` + thư mục `texts/` `transcripts/`).
2. Trong `manifest.yaml`, bài muốn nạp phải ghi `review_state: approved` — bài nháp sẽ bị bỏ qua.
3. Vào `/admin` → tab **☁️ Drive Sync** → bấm **"Đồng bộ Google Drive"** (hoặc **"Kiểm tra (Dry-run)"** để xem trước kết quả mà không ghi gì vào hệ thống).
4. Xem bảng kết quả: bài nào `skipped` là chưa được duyệt hoặc thiếu file — gửi em ảnh màn hình nếu bài anh tưởng đúng mà bị bỏ qua.

### Nếu "tạo xong không thấy bài đâu"

- Kiểm tra bài còn **Nháp** chưa — chỉ bài **approved** mới hiện ở **Thư viện**.
- Bài **IELTS** mới tạo hiện đang có lỗi hiển thị khi học — anh báo em trước khi tạo bài IELTS nhé (em đang sửa).
- Nếu nộp bài xong mà ô "chấm điểm" quay mãi không xong → bấm **Chấm lại** sau ~10 phút; vẫn lỗi thì chụp màn hình gửi em.

---

## 3. Khi gặp lỗi anh gửi giúp em 3 thứ

1. 📸 Ảnh chụp màn hình lỗi (toàn màn hình, thấy cả thanh địa chỉ).
2. 🕐 Giờ xảy ra + thiết bị + trình duyệt đang dùng.
3. 📝 Anh đang làm thao tác gì (đăng nhập / tạo bài / nộp bài / bấm nút nào).

Ba thứ này giúp em tìm lỗi trong log server chính xác trong vài phút.
