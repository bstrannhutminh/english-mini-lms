# Không gian học và Bài của tôi — làm mới LMS

Ngày: 20/11/2026 · Phạm vi: phase03 đã duyệt · Status: DONE_WITH_CONCERNS

## Kết quả

- Khung học: tên bài, kỹ năng, đồng hồ và trạng thái lưu luôn có trên mobile; lỗi lưu có thử lại. Thanh nộp/lưu đo chiều cao thực bằng ResizeObserver, dự phòng nội dung theo chiều cao lỗi/nhãn và VisualViewport keyboard inset/safe area.
- Writing/Reading/Speaking: hai vùng đề–làm bài trên desktop; mobile có disclosure đề/nguồn. Disclosure chỉ ẩn cột trái bằng CSS, không remount editor/recorder hay reset draft/timer. Writing có mục tiêu từ theo đề; Reading giữ passage, chỉnh cỡ chữ, bản dịch và thuật ngữ; Speaking giữ ghi/dừng/nghe lại/upload/thử lại và text-only.
- Listening: player và controls16px/44px; câu hỏi dùng radio native để giữ bàn phím; transcript chỉ mở sau event accepted như trước. Nguồn video thiếu hiển thị đúng trạng thái, bỏ hardcoded video demo. Shadowing giữ blob khi upload/chấm lỗi và cho thử lại bản ghi; kết quả giữ transcript confidence, retry prompt và limitations.
- Hint: nguyên nhân QA19/11 là controller bỏ qua boolean false của postEvent. Nay chỉ mở nội dung sau event accepted, có loading/error/retry và chặn submit trong lúc ghi hint. Ghi event qua apiFetch + contract hiện có. W2 lấy objective/feedbackGuide của activity approved, không còn template email hội nghị; Speaking fallback cũng theo objective.
- Smart Capture: metadata nội bộ additive sourceType từ caller qua selection đến modal; Reading passage=book, bài viết/bản nộp=text, câu nghe=video kèm URL/mốc câu, ví dụ góp ý=feedback kèm submission/revision/feedback/location. Tuple/API không đổi; không còn tự gán sách/trang giả. Modal cho tra/lưu/thử lại, giữ câu gốc. Root đã chuyển YouGlish sang shared native Modal để tương thích modal lồng.
- My Work: next_action và góp ý ưu tiên đứng trước; CTA sửa ở header là hành động chính. Observation vẫn đủ original/location/issue/suggestion/example/retry_prompt. Compare dùng hai cột đầy chiều ngang và link tới đúng bản; pending/failed/retry giữ workflow thật. Flag/Save phrase đạt44px/16px, có retry lookup; textarea flag/transcript khóa khi POST pending. Danh sách giữ revision/status/assisted, có clear filters/no-results và footer wrap trên mobile.
- Autosave: trạng thái isSaving áp dụng cả tự lưu định kỳ; snapshot tuần tự. Lưu trước thoát chờ snapshot trước rồi lấy nội dung mới nhất. Giữ interval30s, empty draft, save-failure exit guard và timer storage hiện có.
- Submit overlay dùng shared Modal bắt buộc để nền inert/focus được giữ; wrap-up không mở chồng lúc gửi bài.

## File chính

- `src/features/session/shell/{session-shell,shell-header,session-columns,action-bar,hint-bar,use-session-controller,use-action-bar-space,submit-overlay,shell-overlays}.tsx|ts`.
- `src/features/session/hooks/{use-session-events,use-session-hotkeys,use-autosave-draft,use-smart-capture,request-session-hint}.ts`.
- `src/features/session/modes/{writing,reading,speaking,listening}/*`; `modes/types.ts` chỉ thêm optional capture argument.
- `src/features/session/shared/{capture-context,smart-capture-popup,smart-capture-result,youtube-player,embed-error-card}.tsx|ts`.
- `src/features/my-work/{detail,list}/*`; thêm `detail/use-phrase-lookup.ts` để tách lookup khỏi UI lưu cụm từ.
- Test mới: `tests/unit/session-modes/{request-session-hint,capture-context}.test.ts`.

Không sửa core contracts, server/provider, curriculum, DB/migration, env, shared theme hay layout; không commit/deploy và không khởi động server/DB/AI.

## Kiểm tra đã chạy

| Kiểm tra | Kết quả |
| --- | --- |
| `npx vitest run -c vitest.unit.config.ts tests/unit/session-modes tests/unit/my-work` | 7 files,45 tests PASS;8 test mới bảo vệ hint pending/failed/retry và provenance/tuple |
| `npx eslint src/features/session src/features/my-work tests/unit/session-modes/request-session-hint.test.ts tests/unit/session-modes/capture-context.test.ts` | PASS trên bản cuối |
| `npm run typecheck` | PASS trên bản cuối; lỗi Icon chevron-up ban đầu đã sửa bằng chevron-down+rotation hiện có |
| `git diff --check -- src/features/session src/features/my-work tests/unit/session-modes` | PASS |

## Gate còn cần controller xác minh

Chưa chạy browser/render-check/DB fixture/provider trong lượt worker này theo ranh giới đã giao. Không suy ra visual/runtime PASS từ unit/static PASS. Controller ghép kiểm tra:

1. 320/375/768/1440: bốn skill+IELTS, prompt disclosure, selection/capture, title dài, action bar error wrap và keyboard thật/VisualViewport.
2. Hint503 giữ kín → retry201 mở → submission assisted=true từ server; W2 hỗ trợ đúng summary. Listening reveal503 giữ khóa.
3. Autosave pending→gõ thêm→Lưu và thoát→reload giữ snapshot mới; error→exit guard; timer background/reload/expiry.
4. Speaking permission/upload failure, nghe lại/thu lại; Shadowing lỗi→retry cùng blob.
5. MyWork pending/failed/retry/feedback/revision/compare; flag/save phrase; capture→YouGlish nested Modal Escape/restore focus (foundation follow-up đã nhận).
6. Lint/test/build toàn repo và rendered critique/human acceptance do controller thực hiện.

Câu hỏi chưa giải quyết: Không có. Các gate trên là kiểm chứng còn mở, không phải quyết định sản phẩm cần hỏi lại.
