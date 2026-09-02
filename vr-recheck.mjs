// Re-runs the four assertions the main harness got WRONG IN THE CHECKER, not in the page:
//   - stroke-dashoffset computes to "1px"/"0px" and was compared against "1"/0
//   - a `display: none` pseudo-element still reports its `content`, so the reduced-motion
//     sweep check read "" where it expected "none"; the right question is `display`.
// Temporary — deleted after the run.
import { chromium } from "@playwright/test";

const BASE = "http://127.0.0.1:3100";
let pass = 0;
const failures = [];
function ok(cond, label, detail = "") {
  if (cond) pass += 1;
  else {
    failures.push(`${label} :: ${detail}`);
    console.log(`FAIL ${label} :: ${detail}`);
  }
}

async function settle(page) {
  await page.waitForLoadState("load").catch(() => {});
  await page.waitForTimeout(1200);
}
async function revealAll(page, selector) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.6;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 160));
    }
  });
  await page.waitForTimeout(1200);
  await page.evaluate((sel) => document.querySelector(sel).scrollIntoView(), selector);
  await page.waitForTimeout(800);
}

const browser = await chromium.launch();

for (const reduced of [false, true]) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: reduced ? "reduce" : "no-preference",
  });
  const page = await context.newPage();
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await settle(page);
  await revealAll(page, ".reason-title");

  const rest = await page.evaluate(() =>
    [...document.querySelectorAll(".reason-icon-draw")].map(
      (g) => getComputedStyle(g).strokeDashoffset,
    ),
  );
  if (reduced) {
    ok(
      rest.every((v) => parseFloat(v) === 0),
      "reduced motion: all five marks fully drawn",
      JSON.stringify(rest),
    );
    await page.evaluate(() => document.querySelector(".faq-list").scrollIntoView());
    await page.waitForTimeout(600);
    const sweep = await page.evaluate(() =>
      [...document.querySelectorAll('.faq-trigger[aria-expanded="false"]')].map(
        (t) => getComputedStyle(t, "::before").display,
      ),
    );
    ok(
      sweep.length > 0 && sweep.every((d) => d === "none"),
      "reduced motion: no sweep on any closed FAQ row",
      JSON.stringify(sweep),
    );
  } else {
    ok(
      rest.every((v) => parseFloat(v) === 1),
      "all five marks rest undrawn",
      JSON.stringify(rest),
    );
    await page.locator(".reason-title").first().hover();
    await page.waitForTimeout(800);
    const hovered = await page.evaluate(
      () =>
        getComputedStyle(
          document.querySelector(".reason-title").closest(".capability-card")
            .querySelector(".reason-icon-draw"),
        ).strokeDashoffset,
    );
    ok(parseFloat(hovered) === 0, "hover draws the mark to full", hovered);
  }
  await context.close();
}

await browser.close();
console.log(`\n===== recheck: ${pass} PASS, ${failures.length} FAIL =====`);
process.exit(failures.length === 0 ? 0 : 1);
