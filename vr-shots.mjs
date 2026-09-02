// Screenshot pass for the polish work. Temporary — deleted after the run.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = "http://127.0.0.1:3100";
const OUT = process.argv[2] ?? "shots";
mkdirSync(OUT, { recursive: true });

const ROUTES = [
  ["/", "home"],
  ["/creative-services", "services"],
  ["/how-we-work", "how-we-work"],
  ["/ways-to-work-with-us", "ways"],
  ["/selected-work", "work"],
  ["/about", "about"],
  ["/contact", "contact"],
];

const browser = await chromium.launch();

async function settle(page) {
  await page.waitForLoadState("load").catch(() => {});
  // Every <img> decoded, or the capture shows empty frames where the photography is.
  await page
    .waitForFunction(
      () => [...document.images].every((i) => i.complete && i.naturalWidth > 0),
      null,
      { timeout: 20000 },
    )
    .catch(() => {});
  await page.waitForTimeout(1200);
}

/** Walks the page so every scroll reveal has fired before the full-page capture. */
async function walk(page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.7;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 220));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1200);
}

for (const width of [390, 1440]) {
  // A fresh context per route. Sharing one across all seven produced six blank captures:
  // walking a page prefetches every route its links point at, and a failed prefetch is
  // cached as a failure, so the real navigation afterwards dies on "Loading chunk N failed"
  // and renders nothing. An empty cache cannot inherit that.
  for (const [route, name] of ROUTES) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.goto(BASE + route, { waitUntil: "domcontentloaded" });
    await settle(page);
    await walk(page);
    await page.screenshot({ path: `${OUT}/${name}-${width}.png`, fullPage: true });
    await context.close();
  }
}

// The header at scroll 0, over the mosaic, and again scrolled.
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await settle(page);
  await page.screenshot({
    path: `${OUT}/header-scroll0-1440.png`,
    clip: { x: 0, y: 0, width: 1440, height: 220 },
  });
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(900);
  await page.screenshot({
    path: `${OUT}/header-scrolled-1440.png`,
    clip: { x: 0, y: 0, width: 1440, height: 220 },
  });

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(900);
  await page.screenshot({
    path: `${OUT}/hero-scroll0-1440.png`,
    clip: { x: 0, y: 0, width: 1440, height: 900 },
  });

  // Each panel open.
  for (const [name, file] of [
    ["Creative Services", "panel-services"],
    ["Ways to Work With Us", "panel-ways"],
    ["Selected Work", "panel-work"],
  ]) {
    await page.getByRole("link", { name, exact: true }).first().hover();
    await page.waitForTimeout(900);
    await page.screenshot({
      path: `${OUT}/${file}-1440.png`,
      clip: { x: 0, y: 0, width: 1440, height: 700 },
    });
    await page.keyboard.press("Escape");
    await page.mouse.move(50, 800);
    await page.waitForTimeout(500);
  }
  await context.close();
}

// Why Famysys, mid-hover.
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await settle(page);
  // Walk first: the cards enter behind a clip curtain, and a card that has not been
  // revealed photographs as empty space.
  await walk(page);
  await page.evaluate(() => {
    const el = document.querySelector(".reason-title");
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 300);
  });
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `${OUT}/why-famysys-rest-1440.png` });

  // Playwright's own hover, not a raw mouse.move: it scrolls the target into view and
  // dispatches the pointer events the CSS :hover actually needs.
  await page.locator(".reason-title").first().hover();
  // Mid-draw: the mark takes 400ms, so this catches the stroke part-way in.
  await page.waitForTimeout(150);
  await page.screenshot({ path: `${OUT}/why-famysys-mid-hover-1440.png` });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/why-famysys-hovered-1440.png` });
  await context.close();
}

// The homepage work grid, the Why Famysys grid, the filter chips and the FAQ.
//
// Framed by scrolling the element to just under the header and taking a plain viewport
// shot, rather than `locator.screenshot()`, which waits for the element to be "stable" and
// times out on a page where something is always transitioning.
//
// ONE CONTEXT PER ROUTE, deliberately. Walking a page puts every nav and footer link in
// view, Next prefetches the routes they point at, and a prefetch that fails is cached as a
// failure — the next real navigation to that route then dies on "Loading chunk N failed"
// and renders nothing. A fresh context has an empty cache and cannot inherit that.
async function shoot(route, steps) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1200 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  async function frame(selector, file, offset = 120) {
    await page.waitForSelector(selector, { state: "attached", timeout: 20000 }).catch(() => {
      throw new Error(`frame(): ${selector} never appeared on ${page.url()}`);
    });
    await page.evaluate(
      ({ selector, offset }) => {
        const el = document.querySelector(selector);
        window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - offset);
      },
      { selector, offset },
    );
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${OUT}/${file}` });
  }

  await page.goto(BASE + route, { waitUntil: "domcontentloaded" });
  await settle(page);
  await walk(page);
  await steps(page, frame);
  await context.close();
}

await shoot("/", async (page, frame) => {
  await frame(".work-grid", "home-work-grid-1440.png");
  await frame(".reason-title", "why-famysys-grid-1440.png", 320);
});

await shoot("/selected-work", async (page, frame) => {
  await frame(".work-filter", "work-filter-chips-1440.png");
});

await shoot("/", async (page, frame) => {
  await frame(".faq-list", "faq-closed-1440.png");
  await page.locator(".faq-row button").nth(2).click();
  await page.waitForTimeout(900);
  await frame(".faq-list", "faq-open-1440.png");
});

await browser.close();
console.log("shots written to " + OUT);
