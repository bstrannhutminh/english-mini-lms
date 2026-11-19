/**
 * Integration test setup — runs against a TEST DATABASE ONLY.
 * TEST_DATABASE_URL is required (see scripts/run-integration-tests.mjs gate)
 * and is mapped onto DATABASE_URL so the lazy db proxy in src/db/index.ts
 * connects to the test DB — never the production DATABASE_URL.
 */
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

if (!process.env.TEST_DATABASE_URL) {
  throw new Error(
    "TEST_DATABASE_URL chưa được đặt — integration tests cần một Postgres test riêng (không dùng DATABASE_URL production)."
  );
}

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
