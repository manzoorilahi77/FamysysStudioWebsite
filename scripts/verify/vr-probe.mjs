import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
for (const p of ["/about", "/how-we-work"]) {
  await page.goto(`http://localhost:3000${p}`, { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1400);
  console.log(p, await page.evaluate(() => {
    const h = [...document.querySelectorAll("main > section")].pop().querySelector("h2");
    const cs = getComputedStyle(h);
    const r = h.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(h);
    const rects = range.getClientRects();
    return {
      text: h.textContent,
      width: Math.round(r.width),
      height: Math.round(r.height),
      maxWidth: cs.maxWidth,
      fontSize: cs.fontSize,
      lineHeight: cs.lineHeight,
      clientRects: rects.length,
      lineTops: [...new Set([...rects].map((x) => Math.round(x.top)))].length,
    };
  }));
}
await browser.close();
