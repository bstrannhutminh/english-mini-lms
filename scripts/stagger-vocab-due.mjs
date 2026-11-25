// Remediation 1 lần: rải due_at của các row vocabulary_vault production đang
// mastery_level = 0 (backlog ~1.100 từ seed đến hạn cùng một ngày) sang
// 1–10 ngày tới, deterministic theo id của row (hashtext của Postgres).
//
// Cơ chế:
//   - CHỈ đụng rows mastery_level = 0 VÀ due_at <= now() (backlog đang đến
//     hạn/quá hạn). Rows có due_at trong tương lai là lịch SRS thật từ các
//     lượt ôn (incorrect/partial) — tuyệt đối không xáo.
//   - deterministic: cùng row id luôn ra cùng offset → chạy lại vẫn an toàn
//     (idempotent về mặt phân bố).
//   - Tương tự logic seed mới trong scripts/vocab-stagger.mjs nhưng dùng
//     hashtext() trong SQL để update 1 lượt, không cần kéo data về app.
//
// Chạy DRY-RUN (mặc định, không ghi gì):
//   node scripts/stagger-vocab-due.mjs
// Ghi thật (xác nhận bằng cờ --apply):
//   node scripts/stagger-vocab-due.mjs --apply
//
// Lưu ý: script này viết sẵn cho user chạy tay trên production — KHÔNG chạy
// tự động trong CI/seed.
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import postgres from "postgres";

const applyMode = process.argv.includes("--apply");
const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) {
  console.error("Thiếu DATABASE_URL (hoặc POSTGRES_URL) trong .env.local");
  process.exit(1);
}

const sql = postgres(url, { max: 1, prepare: false });

try {
  // 1. Tổng quan backlog sẽ bị ảnh hưởng
  const [summary] = await sql.unsafe(`
    SELECT count(*)::int AS affected
    FROM vocabulary_vault
    WHERE mastery_level = 0 AND due_at <= now();
  `);
  console.log(`Rows mastery_level = 0 đang đến hạn/quá hạn: ${summary.affected}`);

  if (summary.affected === 0) {
    console.log("Không có row nào cần rải — kết thúc.");
    process.exitCode = 0;
  } else {
    // 2. Preview phân bố offset 1–10 ngày (deterministic theo row id)
    const distribution = await sql.unsafe(`
      SELECT (1 + (abs(hashtext(id::text)) % 10)) AS day_offset, count(*)::int AS rows
      FROM vocabulary_vault
      WHERE mastery_level = 0 AND due_at <= now()
      GROUP BY 1
      ORDER BY 1;
    `);
    console.log("\nPhân bố dự kiến (số ngày từ hôm nay → số từ):");
    for (const row of distribution) {
      console.log(`   +${row.day_offset} ngày: ${row.rows} từ`);
    }

    if (!applyMode) {
      console.log(
        "\nDRY-RUN — chưa ghi gì. Kiểm tra phân bố trên rồi chạy lại với --apply để áp dụng."
      );
    } else {
      // 3. Update trong 1 câu lệnh duy nhất (atomic) — rải đều 1–10 ngày tới
      const result = await sql.unsafe(`
        UPDATE vocabulary_vault
        SET due_at = now() + ((1 + (abs(hashtext(id::text)) % 10)) * interval '1 day'),
            updated_at = now()
        WHERE mastery_level = 0 AND due_at <= now();
      `);
      console.log(`\n✅ Đã rải xong — rows cập nhật: ${result.count}`);
    }
  }
} catch (e) {
  console.error("❌ Lỗi khi rải due_at:", e.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
