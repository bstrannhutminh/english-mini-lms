# Rà soát LMS trước commit master — 20/11/2026

Kết luận: **không phát hiện blocker mới trong phần nguồn và các luồng đã có bằng chứng; có thể tạo commit local**. Lint/typecheck/build mới đạt,50file/394unit tests đạt. Chưa có đủ bằng chứng để kết luận nghiệm thu provider, thiết bị thật hoặc production.

Scope là toàn bộ các vùng tính năng và kiến trúc hiện hành, cùng working-tree changes đang chờ. Controller đọc lại nguồn/diff/callers theo checklist base/web/API, đối chiếu báo cáo độc lập và browser còn khớp input. Source519inputs không đổi so với [fingerprint bàn giao](verification-261120-0051-lms-refresh-artifacts/delivery-current-source.json); `.gitignore` mới chỉ loại local developer state khỏi commit. Đây là review mới của controller, **không** tuyên bố đã nhận một lượt independent review mới: liên kết `review` vẫn trả quarantined.

## Tính năng và UI/UX

| Vùng | Đối chiếu và kết quả | Giới hạn còn lại |
|---|---|---|
| Hôm nay | Một hành động học chính, chọn30/45, ưu tiên phiên dở/bản sửa; browser375px đã xác nhận trọn CTA trước navigation. | Chưa bao phủ toàn bộ tên dài/noactivity/error và mọi trạng thái30/45. |
| Thư viện/chi tiết | Search/chủ đề/kỹ năng/trạng thái ở URL; filter/suggestion cùng scope; reload/Back và IELTS empty state có bằng chứng. | Chưa dùng để xác nhận chất lượng hoặc độ đủ của curriculum IELTS. |
| Onboarding | Bốn bước, skip/re-entry, pending khóa lựa chọn; schema/service nhận30/45, skip45 đã đi qua PATCH200 và reload. | Auth/profile thật chưa nghiệm thu. |
| Viết | Worksheet/disclosure giữ editor; autosave tuần tự lấy input mới nhất khi exit; hint chỉ mở sau event accepted; lỗi giữ nháp. | W2 và mọi lỗi autosave/timer chưa đi lại runtime đầy đủ. |
| Đọc–dịch | Đề đọc tách vùng trả lời; capture giữ tuple câu gốc/provenance, parent reference và từ đã lưu. | Không dùng fixture để xác nhận chất lượng dịch y khoa/AI thật. |
| Nói | Recorder/upload/status tách module; text-only được ghi không thể đánh giá âm thanh, không có điểm phát âm giả. | Micro/codec/audio quality/private upload/playback thật chưa kiểm. |
| Nghe/Shadowing | Nguồn thiếu trảnull; không phát video khác bài. Transcript gate từ ledger, reveal lỗi không mở; plugin/routing giữ đúng. | Upload/shadowing/media failure và IELTS runtime chưa kiểm đủ. |
| Bài làm/góp ý/bản sửa | Đủ observation fields/limitations, append-only/revision links giữ nguyên; compare card tự theo chiều cao nội dung. | Một observation đơn desktop còn hẹp; pending/failed/retry chưa có full-state proof. |
| Sổ từ/flashcard/viết câu | Snapshot validated bằng Vault authenticated, giữ clientReviewId; Undo cuối xóa snapshot; error/loading/dialog/input chặn grade nền. Save/discard/cancel và503/retry/reload có browser proof. | Vault>200 được source/unit kiểm; chưa có browser fixture đầy đủ ở kích thước này. |
| Tiến độ | Phân biệt assisted và practice estimate; UI đọc được, giữ service/cách tính hiện hành. | Số phút/bài không tự là bằng chứng tiến bộ ngôn ngữ. |
| Cài đặt | Activity IDs TEXT đúng DB; preferences rollback; export/delete copy khớp backend thực. | Export không thay full backup và chưa kiểm download/audio thật. |
| Quản trị | Các API có withAdmin; wizard chỉ PATCH đối tượng đã được tạo và acknowledged trong attempt hiện tại, không ghi đè ID tồn tại. Keyboard tab/menu và editor cancel đã thử. | Wizard2–4/partial retry/Drive thật chưa thực thi đủ. |
| Shared/Auth/offline | Controls16px/44px trong các mẫu đã đo; dialog trap/restore focus và nested Escape/scroll; navigation/tour targets giữ. PWA không cache bài/audio/API riêng. | Safari/thiết bị/zoom200%/keyboard thật, auth/RLS/OAuth và full state matrix chưa nghiệm thu. |

