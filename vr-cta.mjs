import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
mkdirSync("shots-cta", { recursive: true });
const PAGES = ["/", "/about", "/how-we-work", "/ways-to-work-with-us", "/selected-work", "/creative-services"];
const browser = await chromium.launch();
for (const w of [1440, 1024]) {
  const context = await browser.newContext({ viewport: { width: w, height: 900 } });
  const page = await context.newPage();
  for (const p of PAGES) {
    await page.goto(`http://localhost:3000${p}`, { waitUntil: "load" });
    await page.waitForSelector("main > section:last-child .grid", { timeout: 60000 });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1600);
    const m = await page.evaluate(() => {
      const section = [...document.querySelectorAll("main > section")].pop();
      const grid = section.querySelector(".grid");
      const [left, panel] = grid.children;
      const h = left.querySelector("h2");
      const closing = left.querySelector("p:last-of-type");
      const lr = left.getBoundingClientRect();
      const pr = panel.getBoundingClientRect();
      const hr = h.getBoundingClientRect();
      return {
        heading: h.textContent.slice(0, 26),
        lines: Math.round(hr.height / parseFloat(getComputedStyle(h).lineHeight)),
        leftTop: Math.round(lr.top), leftBottom: Math.round(lr.bottom),
        panelTop: Math.round(pr.top), panelBottom: Math.round(pr.bottom),
        closingBottom: Math.round(closing.getBoundingClientRect().bottom),
      };
    });
    console.log(
      `${w} ${p}`.padEnd(27),
      `lines ${m.lines}  left ${m.leftTop}..${m.leftBottom}  panel ${m.panelTop}..${m.panelBottom}  closingBottom ${m.closingBottom}  "${m.heading}"`,
    );
  }
  if (w === 1440) {
    await page.goto("http://localhost:3000/ways-to-work-with-us", { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1600);
    const last = page.locator("main > section").last();
    await last.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    await last.screenshot({ path: "shots-cta/ways.png" });
  }
  await context.close();
}
await browser.close();
