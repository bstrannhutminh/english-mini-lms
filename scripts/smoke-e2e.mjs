#!/usr/bin/env node
/**
 * npm run smoke — smoke test ĐÚNG màn Học với DB thật (không cần Supabase/Gemini).
 *
 * Dựng Postgres tạm (initdb ở $TMPDIR, cổng SMOKE_PG_PORT=54329), migrate +
 * seed, nhân bản mỗi skill thành 1 bài ielts-*, chạy `next dev` với
 * DEV_BYPASS_AUTH + Supabase giả, tạo phiên qua POST /api/v1/sessions rồi mở
 * từng /learn/<id> bằng Playwright ở 390px và 1280px.
 *
 * FAIL nếu: pageerror, hydration warning, chữ "Có lỗi xảy ra" trên trang,
 * hoặc nút "Nộp bài" bị che (elementFromPoint) ở 390px.
 * Chụp màn hình vào docs/plan/reports/qa-real-<ngày>/.
 *
 * Playwright cài vào thư mục tạm $TMPDIR/lms-smoke-pw — KHÔNG đụng
 * package.json/lockfile của repo (đúng quy tắc "chỉ qua npx").
 * Yêu cầu: initdb/pg_ctl/psql trên PATH (brew postgresql@16/17).
 * Dọn sạch khi thoát. Postgres cổng 5432 của máy không bị đụng.
 */