Browser proof trên là [QA source hiện hành](browser-261120-0120-lms-refresh.md), không một lượt browser chạy mới. Critique vẫn21/24; các mục typography/state/detail còn1. Không nâng điểm hoặc biến394unit tests thành coverage% toàn UI.

## Kiến trúc và invariants

Routes mỏng ở `src/app`, UI/hook theo feature, session qua registry và `modeSkill`; `src/contracts` sở hữu zod shape dùng chung; services/provider ở server.32API routes hiện hành đều có `withLearner`/`withAdmin`, ngoại trừ health public tối giản có chủ đích. Guards lấy learner từ session, parse/map lỗi ở boundary; helper không đẩy session/role vào body client.

Đã đối chiếu phần thay đổi contracts/settings, preferences merge, listening media loader, autosave, flashcard load/storage/reviews và wizard create/collision cùng caller. Không thay DBschema/migration/provider trong diff mới. `activityId` Settings đổiUUID→TEXT để sửa hợp đồng với DB; UUID vẫn được nhận, field mới30/45 là additive và được schema/service/tests kiểm.

Giữ append-only, server-side assisted, speaking not_assessable khi thiếu audio và practice_estimate. PWA source chỉ cache shell/static/offline; navigation lấy mạng, lỗi trảoffline thay vì cache nội dung riêng. Không phát hiện secret literal ở199file source/tests/config/owning-guide đã stage; không đọc file cấu hình riêng hoặc đưa runtime vào index.

## Checks cuối và review gate

| Lệnh | Kết quả |
|---|---|
| `npm run lint` | exit0 |
| `npm run typecheck` | exit0 |
| `npm test -- --maxWorkers=1 --no-file-parallelism` |50files/394tests, exit0 |
| `npm run build` | exit0 |
| `git diff --cached --check` | không whitespace error |
| Literal secret scan, source staged |0findings;199files đã kiểm |

Receipt/log từng lệnh: [checks.json](review-261120-1123-artifacts/checks.json); index paths/hash/secret scan: [source-staging.json](review-261120-1123-artifacts/source-staging.json). Logs là local artifacts đã ignore. Các gates này kiểm source hiện tại, không phải Gemini/Supabase thật. Không gọi integration test bị skip là PASS.

## Advise còn phù hợp cho việc học thật

1. Trước pilot, cấu hình và nghiệm thu một vòng thật Viết→góp ý→bản2, rồi Đọc/Nói/Nghe với tài khoản/audio thật. Dùng [checklist readiness](preflight-261120-1038-lms-product-readiness.md); presence flag không chứng minh credential hợp lệ.
2. Ưu tiên polish observation theo số lượng tại [priority-observations.tsx:49](../../src/features/my-work/detail/priority-observations.tsx#L49), thống nhất icon tại [review-result-panel.tsx:13](../../src/features/vocab/review-result-panel.tsx#L13) và kiểm hover/loading/error/success/focus trên các hành động trọng yếu. Đây là UX advice và thiếu state proof, không phải blocker local commit. Chỉ kiểm lại slice khi source thay đổi, không redesign lại stack đã hoạt động.
3. Thử backup/restore DB+audio vào môi trường riêng, rồi pilot4tuần theo Lite track, ghi chỗ bị kẹt và chất lượng sửa lại/vận dụng. Không hứa band, tiến bộ hoặc chi phí chưa đo.

Các advise này không được triển khai thêm trong lượt review/Git cleanup. Kế hoạch product-readiness vẫn giữ các gate chưa chứng minh; commit local không thay human acceptance hoặc nghiệm thu dịch vụ.

Câu hỏi chưa giải quyết: chưa có phản hồi phạm vi GitHub; mặc định chỉ dọn local. Các gate thiết bị/provider/permission/readiness và liên kết independent review bị khóa vẫn còn như đã ghi, không cản việc lưu commit local đã được user yêu cầu.
