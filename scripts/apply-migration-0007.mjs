// Apply src/db/migrations/0007_integrity_hardening.sql lên production:
//   1. PREFLIGHT — phát hiện duplicates/orphans/violations; phát hiện gì thì
//      DỪNG, không apply (xử lý thủ công có kiểm soát, không xoá dữ liệu học tập).
//   2. Apply trong 1 transaction + ghi nhận vào drizzle.__drizzle_migrations
//      (hash sha256 giống hệt drizzle migrator) để `npm run db:migrate` skip.
//   3. Verify indexes/constraint/trigger tồn tại sau apply.
// Idempotent: chạy lại an toàn. Không in secrets.
// Chạy: node scripts/apply-migration-0007.mjs
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import fs from "fs";
import crypto from "crypto";
import postgres from "postgres";

const MIGRATION_FILE = "src/db/migrations/0007_integrity_hardening.sql";
const JOURNAL_WHEN = 1795621500000; // khớp entry idx 7 trong meta/_journal.json

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) { console.error("Thiếu DATABASE_URL"); process.exit(1); }

const sqlText = fs.readFileSync(MIGRATION_FILE, "utf8");
const hash = crypto.createHash("sha256").update(sqlText).digest("hex");
const sql = postgres(url, { max: 1, prepare: false, onnotice: () => {} });

// ── Preflight: phải sạch mới được tạo unique/FK/check trực tiếp ──────────
async function preflight() {
  let problems = 0;

  const dupSessions = await sql.unsafe(`
    SELECT learner_id, activity_id, count(*) AS n
    FROM learning_sessions
    WHERE status IN ('ready','active','paused')
    GROUP BY learner_id, activity_id HAVING count(*) > 1;`);
  if (dupSessions.length) {
    problems++;
    console.error(`❌ PREFLIGHT: ${dupSessions.length} cặp (learner, activity) có >1 phiên đang mở — cần xử lý thủ công trước:`);
    console.error(dupSessions);
  } else console.log("✓ preflight: không có phiên mở trùng");

  const dupDrafts = await sql.unsafe(`
    SELECT session_id, learner_id, count(*) AS n
    FROM drafts GROUP BY session_id, learner_id HAVING count(*) > 1;`);
  if (dupDrafts.length) {
    problems++;
    console.error(`❌ PREFLIGHT: ${dupDrafts.length} cặp (session, learner) có >1 draft — cần xử lý thủ công trước:`);
    console.error(dupDrafts);
  } else console.log("✓ preflight: không có draft trùng");

  const orphans = await sql.unsafe(`
    SELECT s.id FROM submissions s LEFT JOIN submissions p ON p.id = s.parent_id
    WHERE s.parent_id IS NOT NULL AND p.id IS NULL;`);
  if (orphans.length) {
    problems++;
    console.error(`❌ PREFLIGHT: ${orphans.length} submissions có parent_id orphan — cần xử lý thủ công trước:`);
    console.error(orphans.map((o) => o.id));
  } else console.log("✓ preflight: không có parent_id orphan");

  const masteryViol = await sql.unsafe(`
    SELECT id, mastery_level FROM vocabulary_vault
    WHERE mastery_level < 0 OR mastery_level > 4;`);
  if (masteryViol.length) {
    problems++;
    console.error(`❌ PREFLIGHT: ${masteryViol.length} rows vocabulary_vault vi phạm mastery 0–4 — cần xử lý thủ công trước:`);
    console.error(masteryViol.slice(0, 10));
  } else console.log("✓ preflight: mastery_level đều trong [0,4]");

  return problems === 0;
}

try {
  console.log("── Preflight production DB ──");
  const clean = await preflight();
  if (!clean) {
    console.error("\n⛔ DỪNG — không apply migration khi preflight còn vấn đề. Không có thay đổi nào được ghi.");
    process.exitCode = 1;
  } else {
    console.log("\n── Apply migration 0007 trong transaction ──");
    await sql.unsafe(`
      BEGIN;
      ${sqlText}
      -- Ghi nhận vào bảng tracking của drizzle migrator (hash sha256 của file,
      -- created_at = journal 'when') để 'npm run db:migrate' skip migration này.
      CREATE SCHEMA IF NOT EXISTS drizzle;
      CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      );
      INSERT INTO drizzle.__drizzle_migrations ("hash", "created_at")
      SELECT '${hash}', ${JOURNAL_WHEN}
      WHERE NOT EXISTS (
        SELECT 1 FROM drizzle.__drizzle_migrations WHERE created_at = ${JOURNAL_WHEN}
      );
      COMMIT;
    `);
    console.log("✅ Migration 0007 applied.");

    // ── Verify ──
    console.log("\n── Verify ──");
    let bad = 0;
    const idx = await sql.unsafe(`
      SELECT indexname FROM pg_indexes WHERE schemaname = 'public'
        AND indexname IN (
          'learning_sessions_learner_status_updated_idx',
          'learning_sessions_learner_activity_status_idx',
          'submissions_learner_deleted_submitted_idx',
          'submissions_parent_learner_deleted_submitted_idx',
          'submissions_session_learner_deleted_idx',
          'assessments_submission_created_idx',
          'vocabulary_vault_learner_due_idx',
          'drafts_session_learner_idx',
          'learning_sessions_one_open_per_activity',
          'drafts_one_per_session_learner'
        );`);
    console.log(`${idx.length === 10 ? "✓" : "❌"} indexes: ${idx.length}/10 tồn tại`);
    if (idx.length !== 10) bad++;

    const fk = await sql.unsafe(`
      SELECT count(*) AS n FROM pg_constraint
      WHERE conname = 'submissions_parent_id_submissions_id_fk';`);
    console.log(`${Number(fk[0].n) === 1 ? "✓" : "❌"} self-FK submissions.parent_id`);
    if (Number(fk[0].n) !== 1) bad++;

    const chk = await sql.unsafe(`
      SELECT count(*) AS n FROM pg_constraint
      WHERE conname = 'vocabulary_vault_mastery_range_check';`);
    console.log(`${Number(chk[0].n) === 1 ? "✓" : "❌"} CHECK mastery range`);
    if (Number(chk[0].n) !== 1) bad++;

    const trg = await sql.unsafe(`
      SELECT count(*) AS n FROM information_schema.triggers
      WHERE trigger_schema = 'public' AND trigger_name = 'submissions_append_only_guard';`);
    console.log(`${Number(trg[0].n) === 1 ? "✓" : "❌"} trigger append-only`);
    if (Number(trg[0].n) !== 1) bad++;

    const tracked = await sql.unsafe(`
      SELECT count(*) AS n FROM drizzle.__drizzle_migrations WHERE created_at = ${JOURNAL_WHEN};`);
    console.log(`${Number(tracked[0].n) === 1 ? "✓" : "❌"} drizzle migrations tracking (db:migrate sẽ skip)`);
    if (Number(tracked[0].n) !== 1) bad++;

    console.log(bad === 0 ? "\n✅ Verify hoàn tất — migration 0007 đầy đủ trên production." : `\n❌ ${bad} mục verify thất bại!`);
    process.exitCode = bad === 0 ? 0 : 1;
  }
} catch (e) {
  console.error("❌ Migration failed, đã rollback:", e.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