import { spawn, execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const ROOT = process.cwd();
const PG_PORT = process.env.SMOKE_PG_PORT || "54329";
const APP_PORT = process.env.SMOKE_PORT || "3100";
const BASE = `http://localhost:${APP_PORT}`;
const SHOT_DIR = process.env.SMOKE_SHOTS ||
  path.join(ROOT, "docs/plan/reports", `qa-real-${new Date().toISOString().slice(0, 10)}`);
const PW_VER = process.env.SMOKE_PW_VER || "1.64.1";
const scratch = mkdtempSync(path.join(tmpdir(), "lms-smoke-"));
const pwDir = path.join(scratch, "pw");
const pgDir = path.join(scratch, "pg");
const procs = [];

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: "utf8", stdio: opts.stdio || "pipe", env: opts.env, cwd: opts.cwd || ROOT });
}
function psql(db, sql) {
  return run("psql", [`postgres://smoke@localhost:${PG_PORT}/${db}`, "-At", "-c", sql]).trim();
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitHttp(url, tries = 90) {
  for (let i = 0; i < tries; i++) {
    try { const r = await fetch(url); if (r.status < 500) return true; } catch {}
    await wait(1000);
  }
  throw new Error(`timeout chờ ${url}`);
}
function cleanup() {
  for (const p of procs) try { p.kill("SIGTERM"); } catch {}
  try { run("pg_ctl", ["-D", pgDir, "-m", "fast", "stop"]); } catch {}
  try { rmSync(scratch, { recursive: true, force: true }); } catch {}
}
process.on("SIGINT", () => { cleanup(); process.exit(130); });
process.on("exit", cleanup);

console.log(`[smoke] scratch: ${scratch}`);

// 1) Postgres tạm — db/index.ts bắt ssl:"require" nên pg tạm phải bật SSL
// (self-signed đủ: postgres-js 'require' không verify CA).
const certFile = path.join(scratch, "server.crt");
const keyFile = path.join(scratch, "server.key");
run("initdb", ["-D", pgDir, "-U", "smoke", "-A", "trust"], { stdio: "ignore" });
run("openssl", ["req", "-x509", "-newkey", "rsa:2048", "-keyout", keyFile,
  "-out", certFile, "-days", "2", "-nodes", "-subj", "/CN=localhost"], { stdio: "ignore" });
run("chmod", ["600", keyFile]);
run("pg_ctl", ["-D", pgDir, "-l", path.join(scratch, "pg.log"), "-o",
  `-p ${PG_PORT} -k ${scratch} -c ssl=on -c ssl_cert_file='${certFile}' -c ssl_key_file='${keyFile}'`, "start"], { stdio: "ignore" });
psql("postgres", `CREATE DATABASE smoke OWNER smoke`);
const DB_URL = `postgres://smoke@localhost:${PG_PORT}/smoke`;
console.log(`[smoke] postgres @:${PG_PORT} ok`);

// 2) migrate + seed (env của repo giữ nguyên — chỉ truyền qua child env)
const dbEnv = { ...process.env, DATABASE_URL: DB_URL };
run("npm", ["run", "db:migrate"], { stdio: "inherit", env: dbEnv });
run("npm", ["run", "seed"], { stdio: "inherit", env: dbEnv });

// 3) Nhân bản mỗi skill thành bài ielts-* (copy toàn bộ cột, đổi id+mode)
const acts = psql("smoke",
  `SELECT DISTINCT ON (mode) id, mode FROM activities WHERE mode IN ('writing','reading','speaking','listening') ORDER BY mode, id`
).split("\n").filter(Boolean).map((l) => l.split("|"));
const cols = psql("smoke",
  `SELECT string_agg(column_name, ',' ORDER BY ordinal_position) FROM information_schema.columns WHERE table_name='activities'`);
for (const [id] of acts) {
  const exprs = cols.split(",").map((c) =>
    c === "id" ? `'ielts-' || id` : c === "mode" ? `('ielts-' || mode)::activity_mode` : c
  ).join(",");
  psql("smoke", `INSERT INTO activities (${cols}) SELECT ${exprs} FROM activities WHERE id='${id}' ON CONFLICT (id) DO NOTHING`);
}
const allActs = psql("smoke",
  `SELECT DISTINCT ON (mode) id, mode FROM activities WHERE mode::text ~ '^(writing|reading|speaking|listening|ielts-)' ORDER BY mode, id`
).split("\n").filter(Boolean).map((l) => l.split("|"));
console.log(`[smoke] ${allActs.length} activities (${acts.length} gốc + ielts clones)`);

// 4) next dev — Supabase giả (bypass auth), KHÔNG GEMINI_API_KEY trừ khi caller truyền
const devEnv = {
  ...process.env,
  DATABASE_URL: DB_URL,
  NEXT_PUBLIC_SUPABASE_URL: "https://smoke.invalid",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "smoke-anon",
  DEV_BYPASS_AUTH: "true",
  NODE_ENV: "development",
};
delete devEnv.POSTGRES_URL;
if (!process.env.SMOKE_WITH_GEMINI) delete devEnv.GEMINI_API_KEY;
const dev = spawn("npm", ["run", "dev", "--", "-p", APP_PORT], { env: devEnv, stdio: ["ignore", "pipe", "inherit"] });
dev.stdout.on("data", () => {});
procs.push(dev);
await waitHttp(`${BASE}/api/v1/health`);
console.log(`[smoke] next dev @:${APP_PORT} ok`);

// 5) Tạo phiên qua API thật
const sessions = [];
for (const [id, mode] of allActs) {
  const r = await fetch(`${BASE}/api/v1/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ activityId: id, targetMinutes: 30 }),
  });
  if (r.status !== 201) { console.warn(`[smoke] bỏ qua ${id} (${mode}): HTTP ${r.status}`); continue; }
  const { sessionId } = await r.json();
  sessions.push({ id, mode, sessionId });
}
console.log(`[smoke] ${sessions.length} sessions tạo qua API`);
if (!sessions.length) throw new Error("không tạo được session nào");

// 6) Playwright ở thư mục scratch — không đụng package.json repo
mkdirSync(pwDir, { recursive: true });
writeFileSync(path.join(pwDir, "package.json"), '{"name":"smoke-pw","private":true}');
if (!existsSync(path.join(pwDir, "node_modules/playwright"))) {
  run("npm", ["install", `playwright@${PW_VER}`, "--no-audit", "--no-fund"], { stdio: "inherit", env: { ...process.env }, cwd: pwDir });
}
// Browsers vào cache mặc định ~/Library/Caches/ms-playwright — không cài gì vào repo.
run("npx", ["playwright", "install", "chromium"], { stdio: "inherit", env: { ...process.env }, cwd: pwDir });

const spec = `
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
const BASE = ${JSON.stringify(BASE)}, OUT = ${JSON.stringify(SHOT_DIR)};
const sessions = ${JSON.stringify(sessions)};
const HYDRATION = /hydrat|did not match|Text content does not match/i;
const ERR_BOUNDARY = /Có lỗi xảy ra|Something went wrong/;
// Chi tiết kỹ thuật KHÔNG được hiện cho người học (env var, đường dẫn env).
const SECRET_LEAK = /biến môi trường|GEMINI_API_KEY|DATABASE_URL|\\.env/i;

let checks = 0;

async function visit(browser, url, name, w, fails) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 844 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push("pageerror: " + e.message));
  // Permissions-policy notice của Chrome/YouTube iframe — nhiễu môi trường,
  // không phải lỗi app.
  const ENV_NOISE = /Permissions policy|compute-pressure|Third-party cookie|Deprecation/i;
  page.on("console", (m) => { if (m.type() === "error" && !ENV_NOISE.test(m.text())) errs.push("console: " + m.text()); });
  await page.goto(BASE + url, { waitUntil: "networkidle" }).catch((e) => errs.push("goto: " + e.message));
  // Ẩn dev-overlay "Compiling..." của Next (nextjs-portal) khỏi ảnh chụp.
  await page.addStyleTag({ content: "nextjs-portal{display:none!important}" }).catch(() => {});
  await page.screenshot({ path: path.join(OUT, name + "-" + w + ".png"), fullPage: true });
  checks++;
  const body = await page.innerText("body").catch(() => "");
  if (ERR_BOUNDARY.test(body)) errs.push("error boundary hiển thị");
  // /admin được phép hiện cờ env boolean (admin = chủ app); trang học thì không.
  if (name !== "admin" && SECRET_LEAK.test(body)) fails.push(name + " @" + w + " LỘ chi tiết kỹ thuật");
  const hyd = errs.filter((e) => HYDRATION.test(e));
  if (hyd.length) fails.push(name + " @" + w + " hydration: " + hyd[0]);
  const other = errs.filter((e) => !HYDRATION.test(e));
  if (other.length) fails.push(name + " @" + w + " lỗi: " + other.slice(0, 3).join(" | "));
  console.log((other.length || hyd.length ? "FAIL " : "ok   ") + name + " @" + w);
  return { page, ctx, body };
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const fails = [];

  // 1) Các trang chính có DB: Hôm nay, Thư viện, Sổ từ, Tiến độ, Admin, My Work
  const MAIN = [
    ["/today", "today"], ["/library", "library"], ["/vocab", "vocab"],
    ["/progress", "progress"], ["/admin", "admin"], ["/my-work", "my-work"],
  ];
  for (const [url, name] of MAIN) {
    for (const w of [390, 1280]) {
      const { ctx } = await visit(browser, url, name, w, fails);
      await ctx.close();
    }
  }

  // 2) Màn Học: mọi skill + ielts-*, cả 2 viewport; nút Nộp không bị che @390
  for (const s of sessions) {
    for (const w of [390, 1280]) {
      const { ctx, page } = await visit(browser, "/learn/" + s.sessionId, s.id + "-" + s.mode, w, fails);
      const cover = await page.evaluate(() => {
        const btn = [...document.querySelectorAll("button")].find((b) => /nộp|submit/i.test(b.textContent || ""));
        if (!btn) return "no-submit-btn";
        const r = btn.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return "off-viewport";
        const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return el && (el === btn || btn.contains(el)) ? null : "covered-by:" + (el ? el.tagName + "." + el.className : "none");
      });
      if (w === 390 && cover && cover !== "no-submit-btn" && cover !== "off-viewport") fails.push(s.id + " @390 nút Nộp bị che: " + cover);
      await ctx.close();
    }
  }

  // 3) Vòng lặp thật: mở bài writing → điền → Nộp → /my-work/<id>.
  // Mỗi lần chạy cần 1 session riêng (nộp xong session đóng) → dùng
  // bài writing thường cho 390, bản ielts-writing cho 1280 nếu có.
  const writeSessions = sessions.filter((s) => /writing/.test(s.mode));
  const submitRuns = [[writeSessions[0], 390]];
  if (writeSessions[1]) submitRuns.push([writeSessions[1], 1280]);
  for (const [s, w] of submitRuns) {
    if (s) {
      const { ctx, page } = await visit(browser, "/learn/" + s.sessionId, "submit-flow-" + w, w, fails);
      await page.fill("textarea", "Dear Conference Committee, I am writing to apply for the upcoming regional anesthesia workshop. Smoke test submission.");
      await page.evaluate(() => {
        const b = [...document.querySelectorAll("button")].find((x) => /nộp|submit/i.test(x.textContent || ""));
        if (b) b.click();
      });
      await page.waitForURL(/\\/my-work\\//, { timeout: 90000 }).catch(() => fails.push("submit-flow @" + w + " không về /my-work"));
      // Chờ trang chi tiết load xong thật (không còn spinner "Đang tải")
      // trước khi chụp + kiểm — nếu không các phép kiểm chạy trên trang rỗng.
      const loaded = await page
        .getByText(/Sửa ngay|Chấm lại|Nội dung bài|Nhận xét|Kết quả/)
        .first()
        .waitFor({ timeout: 60000 })
        .then(() => true)
        .catch(() => false);
      if (!loaded) fails.push("my-work-detail @" + w + " vẫn 'Đang tải' sau 60s");
      await page.addStyleTag({ content: "nextjs-portal{display:none!important}" }).catch(() => {});
      await page.screenshot({ path: path.join(OUT, "my-work-detail-" + w + ".png"), fullPage: true });
      checks++;
      const body = await page.innerText("body").catch(() => "");
      if (ERR_BOUNDARY.test(body)) fails.push("my-work-detail @" + w + " error boundary");
      if (SECRET_LEAK.test(body)) fails.push("my-work-detail @" + w + " LỘ chi tiết kỹ thuật (env/GEMINI)");
      console.log("ok   submit-flow @" + w + " → " + page.url().replace(BASE, ""));
      await ctx.close();
    }
  }
  const expected = MAIN.length * 2 + sessions.length * 2 + submitRuns.length * 2;
  await browser.close();
  if (checks < expected) fails.push("thiếu bước kiểm: chỉ chạy " + checks + "/" + expected);
  if (fails.length) { console.error("\\nSMOKE FAIL (" + checks + "/" + expected + " bước):\\n" + fails.join("\\n")); process.exit(1); }
  console.log("\\nSMOKE PASS — " + checks + "/" + expected + " bước kiểm — ảnh: " + OUT);
})().catch((e) => { console.error(e); process.exit(1); });
`;
writeFileSync(path.join(pwDir, "spec.cjs"), spec);
run("node", [path.join(pwDir, "spec.cjs")], { stdio: "inherit", env: { ...process.env }, cwd: pwDir });
console.log("[smoke] done — postgres tạm & dev server đã dọn");
process.exit(0);
