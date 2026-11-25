import { defineConfig } from "vitest/config";
import path from "path";

/**
 * Live tests — gọi API Gemini THẬT (tốn token, cần network + GEMINI_API_KEY).
 * KHÔNG bao giờ chạy trong `npm test` hay CI; chỉ chạy chủ đích bằng
 * `npm run test:live` (gated bởi scripts/run-live-tests.mjs).
 *
 * Mục đích: smoke test schema drift giữa response thật của model và zod
 * schema/contract — loại kiểm chứng không mock được.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/live/**/*.test.ts"],
    testTimeout: 90_000,
    // Tuần tự — tránh rate-limit khi chạy nhiều live test.
    maxConcurrency: 1,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
