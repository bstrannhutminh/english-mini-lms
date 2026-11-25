#!/usr/bin/env node
/**
 * Gate for `npm run test:live` — tests gọi API Gemini THẬT (tốn token).
 *
 * Cần GEMINI_API_KEY trong môi trường/.env.local. Khi thiếu biến, in thông
 * báo "NOT RUN" rõ ràng và exit 0 — skip được báo, không ngụy trang thành
 * pass, cũng không làm vỡ script nào chạy nhầm.
 *
 * Live tests KHÔNG nằm trong `npm test` (unit hermetic), không nằm trong
 * `npm run test:integration` (DB), và không bao giờ đưa vào CI.
 */
import { spawnSync } from "node:child_process";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.warn(
    "[live] GEMINI_API_KEY chưa được đặt — KHÔNG chạy live tests (không phải lỗi; đặt biến trong .env.local để bật)."
  );
  process.exit(0);
}

console.warn(
  "[live] Chạy tests gọi Gemini THẬT — tốn token API. Chỉ dùng để smoke test schema drift."
);

const result = spawnSync(
  "npx",
  ["vitest", "run", "-c", "vitest.live.config.ts"],
  { stdio: "inherit", shell: true }
);
process.exit(result.status ?? 1);
