# Kiểm chứng Lively Learning Studio

Ngày: 20/11/2026. Repo: `/Volumes/SSD ME/AI4A/english-mini-lms`. Phạm vi: [checkpoint](../261120-2013-lively-learning-studio/plan.md), tiếp tục plan 4 phase người dùng cung cấp.

## Kết quả kỹ thuật

| Kiểm tra | Kết quả thực tế |
|---|---|
| Đối chiếu danh sách redesign | Đủ 49/49 file, đều có diff trong working tree |
| `git diff --check` | PASS |
| `npm run lint` | PASS, 0 lỗi; 2 warning `no-img-element` ở MarkdownText và Flashcard có từ trước lượt này |
| `npm run typecheck` | PASS, exit 0 |
| `npm test` | PASS, 51 test files, 402 tests |
| `npm run build` | PASS, exit 0; [log](verification-261120-2013-lively-learning-studio-artifacts/build.log) |
| Kiểm tra secret hẹp trong `src`, `tests`, `scripts` | Không thấy mẫu key/token literal; `.env*` được ignore; không đọc/in secret |
| Integration/production | Chưa chạy, không migrate/seed/deploy |

Build lần đầu bị khóa bởi build khác trên cùng root. Đã xác minh PID/cwd bằng `lsof`, đợi owner thoát rồi chạy lại thành công. Không dừng process của phiên khác. Có build khác tiếp tục dùng `.next` sau lượt kiểm chứng; log trên là kết quả riêng của lượt này, không khẳng định output directory sẽ đứng yên trong workspace dùng chung.

## Source review

Đã rà lớp CSS, Today, shell/bốn kỹ năng và các màn hỗ trợ. Token `--color-border`, `--color-surface` tồn tại; focus-visible và reduced-motion được giữ. Phần lớn diff là class/presentation. Không thấy regression chức năng mới từ source. Browser sau đó phát hiện IPA tràn ReviewCard320px và controller sửa3class để wrap/giới hạn chiều rộng. Lint targeted và typecheck sau sửa đều PASS. Build/unit trong bảng được chạy trước sửa CSS class này; không chạy build lại trên root khi process production của phiên khác đang dùng output. Unit hiện có về append-only, transcript gate, assisted và assessment contracts đều pass; không thay thế live end-to-end.

Các thay đổi học liệu, flashcards, schema, seed, ESLint/TypeScript và test khác đang có từ trước không thuộc kết quả triển khai lượt này. Báo cáo YouGlish mới nhất đã ghi nhận focus restore PASS; handoff nhắc lỗi cũ nên không dùng làm lý do sửa lại.

## Browser QA

Đã chạy đủ 15 màn × 6 viewport (320/375/390/768/1024/1440), 90/90 lượt không tràn ngang. Admin chỉ phủ header/tabs/loading, chưa phủ dashboard dữ liệu. Preview ban đầu lệch cả 49 file; đã sync đúng file UI, ghi hash và giữ Tailwind source scope riêng có sẵn trong preview. Preview cũ tự dừng giữa lượt đầu; lượt sau dùng process mới do QA sở hữu, cùng bản sao và DB mẫu cô lập, không ghi DB. Xem [browser report](browser-261120-2013-lively.md) và [matrix](browser-261120-2013-lively-artifacts/matrix-results.json).

Controller trực tiếp xem ảnh Today375/1440, Writing375 đáy trang và Feedback375. Giao diện mới hiển thị, chữ/CTA trong những ảnh này không bị cắt ngang; Writing có đủ khoảng trống trước action bar. Đây là kiểm tra Chrome mô phỏng, không phải thiết bị thật. Ma trận ban đầu Review ở empty state; fixture GET có từ đến hạn sau đó đã tái hiện lỗi IPA bị cắt và được dùng để retest bản sửa. Không coi ma trận layout là bằng chứng mọi trạng thái và flow đã pass.

## Kiểm tra tay còn cần

Mở app trên điện thoại, kiểm tra Hôm nay 30/45 phút, mở/tiếp tục bài, lưu và tải lại nháp; nộp một bài của mỗi kỹ năng, xem góp ý và tạo bản sửa. Kiểm tra ghi âm với microphone bị từ chối và khi mạng lỗi. Ôn thẻ, mở/đóng YouGlish bằng keyboard, kiểm tra focus. Các thao tác có dữ liệu thật và provider không được suy ra từ kiểm tra read-only.

## Bản sửa cuối

`src/features/vocab/review-card.tsx`: cho hàng từ/IPA wrap, giới hạn chiều rộng và xuống dòng từ dài. Trước sửa IPA ở320px vượt khung49.19px; sau sửa cả từ và IPA kết thúc đúng268px trong khung. Retest6/6viewport không bị clipping/overflow, controller đã xem [ảnh320px sau sửa](browser-261120-2013-lively-artifacts/review-fixture-after-320.png). [Bounds cuối](browser-261120-2013-lively-artifacts/review-fixture-after-results.json). Lint targeted/typecheck/diff-check sau sửa PASS.
