# Browser QA — Lively Learning Studio

Status: DONE_WITH_CONCERNS. 20/11/2026, Asia/Ho_Chi_Minh. **Đã render15route×6viewport =90samples; không có document horizontal overflow. Lỗi ReviewCard320px đã được controller sửa và focused retest6viewport PASS**, xem bổ sung cuối. Không coi90samples là PASS mọi trạng thái/hành vi.

## Finding cần sửa

`src/features/vocab/review-card.tsx`: phrase và IPA nằm cùng flex row không wrap. Browser GET fixture dùng từ thật đang có `fascial compartment`, IPA `/ˈfeɪ.ʃəl kəmˈpɑːrt.mənt/`. Tại320px, mép phải nội dung header268px nhưng IPA tới317.1875px, vượt cả card ngoài và cắt ở mép viewport. Document không sinh horizontal scroll nên metric no-overflow không bắt được clipping này. [Ảnh320](browser-261120-2013-lively-artifacts/review-fixture-320.png), [bounds6viewport](browser-261120-2013-lively-artifacts/review-fixture-results.json). Không sửa main app. Toolbar bên dưới chật và wrap nhiều dòng tại320 nhưng vẫn nằm trong card, không gán thành lỗi riêng. [Ảnh form](browser-261120-2013-lively-artifacts/review-fixture-320-bottom.png).

## Coverage thực tế

| Route/UI | State quan sát |
|---|---|
| Today | Có draft đang học,45phút,streak3, due0; CTA tiếp tục hiển thị |
| Library |16bài approved; search/filter/topic và activity cards; không click start |
| Writing | Phiên cũ W1, draft mẫu hiện trong textarea; CTA lưu/nộp |
| Reading | Phiên cũ R1, input trống, submit disabled + lý do |
| Speaking | Phiên cũ S1, chưa ghi âm, submit disabled + lý do |
| Listening | Phiên cũ L1,3câu/12options, chưa chọn; submit disabled |
| Vocab |4từ mẫu, due0, các CTA ôn/thử thách |
| Flashcards | Empty due0, CTA ôn tự do |
| Review | Empty due0 trên live GET; thêm GET fixture1từ để kiểm ReviewCard |
| My Work |7submission mẫu, filter và cards |
| Feedback | W1bản1,3observations, CTA sửa, independent badge |
| Progress | Metrics mẫu, skill/error/revision cards |
| Settings | Mục tiêu45phút, profile/reminder/account; chưa lưu |
| Onboarding | Bước1/4, selected goals và sticky Tiếp tục |
| Admin | Header/tabs và loading dashboard; **chưa render dashboard dữ liệu** |

Mỗi route đo ở320/375/390/768/1024/1440×1000, có ảnh từng width và375-bottom. [Matrix90samples](browser-261120-2013-lively-artifacts/matrix-results.json), [DOM từng màn và ảnh](browser-261120-2013-lively-artifacts/), [run log](browser-261120-2013-lively-artifacts/run.log). Các phần tử ngoài viewport của Library là strip scroll ngang; Today có decoration đã clip, không phải document overflow.

Đã trực tiếp xem ảnh Today375/1440, Library1440, Writing375/top+bottom, Reading375, Speaking375, Listening375-bottom, Vocab375, Flashcards375, Review320/fixture320+bottom, MyWork375, Feedback375, Progress375, Settings375, Onboarding375, Admin375. Không claim trực tiếp xem toàn bộ105ảnh. Sticky Writing bottom còn xem được cuối textarea; Listening bottom còn thấy toàn bộ q3-D trước action bar. Reading375 header y0–178, action bar y871–1000; nội dung học scroll ở giữa. Button visible375 trong matrix không có height<44px; chưa audit toàn bộ link, contrast hoặc screen reader.

## Source/runtime và ranh giới

