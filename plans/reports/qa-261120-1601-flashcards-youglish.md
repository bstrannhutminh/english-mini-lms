# QA trình duyệt — YouGlish trên thẻ quẹt

Status: DONE_WITH_CONCERNS. Ngày: 20/11/2026, Asia/Ho_Chi_Minh. Attempt5: **20/20 kiểm tra PASS**, exit0.

## Nguồn và ranh giới

- Repo `d3d48b44d35019b10915cfead0925a3c2c0e0952`; source cuối có bản sửa focus của controller. SHA256 Deck: `dde1baea9aded3e586c14bb30b44ef3d7050c0f8a5601ad9e431e038be72df24`.
- Preview controller: `http://127.0.0.1:3000`; bản sao tại `plans/reports/local-preview-261119-2241-artifacts/app`.
- SHA256 bốn file `flashcard.tsx`, `flashcard-deck.tsx`, `youglish-modal.tsx`, `youglish-widget.tsx` khớp giữa repo và preview: [receipt](youglish-261120-1601-artifacts/preview-source-match.json).
- GET live qua app/DB mẫu cô lập với DEV_BYPASS; không phải đăng nhập/dữ liệu production. Native “Ôn tự do” trả4thẻ; bộ đến hạn chỉ1thẻ.
- Skill `ak-web-testing`; CDP qua `next/dist/compiled/ws`, Chrome headless/profile riêng, port9336. Input dùng `Input.dispatchMouseEvent`, `Input.dispatchTouchEvent`, `Input.dispatchKeyEvent`. JS đọc DOM/bounds/state, scroll vào vùng nhìn và spy TTS trong suốt gọi native original; không simulated DOM click.
- Chặn mọi local API mutation bằng HTTP503 trước server. GET mặc định live. Fixture provider chỉ dùng kiểm tra empty/error, có nhãn. Không đọc dotenv/credential, thay source/config, gọi Gemini, sửa DB/Git hoặc sở hữu server/PG.

## Kết quả hành vi cuối

| Gate | Kết quả |
|---|---|
| Front/back mở đúng từ, không flip/grade | PASS native click |
| Enter/Space mở; close/Escape trả focus đúng trigger | PASS sau sửa focus |
| Modal khóa hotkey/grade/Undo/filter/finish | PASS; state/batch không đổi |
| Đóng/reopen giữ index, mặt thẻ, batch | PASS trên thẻ1 và thẻ2 có pending batch |
| Native touch swipe sau close; Undo sau close | PASS |
| Thẻ kế dùng query riêng | PASS: `linear transducer` → `fascial compartment` |
| Loading/fly/saving không mở nguồn | PASS: loading không render nút; fly/saving disabled |
| Mở hủy TTS; đóng gỡ iframe | PASS native cancel call + DOM cleanup; không claim audio nghe được |
| Empty/error có fallback đúng query | PASS fixture có nhãn; empty thật cũng được quan sát |
| Layout320/375/1440 | PASS: không tràn ngang, nút cao44px; mặt sau dài có scroll dọc |
| Gửi batch thất bại hiển thị lỗi, không ghi DB | PASS một POST batch4thẻ intercepted503 |

Chi tiết20assertion: [behavior-results](youglish-261120-1601-artifacts/behavior-results.json). [Native input](youglish-261120-1601-artifacts/native-input-receipt.json), [network/fixture](youglish-261120-1601-artifacts/network-receipt.json), [source identity](youglish-261120-1601-artifacts/source-identity.json).

## YouGlish thật và giới hạn

Trong **attempt5**, `widget.js` tải HTTP200. Query thật `linear transducer` trả `/pronounce/...` HTTP404 với iframe `No result found.`; LMS hiện fallback đúng từ. `fascial compartment` cũng trả404/empty trong attempt3. Không thấy quota/CAPTCHA ở các request này. **Chỉ attempt5 chưa xác nhận playback**: PASS provider-attempt của lượt đó xác nhận dịch vụ thật và xử lý empty. Lượt focused sau đó đã xác nhận native Play trên thẻ fixture `hello`; xem [receipt Play mới nhất](youglish-261120-1601-artifacts/live-provider-results.json) và section bổ sung bên dưới.

[Receipt thật cuối](youglish-261120-1601-artifacts/real-youglish-results.json), [receipt fascial](youglish-261120-1601-artifacts/attempt-3-real-youglish-results.json). Fixture empty (`onFetchDone totalResult:0`) và widget-script503 được tách khỏi các receipt này.

Đã trực tiếp xem ảnh: [front1440](youglish-261120-1601-artifacts/card-front-1440.png), [back375](youglish-261120-1601-artifacts/card-back-375.png), [modal320](youglish-261120-1601-artifacts/real-youglish-320.png). Có thêm [modal375](youglish-261120-1601-artifacts/real-youglish-375.png), [modal1440](youglish-261120-1601-artifacts/real-youglish-1440.png), [thẻ kế375](youglish-261120-1601-artifacts/card-next-375.png). Chrome desktop giả lập viewport/touch; chưa test Safari/iPhone/Android vật lý hoặc human visual approval.

## Preview và cleanup

