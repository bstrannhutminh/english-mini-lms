import { defineConfig } from "vitest/config";
import path from "path";

/**
 * Integration tests — real Postgres via TEST_DATABASE_URL.
 * Gated by scripts/run-integration-tests.mjs: skipped (not failed) when the
 * variable is absent. `npm run test:integration` runs this config.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    setupFiles: ["tests/integration/setup.ts"],
    testTimeout: 30000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
