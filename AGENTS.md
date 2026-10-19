# English Mini LMS — ngữ cảnh dự án cho agent

Ứng dụng web cá nhân giúp BS. Minh học tiếng Anh 30–45 phút/ngày: giao tiếp đời sống/công việc/hội nghị, nghe–nói–đọc–viết, đọc–dịch sách y khoa, hướng tới IELTS 7.5–8.0. Một người học, một quản trị (cùng người).

## Tài liệu phải đọc trước khi làm bất kỳ bước nào

1. `docs/plan/lite-mvp-track.md` — phạm vi bản Lite, stack, invariant.
2. `docs/plan/huong-dan-xay-dung-voi-antigravity.md` — bước hiện tại và tiêu chí "xong".
3. `docs/plan/product-design.md` — 5 mode, 7 màn hình, Vocabulary Vault.
4. `docs/plan/data-and-tools-contract.md` — tên bảng/API (Lite dùng tập con). Các file `phase-0*.md`, `technical-architecture.md`, `operations-and-acceptance.md` là đích v2 — chỉ tham khảo, không làm theo ở Lite nếu chưa được yêu cầu.

## Stack (đã chốt cho Lite — không đổi nếu không được yêu cầu)

Next.js App Router + TypeScript · Tailwind + shadcn/ui · Supabase (Postgres, Auth, Storage) · Drizzle ORM · Gemini API · Vercel.

## Cấu trúc thư mục (sau tái cấu trúc 19/10/2026)

```text
src/app/              # chỉ route: page.tsx mỏng (auth → lấy dữ liệu → ghép) + /api/v1
src/app/_shared/      # màn lỗi/loading/not-found dùng chung cho error.tsx, loading.tsx
src/features/         # UI + hook theo vùng: today, library, my-work, vocab, progress,
                      # settings, admin, onboarding, auth, session
src/features/session/ # khung phiên học: shell/ + modes/{writing,reading,speaking,listening}
                      # + hooks/ — mỗi kỹ năng là 1 plugin trong modes/registry.ts
src/contracts/        # zod schema + type DÙNG CHUNG route ⇄ client (nguồn sự thật API)
src/components/       # ui/ (design system: Button, Card, Badge, Modal, Toast…) + layout/
src/lib/              # hàm thuần: modes.ts (modeSkill + MODE_META — nguồn duy nhất
                      # cho nhãn/màu/icon của mode), env.ts, api-client.ts
src/server/           # domain services (learning, library, vocabulary, today, admin, media…)
src/server/http/      # withLearner/withAdmin/parseJson/apiError/mapServiceError
src/server/learning/  # session/ + assessment/ đã chia nhỏ (buildInput → provider → persist)
src/server/providers/ # gemini/ — mọi gọi AI đi qua đây
src/proxy.ts          # Next 16 "proxy" (trước là middleware.ts): refresh session + guard
src/db/               # schema.ts, migrations/ (chỉ additive)
content/english-lab/  # manifest.yaml + texts/ transcripts/ rubrics/ (nguồn học duy nhất)
scripts/seed.ts       # đọc manifest → DB, chỉ review_state=approved
tests/unit/           # vitest hermetic — KHÔNG cần env, không chạm DB (chạy bởi npm test)
tests/integration/    # cần TEST_DATABASE_URL, gated bởi scripts/run-integration-tests.mjs
```

Điểm then chốt của kiến trúc mới (chi tiết: `docs/plan/kien-truc-tai-cau-truc-2026-10-19.md`):

- Route API mới: `withLearner`/`withAdmin` → `parseJson(schema)` → service → `mapServiceError`. `learner_id` lấy từ session, không từ body.
- Màn Học: `page.tsx` ~40 dòng → `<SessionShell plugin={resolvePlugin(mode)}>`; `resolvePlugin` tra `MODE_REGISTRY` bằng `modeSkill(mode)` nên `ielts-*` tự động vào đúng skill.
- Contract lỗi thống nhất `{ error: { code, message, fields? } }`; client gọi qua `apiFetch<T>(schema)` ở `lib/api-client.ts`.

## Lệnh

`npm run dev` · `npm run lint` · `npm run typecheck` · `npm test` (unit, không cần env) · `npm run test:integration` (cần `TEST_DATABASE_URL`) · `npm run build` · `npm run db:migrate` · `npm run seed`

## Nguyên tắc làm việc

- Mỗi phiên chat làm đúng 1 bước trong hướng dẫn. Bắt đầu bằng Planning mode; chờ người dùng duyệt Implementation Plan trước khi sửa file.
- Kết thúc bước: chạy `/verify`, viết Walkthrough ngắn (đã làm gì, cách test tay trên điện thoại, còn gì chưa xong).
- Không thêm dependency ngoài stack trên nếu chưa giải thích lý do và được đồng ý.
- Xem `.agents/rules/english-mini-lms.md` cho các luật bắt buộc về dữ liệu học tập.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