1. Attempt1: `Page.navigate` timeout15s, chưa có document response. HEAD cùng route timeout15s; health200. Sau đó GET route200. Chưa gắn nguyên nhân cold compile như kết luận đã xác nhận.
2. Attempt2: document200 nhưng DOM màn lỗi ứng dụng, digest `3928805985`. Chưa render thẻ, chưa có APIreviewGET/click/grade. [Ảnh](youglish-261120-1601-artifacts/attempt-2-failure-state.png), [network](youglish-261120-1601-artifacts/attempt-2-network-receipt.json).
3. Controller đã sửa process preview bằng env test; READY mới render header và không có digest lỗi trước. [Runtime sửa](youglish-261120-1601-artifacts/runtime-repaired.json).
4. Cả ba Chrome đã dừng; profile đã xóa. Preview/PG của controller được giữ. [Attempt1](youglish-261120-1601-artifacts/attempt-1-browser-process.json), [Attempt2](youglish-261120-1601-artifacts/attempt-2-browser-process.json), [Attempt3](youglish-261120-1601-artifacts/attempt-3-browser-process.json).
5. Attempt3 có lỗi thật close trả focus BODY; controller giữ card buttons enabled dưới native dialog inert để Modal chụp trigger, hook/controls vẫn khóa. Attempt5 đã xác nhận fix. Các FAIL Space/back/next-card attempt3 là cascade/fewer-than2cards, không coi là bug riêng.
6. Attempt4 compile500 do Tailwind scan artifacts sinh token CSS chứa byteDelim\u0002; controller giới hạn source của isolated preview, CSS chính không đổi. [Ảnh lỗi](youglish-261120-1601-artifacts/attempt-4-failure-state.png), [scope receipt](youglish-261120-1601-artifacts/preview-tailwind-scope.json).
7. Chrome cuối PID4849/port9336 đã exit0; profile đã xóa, `lsof` port9336 không có listener. [Lifecycle cuối](youglish-261120-1601-artifacts/browser-process.json). Preview/PG controller được giữ cho người dùng.

## Chưa xác nhận

Điện thoại vật lý, tài khoản production, human visual approval và nghe audio bằng tai. Playback kỹ thuật đã xác nhận bằng [native Play hello](youglish-261120-1601-artifacts/live-provider-summary.json); proof fixture/provider thật không thay cho các gate còn lại.

## Câu hỏi còn mở

- Cần người dùng test tay trên điện thoại, duyệt hình ảnh và nghe audio với nội dung/tài khoản production. Playback không còn là blocker hiện tại; [receipt Play hello](youglish-261120-1601-artifacts/live-provider-results.json) được ghi ở section focused bên dưới.

## Bổ sung focused live-provider playback — 17:49 ngày 20/11/2026

**PASS playback thật trên thẻ fixture `hello`.** Chỉ intercept GET `/api/v1/vocabulary/review` để trả một thẻ có nhãn fixture; modal/YouGlishWidget hiện có và mọi request YouGlish/YouTube dùng mạng thật. Không tạo từ, chấm thẻ hoặc ghi DB. Bộ 20 checks và artifacts attempt5 được giữ nguyên.

- YouGlish `/pronounce/hello/...` HTTP200, UI hiển thị 76,449 kết quả, caption và clip TED **A sci-fi vision of love from a 318-year-old hologram | Monica Byrne**; YouTube embed `8HfoKd873HY` HTTP200.
- Native CDP click đúng control toolbar có title `Toggle play: Ctrl+Space`, tọa độ viewport `(642,583.67)`. Video sau khi seek tới ví dụ chạy qua các mốc `216.61 → 218.01 → 219.63 → 221.10 → 222.52` giây; `paused=false`, `readyState=4` ở cả 5 mẫu. Đã trực tiếp xem screenshot thấy frame/video/caption thay đổi; không claim đã nghe audio bằng tai.
- `world` cũng trả kết quả/clip Vox ở bước tìm control. Các lần thiếu selector YouTube và lần nativeReplay được lưu riêng; receipt cuối là exact control Toggle play, không đánh đồng Replay với Play.
- Close gỡ iframe (`0` còn lại). Không có local API mutation. Chrome riêng PID10440 exit0; profile đã xóa, port9336 không listener; preview/PG giữ nguyên. Console có 20 entry, không warning/error hoặc runtime exception; receipt đã bỏ URL query để không export token/signed media URL.

[Summary](youglish-261120-1601-artifacts/live-provider-summary.json), [playback/time receipt](youglish-261120-1601-artifacts/live-provider-results.json), [ảnh video đang phát](youglish-261120-1601-artifacts/live-provider-hello-after-play.png), [native input](youglish-261120-1601-artifacts/live-provider-native-input.json), [network](youglish-261120-1601-artifacts/live-provider-network.json), [console](youglish-261120-1601-artifacts/live-provider-console.json), [cleanup](youglish-261120-1601-artifacts/live-provider-browser-process.json).

Giới hạn còn lại: proof này là thẻ fixture + provider thật trên Chrome headless, không phải học liệu/tài khoản production hoặc điện thoại vật lý. Hai thuật ngữ mẫu y khoa trước vẫn có kết quả empty404 riêng. Không còn blocker playback kỹ thuật cho query có ví dụ; human visual approval và test tay điện thoại vẫn chưa xác nhận.
