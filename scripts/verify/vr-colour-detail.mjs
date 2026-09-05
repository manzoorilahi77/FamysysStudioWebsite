// Close-ups of the four places the expanded palette lands, so each can be looked at
// rather than inferred from a computed style. Temporary — deleted after the run.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const PORT = Number(process.argv[2] ?? 3100);
const OUT = process.argv[3] ?? "shots-colour";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const base = `http://127.0.0.1:${PORT}`;

const settle = async () => {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.6;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 220));
    }
  });
  await page.waitForTimeout(500);
};

const shoot = async (selector, file, padding = 24) => {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) {
    console.log(`  MISSING ${selector}`);
    return;
  }
  await page.evaluate((s) => {
    document.querySelector(s)?.scrollIntoView({ block: "center", behavior: "instant" });
  }, selector);
  await page.waitForTimeout(700);
  const after = await page.locator(selector).first().boundingBox();
  await page.screenshot({
    path: `${OUT}/${file}.png`,
    clip: {
      x: Math.max(0, after.x - padding),
      y: Math.max(0, after.y - padding),
      width: Math.min(1440 - Math.max(0, after.x - padding), after.width + padding * 2),
      height: Math.min(900 - Math.max(0, after.y - padding), after.height + padding * 2),
    },
  });
  console.log(`  wrote ${file}.png`);
};

// 1. The Differentiator row — accent, card, warm, card.
console.log("home:");
await page.goto(`${base}/`, { waitUntil: "networkidle" });
await settle();
await shoot("div.grid:has(.element-card)", "detail-differentiator-cards");

// 2. Category chips and the status marker, on the work tiles.
console.log("selected-work:");
await page.goto(`${base}/selected-work`, { waitUntil: "networkidle" });
await settle();
await shoot(".work-chips", "detail-category-chips", 40);
await shoot(".media-tile-chip", "detail-status-marker", 40);

// 3. The warm process numeral on a dark ground.
console.log("how-we-work:");
await page.goto(`${base}/how-we-work`, { waitUntil: "networkidle" });
await settle();
await shoot(".surface-dark .step-numeral", "detail-process-numeral", 40);

// 4. The page's one highlight moment — the closing CTA, hovered.
console.log("closing CTA hover:");
await page.goto(`${base}/about`, { waitUntil: "networkidle" });
await settle();
const cta = page.locator(".cta-highlight").first();
await cta.scrollIntoViewIfNeeded();
await page.waitForTimeout(500);
const rest = await cta.boundingBox();
await page.screenshot({
  path: `${OUT}/detail-cta-resting.png`,
  clip: { x: rest.x - 30, y: rest.y - 30, width: rest.width + 60, height: rest.height + 60 },
});
await cta.hover();
await page.waitForTimeout(600);
const hovered = await cta.boundingBox();
await page.screenshot({
  path: `${OUT}/detail-cta-hovered.png`,
  clip: {
    x: hovered.x - 30,
    y: hovered.y - 30,
    width: hovered.width + 60,
    height: hovered.height + 60,
  },
});
console.log("  hovered fill:", await cta.evaluate((el) => getComputedStyle(el).backgroundColor));

await browser.close();
