# English Mini LMS — cho BS. Minh

Ứng dụng web cá nhân học tiếng Anh 30–45 phút/ngày: giao tiếp đời sống/công việc/hội nghị, nghe–nói–đọc–viết, đọc–dịch sách y khoa, hướng tới IELTS 7.5–8.0. Một người học. Tự xây bằng Antigravity.

Dự án tách khỏi repo `dr-minh-clinic` ngày 22/09/2026; **không dùng, không kết nối** dữ liệu phòng khám/bệnh nhân.

## Bắt đầu từ đâu

1. **Anh Minh đọc trước:** [docs/plan/huong-dan-tu-build-anh-minh.md](docs/plan/huong-dan-tu-build-anh-minh.md) — hướng dẫn tự build có hình minh hoạ.
2. Đọc [docs/plan/huong-dan-xay-dung-voi-antigravity.md](docs/plan/huong-dan-xay-dung-voi-antigravity.md) — hướng dẫn từng bước (Bước 0 → 9).
3. Phạm vi bản đầu: [docs/plan/lite-mvp-track.md](docs/plan/lite-mvp-track.md).
4. Mở thư mục này trong Antigravity; gõ `/build-step 1`.

## Cấu trúc

```text
AGENTS.md                 # ngữ cảnh dự án cho agent
.agents/rules/            # luật bắt buộc (append-only submissions, assisted, not_assessable…)
.agents/workflows/        # /build-step, /verify
docs/README.md            # mục lục tài liệu — "sự thật hiện tại" ở đâu
docs/plan/                # plan đầy đủ (Lite track + v2 + kiến trúc tái cấu trúc 2026-10-19)
docs/adr/                 # quyết định kiến trúc ngắn (ADR)
docs/RUNBOOK.md           # sổ tay vận hành (backup, env, deploy, health)
docs/journals/            # nhật ký làm việc
content/english-lab/      # nguồn học duy nhất (manifest.yaml + texts/ transcripts/ rubrics/)
src/app/                  # routes (page.tsx mỏng) + /api/v1
src/features/             # UI + hook theo vùng (today, session, vocab, admin…)
src/contracts/            # zod schema API dùng chung route ⇄ client
src/components/           # ui/ design system + layout/
src/server/               # domain services + http/ helpers + providers/gemini
tests/unit/               # hermetic, không cần env · tests/integration/ cần TEST_DATABASE_URL
```

## Lệnh thường dùng

`npm run dev` · `npm test` (unit) · `npm run test:integration` · `npm run lint` · `npm run typecheck` · `npm run build` · `npm run db:migrate` · `npm run seed`

## Stack (Lite)

Next.js App Router · TypeScript · Tailwind + shadcn/ui · Supabase (Postgres/Auth/Storage) · Drizzle · Gemini API · Vercel.

## Bảo mật

Secret chỉ trong `.env.local` (không commit). Xem `.env.example`.
