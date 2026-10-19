// QA capture helper — screenshots + console/pageerror log per page.
// Usage: node capture.mjs <baseUrl> <specFile.json>
// specFile: [{ "url": "/login", "name": "login", "viewport": [390, 844] }, ...]
// Writes {name}-{width}.png + console-log entries into outDir (same dir as spec).
import { chromium } from "/Volumes/SSD M1/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const base = process.argv[2];
const specPath = process.argv[3];
const outDir = dirname(specPath);
const specs = JSON.parse(readFileSync(specPath, "utf8"));

const consoleLog = [];
const browser = await chromium.launch();

for (const spec of specs) {
  const [w, h] = spec.viewport;
  const context = await browser.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  const pageLogs = [];
  page.on("console", (msg) => {
    const type = msg.type();
    if (type === "error" || type === "warning") {
      pageLogs.push(`[console.${type}] ${msg.text()}`);
    }
  });
  page.on("pageerror", (err) => {
    pageLogs.push(`[pageerror] ${err.message}`);
  });
  page.on("requestfailed", (req) => {
    // ignore expected 404s of missing icons etc? still record
    pageLogs.push(`[requestfailed] ${req.url()} :: ${req.failure()?.errorText}`);
  });

  const url = base + spec.url;
  let status = "n/a";
  try {
    const resp = await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 45000,
    });
    status = resp ? resp.status() : "no-response";
    await page.waitForTimeout(1200);
  } catch (e) {
    pageLogs.push(`[goto-error] ${e.message}`);
  }
  const file = join(outDir, `${spec.name}-${w}.png`);
  try {
    await page.screenshot({ path: file, fullPage: false });
  } catch (e) {
    pageLogs.push(`[screenshot-error] ${e.message}`);
  }
  consoleLog.push({
    url,
    name: spec.name,
    viewport: `${w}x${h}`,
    status,
    logs: pageLogs,
  });
  await context.close();
  console.log(`done ${spec.name}-${w}.png status=${status} logs=${pageLogs.length}`);
}

await browser.close();
writeFileSync(
  join(outDir, "console-log.json"),
  JSON.stringify(consoleLog, null, 2)
);
