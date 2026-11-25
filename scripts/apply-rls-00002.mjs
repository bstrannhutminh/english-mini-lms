// Apply supabase/migrations/00002_tighten_rls.sql trong 1 transaction + verify.
// Chạy: node scripts/apply-rls-00002.mjs
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import fs from "fs";
import postgres from "postgres";

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) { console.error("Thiếu DATABASE_URL"); process.exit(1); }

const sqlText = fs.readFileSync("supabase/migrations/00002_tighten_rls.sql", "utf8");
const sql = postgres(url, { max: 1, prepare: false });

try {
  await sql.unsafe(`BEGIN;\n${sqlText}\nCOMMIT;`);
  console.log("✅ Migration 00002 applied.");

  // Verify: mọi bảng phải có RLS; không policy nào còn FOR ALL / write command
  const rows = await sql.unsafe(`
    SELECT c.relname AS table_name, c.relrowsecurity AS rls,
      (SELECT count(*) FROM pg_policies p WHERE p.tablename = c.relname) AS policies,
      (SELECT count(*) FROM pg_policies p WHERE p.tablename = c.relname AND p.cmd = 'ALL') AS for_all,
      (SELECT count(*) FROM pg_policies p WHERE p.tablename = c.relname AND p.cmd IN ('INSERT','UPDATE','DELETE')) AS write_policies
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
      AND c.relname IN ('activities','sources','source_segments','learners','learning_sessions','session_events','drafts','media_objects','submissions','assessments','feedback_versions','error_observations','vocabulary_vault','vocabulary_reviews','usage_events')
    ORDER BY c.relname;`);
  let bad = 0;
  for (const r of rows) {
    const flag = (!r.rls || r.policies === 0 || r.for_all > 0 || r.write_policies > 0) ? "❌" : "✓";
    if (flag === "❌") bad++;
    console.log(`${flag} ${r.table_name}: rls=${r.rls} policies=${r.policies} forAll=${r.for_all} write=${r.write_policies}`);
  }
  console.log(bad === 0 ? "\n✅ Tất cả bảng đúng posture: RLS bật, chỉ SELECT, 0 write policy." : `\n❌ ${bad} bảng chưa đúng!`);
  process.exitCode = bad === 0 ? 0 : 1;
} catch (e) {
  console.error("❌ Migration failed, đã rollback:", e.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
