import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const PAGES = ["/", "/about", "/how-we-work", "/ways-to-work-with-us", "/selected-work", "/creative-services", "/contact"];
const WIDTHS = [390, 768, 1024, 1440, 1920];
const browser = await chromium.launch();
let violations = 0, overflow = 0, consoleErrors = 0;
for (const motion of ["no-preference", "reduce"]) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: motion === "reduce" ? "reduce" : "no-preference" });
  const page = await context.newPage();
  page.on("console", (m) => { if (m.type() === "error") { consoleErrors += 1; console.log(`CONSOLE ${motion} ${m.text().slice(0, 140)}`); } });
  page.on("pageerror", (e) => { consoleErrors += 1; console.log(`PAGEERROR ${motion} ${e.message.slice(0, 140)}`); });
  for (const path of PAGES) {
    await page.goto(`http://localhost:3000${path}`, { waitUntil: "load" });
    await page.waitForSelector("main > section:last-child", { timeout: 60000 });
    await page.waitForTimeout(900);
    for (const f of [0.55, 0.98]) {
      await page.evaluate((v) => window.scrollTo(0, document.body.scrollHeight * v), f);
      await page.waitForTimeout(800);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22aa"]).analyze();
      for (const v of results.violations) {
        violations += 1;
        console.log(`AXE ${motion} ${path} @${f} [${v.impact}] ${v.id} x${v.nodes.length}  ${v.nodes[0].target.join(" ")}`);
      }
    }
  }
  await context.close();
}
const context = await browser.newContext();
const page = await context.newPage();
for (const path of PAGES) {
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`http://localhost:3000${path}`, { waitUntil: "load" });
    await page.waitForTimeout(600);
    const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (wide > 1) { overflow += 1; console.log(`OVERFLOW ${path} @${width} +${wide}px`); }
  }
}
await browser.close();
console.log(`\naxe violations: ${violations}`);
console.log(`overflow failures: ${overflow}`);
console.log(`console errors: ${consoleErrors}`);
