// Full-page screenshots of all seven routes at 1440, plus a console-error check on each,
// against the static export in out/. Temporary — deleted after the run.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

const PORT = Number(process.argv[2] ?? 3100);
const OUT = process.argv[3] ?? "shots-colour";
const ROUTES = [
  ["home", "/"],
  ["about", "/about"],
  ["contact", "/contact"],
  ["creative-services", "/creative-services"],
  ["how-we-work", "/how-we-work"],
  ["selected-work", "/selected-work"],
  ["ways-to-work-with-us", "/ways-to-work-with-us"],
];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const problems = [];
page.on("console", (m) => {
  if (m.type() === "error") problems.push(`CONSOLE ${page.url()} :: ${m.text()}`);
});
page.on("pageerror", (e) => problems.push(`PAGEERROR ${page.url()} :: ${e.message}`));
page.on("response", (r) => {
  if (r.status() >= 400) problems.push(`HTTP ${r.status()} ${r.url()}`);
});

for (const [name, route] of ROUTES) {
  await page.goto(`http://127.0.0.1:${PORT}${route}`, { waitUntil: "networkidle" });
  // Walk the page so every in-view reveal fires before the full-page capture.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 400));
  });
  await page.waitForTimeout(600);
  const height = await page.evaluate(() => document.body.scrollHeight);

  // Viewport captures at even offsets, not one fullPage image: several sections pin a
  // sticky stage and reveal against scroll progress, and a stitched full-page shot of a
  // pinned stage shows the stage once and the track it travels in as blank. What a person
  // sees is the viewport at a scroll position, so that is what gets captured.
  const shots = 4;
  for (let i = 0; i < shots; i += 1) {
    const y = Math.round(((height - 900) * i) / (shots - 1));
    await page.evaluate((to) => window.scrollTo(0, to), y);
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(OUT, `${name}-${i + 1}.png`) });
  }
  await page.evaluate(() => window.scrollTo(0, 0));

  // Section grounds actually rendered, in order — the alternation is only real if the
  // computed backgrounds differ where two same-family sections meet.
  const grounds = await page.evaluate(() =>
    [...document.querySelectorAll("main > section")].map((s) => {
      const r = s.getBoundingClientRect();
      return {
        bg: getComputedStyle(s).backgroundColor,
        h: Math.round(r.height),
        label: s.getAttribute("aria-label")?.slice(0, 28) ?? "",
      };
    }),
  );
  console.log(`\n=== ${name}  (${height}px tall)`);
  for (const g of grounds)
    console.log(`   ${g.bg.padEnd(22)} ${String(g.h).padStart(5)}px  ${g.label}`);
}

console.log(`\n${problems.length === 0 ? "NO CONSOLE ERRORS ON ANY ROUTE" : problems.join("\n")}`);
await browser.close();
