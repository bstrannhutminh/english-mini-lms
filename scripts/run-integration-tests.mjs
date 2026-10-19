#!/usr/bin/env node
/**
 * Gate for `npm run test:integration`.
 * Integration tests need a dedicated TEST_DATABASE_URL (never the production
 * DATABASE_URL). When it is absent we print an explicit "NOT RUN" message and
 * exit 0 — a skip is reported, never faked as a pass.
 */
import { spawnSync } from "node:child_process";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

if (!process.env.TEST_DATABASE_URL) {
  console.warn(
    "[integration] TEST_DATABASE_URL chưa được đặt — KHÔNG chạy integration tests (không phải lỗi; đặt biến để bật)."
  );
  process.exit(0);
}

const result = spawnSync(
  "npx",
  ["vitest", "run", "-c", "vitest.integration.config.ts"],
  { stdio: "inherit", shell: true }
);
process.exit(result.status ?? 1);
