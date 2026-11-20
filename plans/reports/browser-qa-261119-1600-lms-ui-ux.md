# Báo cáo browser UI/UX LMS — 19/11/2026, 16:00

**Kết luận: có lỗi sản phẩm; không đạt toàn bộ UI/UX.** Controller tổng hợp báo cáo từ các receipt của browser worker; không sửa source, test suite, config hoặc Git.

## Môi trường và phạm vi

Chrome/Playwright đã cài sẵn, Next16.3.6 dev Webpack trên bản sao nguồn, PostgreSQL SSL riêng. 16 activity approved được seed; dữ liệu bài làm/góp ý/từ vựng dùng fixture hợp lệ và được ghi nhãn. Backup trước migration/seed/fixture. Không dùng tài khoản, Storage, Gemini hoặc dữ liệu người học thật. Hai viewport chính390×844/1280px; có các probe320px/768px. Curriculum không được tạo giả thêm để đạt check.

Các nhóm đã đi qua: login password/magic UI (không gửi mail), onboarding4steps/save/re-entry; Today30/45/navigation/swap; Library/filter/detail;4mode study; MyWork feedback/compare/queued/failed; Vocab populated/flashcards/review; Progress/Settings; Admin source/editor/wizard; Offline và shared keyboard controls. Bài làm/feedback được ghi nhãn fixture-render, không coi là bằng chứng AI.

## Raw executions

| Receipt | Số attempt | Runner PASS | Runner FAIL |
|---|---:|---:|---:|
| [ui-results.json](browser-qa-261119-1600-artifacts/ui-results.json) | 70 | 48 | 22 |
| [extra-results.json](browser-qa-261119-1600-artifacts/extra-results.json) | 11 | 5 | 6 |
| [diagnostic-results.json](browser-qa-261119-1600-artifacts/diagnostic-results.json) | 10 | 3 | 7 |

Các attempt có diagnostic/recheck, không phải số hành trình duy nhất hoặc phần trăm chất lượng. RawFAIL do selector/fixture/navigation được giữ nguyên và phân loại dưới đây; rawPASS E10 là tái hiện hint email sai, không có nghĩa relevance đã đúng (T08 xác nhận contractFAIL).

## Lỗi sản phẩm đã xác nhận

- Hint events503 vẫn mở ở W1/R1/S1. T03: W1 submit API201 thật vào DB test, eventhint0 và submission.assisted=false dù UI đã mở gợi ý/hứa Có hỗ trợ. Assessment failed vì thiếu Gemini là giới hạn môi trường riêng. [Receipt](browser-qa-261119-1600-artifacts/hint-ledger-receipt.json), [ảnh](browser-qa-261119-1600-artifacts/diagnostic-T03.png).
- Settings200 có submissions.activityId L1/W2/S1/R1/W1 hợp lệ trong DB TEXT nhưng schema đòi UUID; client invalid_format, hồ sơ/bài chuyển thành default/rỗng. [Ảnh](browser-qa-261119-1600-artifacts/diagnostic-T01.png).
- T05: grade1thẻ rồi đổi mode bỏ batch chưa lưu mà không hỏi. T06: ArrowRight trong finish modal vẫn đổi deck Thẻ2/3→3/3. [Mất batch](browser-qa-261119-1600-artifacts/diagnostic-T05.png), [deck sau modal](browser-qa-261119-1600-artifacts/diagnostic-T06.png).
- K01 Tab ra khỏi modal; K02 selectedTabViết nhưng focusAll; K03 activeclock kéo focusBUTTON→DIVdialog; T09 ArrowDown ở menu vẫn giữ trigger.
- Vocab Câu của tôi12px/14px; MyWork phản đối/lưu cụm từ36px; Flashcard/review có controls dưới44px. Các probe Sổ từ320/768 đo tràn ngang.
- K04: submit white trên rgb(13,148,136), font16/600, ratio3.744:1 <4.5 cho normaltext. Không gán màu này cho tất cả token OKLCH.
- T08: W2 summary80–100 từ nhưng hint là email hội nghị. [Ảnh](browser-qa-261119-1600-artifacts/diagnostic-T08.png).
- S03: PATCHreminder503 để lại switch ở giá trị optimistic; E06: review editor còn editable khi request pending. Không tự suy ra mọi nội dung sauSubmit đã bị mất.

## Lỗi probe/giới hạn được phân loại

- V01 ban đầu kiểm textarea/bản ghi đầu sau reload; T02 dùng đúng UUID và chờ PATCH200, API/DB/reload đều khớp. Không có bằng chứng mất Câu của tôi.
- E04/E05 navigation/beforeunload và E07 reveal trên session đã thay trạng thái: setup chưa đúng. T05/T06 dùng fresh context và T07 fresh session xác nhận mode/modalFAIL, reveal503locked→retry200PASS.
- E08 có hai element mang error text; lỗi strict locator, không tự coi upload UI lỗi. Đã tới fakeMic upload503 và render error; T10 selector Ghi âm không match, giữ hạn chế. Không xác nhận upload Storage/audio thật.
- E11 chọn menu sai/ẩn: probe lỗi; T09 chọn visible menu, xác nhận keyboardFAIL.
- Z01 dùng CSSzoom2, có overflow; đây không phải browser desktop zoom200%. Reflow640 bị navigationtimeout nên INCONCLUSIVE: [receipt](browser-qa-261119-1600-artifacts/reflow-results.json). Không dùng nó để kết luận nativezoom hỏng.

## PWA và kết quả hoạt động

[PWA cold](browser-qa-261119-1600-artifacts/pwa-results.json) PASS: chỉ cài từ login, không warmofflinepage; cachev4 chứa public assets/static fonts, không API/private HTML. Nativeoffline fallback có font16px/icon28px/retry49.59px, không tràn ngang. [Ảnh](browser-qa-261119-1600-artifacts/cold-pwa-390.png).

T04 gradeFlashcard từng bị nav che điểm giữa ban đầu nhưng native click tiếp cận được sau scrollY45: không kết luận nút chấm không sử dụng được. Onboarding/save/reentry, Today30/45 và các màn học cơ bản hoạt động trong các trạng thái đã quan sát. Source-only các rủi ro Library/admincollision/provenance/xóaaudio nằm ở [audit](ui-audit-261119-1600-lms-ui-ux.md), không nâng thành browser-confirmed.

## Freshness, cleanup và khoảng trống

HEADa29c99e, source06a3cd3. Source controller519file trước/sau giống nhau; không source/Git edit. Lint/typecheck/build của phiên trước trên source/toolchain không đổi được reuse; unit hiện tại42files358testsPASS.

Controller đã tiếp quản bước cleanup sau khi kết thúc probes. [Receipt](browser-qa-261119-1600-artifacts/cleanup.json): remaining_owned_pids=[], hai cổng3100/54329 trống, scratch/harnessremoved. pg_ctl stop trả1 ở cleanup, không gọi là PASS command; kết quả process/port cuối xác nhận đã dừng. Không dừng process người dùng. Harness tham chiếu và các log/JSON/ảnh nằm trong artifacts local.

Chưa nghiệm thu nativeSafari/điện thoại vật lý, browserzoom thật, đăng nhập/RLS/StorageSupabase, chất lượng audio/YouTube/Gemini thật hoặc production. Không có chứng nhận WCAG toàn bộ hay coverage%/hiệu năng tiết kiệm được suy ra.

Câu hỏi chưa giải quyết: không có câu hỏi sản phẩm mới; sửa lỗi chưa thuộc lượt test này.