- Skill `ak-web-testing`; CDP `next/dist/compiled/ws` sẵn có vì browser connector không intercept request. Không thêm dependency.
- Preview PID1253 ban đầu có cwd đúng isolated app nhưng49/49UIfile khác main. Sync đúng49file được controller cho phép, backup ở `preview-before/`; không copy env/config/DB/content. `globals.css` giữ2dòng preview scan `source(none)`/`@source ".."` đã có từ phiên trước. Sau normalize riêng hai dòng,49/49khớp byte trước và sau QA: [sync hashes](browser-261120-2013-lively-artifacts/source-sync.json), [final hashes](browser-261120-2013-lively-artifacts/source-final.json).
- Attempt đầu chỉ loading, screenshot timeout, sau đó PID1253 exit; nguyên nhân chưa biết. Receipt lịch sử: [blocker](browser-261120-2013-lively-artifacts/runtime-blocker.json), [attempt1network](browser-261120-2013-lively-artifacts/attempt1-network.json). Không dùng attempt đó để kết luận UI.
- Controller sau đó cho phép start isolated preview. Kiểm PG26892/local54329 còn chạy; read-only SQL xác nhận dev learner đã tồn tại trước khi dùng bypass. Preview riêng68113/launcher68103 tại127.0.0.1:3000, exec73039, fake public auth/provider values và DBsynthetic local; không đọc dotenv/secrets, không seed/migrate. Server main68143 trên IPv6 xuất hiện sau check; không dừng nó.
- Chặn mọi local API mutation trước server bằng503; matrix **0mutation**, fixture **chỉ GETreview**. YouTube iframe_api bị block trước provider. Không chọn đáp án, nhập/sửa draft, reveal, submit, grade, ghi âm hoặc lưu setting. [Matrixnetwork](browser-261120-2013-lively-artifacts/network.json), [fixtureGET](browser-261120-2013-lively-artifacts/review-fixture-network.json).
- Matrix console67entry, không warning/error/runtime exception; không suy rộng app không lỗi ở state chưa chạy. [Console](browser-261120-2013-lively-artifacts/console.json).
- Chrome riêng đã exit0/profile removed; port9338 trống. Owned preview68113và68103 được gửi SIGTERM sau QA; không dừng PG26892 hay server main68143. [Chrome](browser-261120-2013-lively-artifacts/browser-process.json), [matrixChrome](browser-261120-2013-lively-artifacts/matrix-browser-process.json), [preview lifecycle](browser-261120-2013-lively-artifacts/owned-preview-process.json).

## Còn mở

IPA clipping320 đã sửa và retest PASS; Chưa kiểm Today empty/error/30↔45 persistence, provider/audio/mic permission, mutation success/failure, autosave, keyboard/focus regression, admin data, Onboarding bước2–4, detail/compare states khác, contrast/reduced motion, Safari/iPhone/Android vật lý hoặc user visual approval. FixtureUI không chứng minh backend/provider readiness. Không có push/deploy/commit.


## Bổ sung sau sửa ReviewCard — 20/11/2026, Asia/Ho_Chi_Minh

Controller sửa duy nhất `review-card.tsx`; QA sync đúng1file vào isolated preview và giữ toàn bộ ảnh/bounds trước sửa. [Hash sync](browser-261120-2013-lively-artifacts/review-card-sync-after.json).

**PASS6viewport,12/12header element checks**: phrase và IPA đều `right<=cardRight+1` và `scrollWidth<=clientWidth+1`. Tại320px, cả2element right268px=headerRight268px; IPA xuống dòng đầy đủ trong card, không còn clipping. Đã trực tiếp xem [ảnh320sau sửa](browser-261120-2013-lively-artifacts/review-fixture-after-320.png). [Bounds sau sửa](browser-261120-2013-lively-artifacts/review-fixture-after-results.json), [network chỉ GETfixture](browser-261120-2013-lively-artifacts/review-fixture-after-network.json). Không lặp90matrix vì thay đổi chỉ ởReviewCard, matrix cũ còn receipt riêng.

Owned preview73318/launcher73308, exec86578 được start theo quyền controller và SIGTERM sau QA; Chrome riêng exit0/profile removed. Không dừng main68143 hoặc PG26892. [Previewcleanup](browser-261120-2013-lively-artifacts/owned-preview-process-after.json), [Chromecleanup](browser-261120-2013-lively-artifacts/browser-process-after.json). Không còn finding UI chưa sửa từ lượt QA này; các giới hạn coverage ở trên vẫn giữ nguyên.
