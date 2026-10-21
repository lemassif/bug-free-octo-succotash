// Usage: node tests/tools/shot.mjs <url> <out.png> [script.js]
// Opens the game in headless Chromium, optionally runs a script in the page,
// and saves a screenshot plus console output.
import { chromium } from "@playwright/test";
import fs from "node:fs";
const [url, out, scriptPath] = process.argv.slice(2);
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on("console", (m) => console.log("[page]", m.type(), m.text()));
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
await page.goto(url, { waitUntil: "load" });
await page.waitForTimeout(1500);
if (scriptPath) {
  const res = await page.evaluate(fs.readFileSync(scriptPath, "utf8"));
  console.log("[result]", JSON.stringify(res));
}
await page.screenshot({ path: out });
await browser.close();
