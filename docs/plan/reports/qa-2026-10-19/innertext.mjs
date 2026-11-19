// Dumps rendered body innerText per URL for content verification.
// Usage: node innertext.mjs <baseUrl> <url1> <url2> ...
import { chromium } from "/Volumes/SSD M1/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs";

const base = process.argv[2];
const urls = process.argv.slice(3);
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
for (const u of urls) {
  try {
    await page.goto(base + u, { waitUntil: "networkidle", timeout: 45000 });
    await page.waitForTimeout(800);
    const text = await page.evaluate(() => document.body.innerText);
    console.log(`\n===== ${u} =====\n${text.slice(0, 1500)}`);
  } catch (e) {
    console.log(`\n===== ${u} ===== GOTO-ERROR: ${e.message}`);
  }
}
await browser.close();
