import { defineConfig } from "vitest/config";
import path from "path";

/**
 * Unit tests — hermetic, zero env vars, no DB.
 * `npm test` runs this config.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    setupFiles: ["tests/unit/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
