# Premium Studio — Library và Onboarding

Ngày 20/11/2026. Triển khai Phase 3 theo kế hoạch Premium Learning Studio sau khi người dùng giao “triển khai đi cho tôi”. Đây là bằng chứng local fixture, không phải nghiệm thu provider/production.

## Source và bố cục

Chỉ chỉnh 13 file TSX trong `src/features/library/` và `src/features/onboarding/`; thêm `onboarding-view.module.css`. [Danh sách file](premium-studio-artifacts/discovery/owned-files.json), [hash nguồn cuối](premium-studio-artifacts/discovery/final-source-hashes.json): 14/14 file khớp byte với preview.

Library chuyển từ lưới card trang trí sang danh sách bài biên tập: search/status ở đầu, skill tabs gạch dưới, topic strip đơn giản, một gợi ý có trọng tâm; mỗi bài ưu tiên tên/mục tiêu, trạng thái phụ ở cạnh. Chi tiết bài có một hero với thời lượng và CTA, đề bài/nguồn/trọng tâm góp ý nằm dưới theo chiều đọc. Không đổi helper URL, hợp đồng, dữ liệu hay hành vi tạo phiên.

Onboarding chuyển thành một workspace chủ động cùng progress rail ở desktop; mobile dùng stepper gọn. Mục tiêu và tự đánh giá dùng grid hợp lý khi đủ chỗ; bản tóm tắt chia hai cột, nút tiếp tục/lưu dính đáy có safe area. Giữ nguyên draft, payload, skip/save/retry và programmatic focus. CSS module chỉ bỏ outline trang trí quanh toàn bộ vùng nội dung được focus bằng script; nút/input/link vẫn có viền keyboard focus.

Không sửa các file DB, provider, auth, secret, học liệu hay logic domain. Không reset/stash/commit/push/deploy. Baseline source nguyên trạng trước phiên ở `/private/tmp/lms-premium-rest-baseline/src`; ảnh before từ source đó, trước khi sync file mới.

## Browser

Preview chung: `http://127.0.0.1:3035`, source copy `/private/tmp/lms-premium-studio-preview`. Các route `/library`, `/library/W1`, `/onboarding` dùng component thật với props synthetic, không lấy DB. Các API POST/PATCH được CDP trả response thử nghiệm trước khi đến server, không mutation dữ liệu thật. Browser riêng cổng CDP 9343, profile tạm đã đóng/xóa sau từng run.

| Màn | Before 375 / 1440 | After 375 / 1440 |
|---|---|---|
| Library | [375](premium-studio-artifacts/discovery/before-library-375.png) · [1440](premium-studio-artifacts/discovery/before-library-1440.png) | [375](premium-studio-artifacts/discovery/after-library-375.png) · [1440](premium-studio-artifacts/discovery/after-library-1440.png) |
| Chi tiết bài | [375](premium-studio-artifacts/discovery/before-activity-375.png) · [1440](premium-studio-artifacts/discovery/before-activity-1440.png) | [375](premium-studio-artifacts/discovery/after-activity-375.png) · [1440](premium-studio-artifacts/discovery/after-activity-1440.png) |
| Onboarding | [375](premium-studio-artifacts/discovery/before-onboarding-375.png) · [1440](premium-studio-artifacts/discovery/before-onboarding-1440.png) | [375](premium-studio-artifacts/discovery/after-onboarding-375.png) · [1440](premium-studio-artifacts/discovery/after-onboarding-1440.png) |

Cùng fixture và viewport ở before/after, cùng font hệ thống fallback. After thêm 320/768: **12/12 mẫu không document horizontal overflow**. [Metrics trước](premium-studio-artifacts/discovery/before-metrics.json), [metrics sau](premium-studio-artifacts/discovery/after-metrics.json).

Trạng thái bổ sung: [no results](premium-studio-artifacts/discovery/after-library-no-results-375.png), [empty approved list](premium-studio-artifacts/discovery/after-library-empty-375.png), [step kỹ năng 320](premium-studio-artifacts/discovery/after-onboarding-skills-320.png), [step preview 320](premium-studio-artifacts/discovery/after-onboarding-preview-320.png), [save error giữ draft](premium-studio-artifacts/discovery/after-onboarding-save-error-320.png), [activity start error](premium-studio-artifacts/discovery/after-activity-start-error-375.png).

## Kiểm tra thực chạy

- `npx eslint src/features/library src/features/onboarding`: exit 0 sau sửa cuối.
- `npx vitest run -c vitest.unit.config.ts tests/unit/library tests/unit/onboarding`: 6 files, 31 tests PASS.
- Browser core: **24/24** checks PASS trên source cuối và globals warm neutral: native search, `query` alias → `q`, giữ tham số ngoài/hash, Back/Forward/reload, reset, skill URL filter; empty/no results; wizard giữ tên và 45 phút qua các bước, save503 giữ draft/re-enable/retry, skip503/retry/payload. [Receipt](premium-studio-artifacts/discovery/qa-checks.json), [network](premium-studio-artifacts/discovery/qa-network.json).
- Activity detail/touch: **6/6** checks PASS: start45 payload, 503 error/re-enable/retry, revision409 giữ parentId, button touch targets ≥44px ở onboarding320. [Receipt](premium-studio-artifacts/discovery/detail-qa-checks.json).
- Focus regression: **5/5** checks PASS after waiting for actual hydration: step focus announces step1/2; content wrapper has no full-form outline; next native Tab lands on visible 2px focus; lesson links keep outline unclipped. [Receipt](premium-studio-artifacts/discovery/focus-qa-checks.json).
- `git diff --check`: PASS.

Chờ controller chạy full lint/typecheck/unit/build hợp nhất. Không tự gọi “build PASS” từ scoped checks.

## Critique và giới hạn

Hierarchy: Library lấy tên/mục tiêu bài làm đơn vị đọc, ít badge/nền lồng nhau hơn; onboarding có một vùng làm việc đang hoạt động. Spacing: tabs/filter thành một dải dẫn đường, lesson rows và wizard rail có khoảng nghỉ. Readability: nhãn/body 16px, lesson title 20–24px; detail hero 30–36px, dòng prompt max-prose. Mobile: CTA detail và footer wizard còn đọc/bấm được, 320px không tràn ngang; skill/tab strip có scroll ngang có chủ đích. Consistency: mode tone lấy `modeMeta`, không tạo bảng màu khác; sử dụng shared tokens. Polish: không gradient hoặc shadow trang trí trong các file sở hữu.

Đã trực tiếp xem ảnh Library1440, Onboarding375/1440, ActivityDetail375 sau sửa. Không suy rộng đã xem mọi pixel ở mọi mẫu. Chưa thử Inter production, screen reader thật, native browser zoom, Safari/điện thoại vật lý/keyboard thực, mọi title rất dài hoặc provider/auth thật. Library loading/error route shell không thuộc props fixture ở slice này, chưa dựng hay chứng nhận thêm. Lựa chọn người dùng trong wizard vẫn chỉ là tự đánh giá; không biến thành kết quả IELTS chính thức. User visual acceptance toàn bộ màn mới vẫn cần xem thực tế, không suy từ test PASS.
