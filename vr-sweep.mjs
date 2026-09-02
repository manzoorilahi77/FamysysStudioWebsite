// Closes the gap axe left open. Every `color-contrast` INCOMPLETE in the main run is a
// case where axe could not resolve a background: text over the drifting mosaic, or text
// over a `scaleX` pseudo-element sweep. The mosaic is pixel-sampled in the main harness;
// this handles the sweeps — FAQ rows, header panel rows and the capability rows on
// /selected-work — by compositing the layers analytically instead.
//
// Analytic rather than sampled on purpose. A sweep is a `transform: scaleX()` on a
// pseudo-element, so at rest it paints nothing and under a pointer it paints the full row;
// the question is not what one frame happened to show, it is whether the text clears its
// floor over BOTH possible grounds. Compositing the declared layers answers that exactly,
// and a screenshot of a mid-transition frame would not.
// Temporary — deleted after the run.
import { chromium } from "@playwright/test";

const BASE = "http://127.0.0.1:3100";
let pass = 0;
const failures = [];
const notes = [];
function ok(cond, label, detail = "") {
  if (cond) pass += 1;
  else {
    failures.push(`${label} :: ${detail}`);
    console.log(`FAIL ${label} :: ${detail}`);
  }
}

/**
 * Text colour, and the two grounds it can sit on: the opaque background it inherits, and
 * that background with the row's sweep pseudo-element composited over it.
 */
async function measure(page, textSelector, rowSelector) {
  return page.evaluate(
    ({ textSelector, rowSelector }) => {
      function parse(value) {
        const m = String(value).match(/-?[\d.]+/g);
        if (!m) return null;
        return [Number(m[0]), Number(m[1]), Number(m[2]), m.length > 3 ? Number(m[3]) : 1];
      }
      function over(top, bottom) {
        const a = top[3];
        return [
          top[0] * a + bottom[0] * (1 - a),
          top[1] * a + bottom[1] * (1 - a),
          top[2] * a + bottom[2] * (1 - a),
          1,
        ];
      }
      function lin(c) {
        const s = c / 255;
        return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      }
      function lum(p) {
        return 0.2126 * lin(p[0]) + 0.7152 * lin(p[1]) + 0.0722 * lin(p[2]);
      }
      function ratio(a, b) {
        const la = lum(a);
        const lb = lum(b);
        return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
      }
      /** First fully opaque background up the tree. */
      function opaqueGround(el) {
        let node = el;
        while (node && node !== document.documentElement) {
          const c = parse(getComputedStyle(node).backgroundColor);
          if (c && c[3] > 0.99) return c;
          node = node.parentElement;
        }
        return parse(getComputedStyle(document.body).backgroundColor);
      }
      /** Every translucent background between `el` and its opaque ground, bottom-up. */
      function translucentLayers(el) {
        const layers = [];
        let node = el;
        while (node && node !== document.documentElement) {
          const c = parse(getComputedStyle(node).backgroundColor);
          if (c && c[3] > 0.99) break;
          if (c && c[3] > 0) layers.unshift(c);
          node = node.parentElement;
        }
        return layers;
      }

      const text = document.querySelector(textSelector);
      const row = document.querySelector(rowSelector);
      const style = getComputedStyle(text);
      const textColor = parse(style.color);

      let ground = opaqueGround(text);
      for (const layer of translucentLayers(text)) ground = over(layer, ground);

      // The sweep itself: the row's ::before, which is what axe cannot resolve.
      const sweep = parse(getComputedStyle(row, "::before").backgroundColor);
      const sweptGround = sweep && sweep[3] > 0 ? over(sweep, ground) : ground;

      // A translucent text colour has to be composited too, against whichever ground.
      const flat = (fg, bg) => (fg[3] > 0.99 ? fg : over(fg, bg));

      return {
        color: style.color,
        size: parseFloat(style.fontSize),
        weight: style.fontWeight,
        rest: ratio(flat(textColor, ground), ground),
        swept: ratio(flat(textColor, sweptGround), sweptGround),
        groundRgb: `rgb(${ground.slice(0, 3).map(Math.round).join(", ")})`,
        sweptRgb: `rgb(${sweptGround.slice(0, 3).map(Math.round).join(", ")})`,
      };
    },
    { textSelector, rowSelector },
  );
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

async function settle() {
  await page.waitForLoadState("load").catch(() => {});
  await page.waitForTimeout(1200);
}

function check(label, r, floor) {
  ok(r.rest >= floor, `${label} clears ${floor}:1 at rest`, `${r.rest.toFixed(3)}:1`);
  ok(r.swept >= floor, `${label} clears ${floor}:1 under the sweep`, `${r.swept.toFixed(3)}:1`);
  notes.push(
    `${label}: ${r.color} @${r.size}px/${r.weight} — ${r.rest.toFixed(3)}:1 on ${r.groundRgb}, ` +
      `${r.swept.toFixed(3)}:1 on ${r.sweptRgb} (floor ${floor})`,
  );
}

// --- FAQ rows. The question is ink; hovering a CLOSED row sweeps ink-04 behind it.
await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
await settle();
await page.evaluate(() => document.querySelector(".faq-list").scrollIntoView());
await page.waitForTimeout(1400);
check(
  "FAQ question",
  await measure(page, ".faq-row:first-child .faq-question", ".faq-row:first-child .faq-trigger"),
  4.5,
);

// --- Header panel rows: title at rest, and title in accent under the sweep.
await page.evaluate(() => window.scrollTo(0, 600));
await page.waitForTimeout(700);
await page.getByRole("link", { name: "Creative Services", exact: true }).first().hover();
await page.waitForTimeout(800);
check(
  "panel row title (rest colour)",
  await measure(
    page,
    "#nav-panel-creative-services .nav-panel-link-title",
    "#nav-panel-creative-services .nav-panel-link",
  ),
  4.5,
);
await page.locator("#nav-panel-creative-services .nav-panel-link").first().hover();
await page.waitForTimeout(600);
check(
  "panel row title (hover colour)",
  await measure(
    page,
    "#nav-panel-creative-services .nav-panel-link-title",
    "#nav-panel-creative-services .nav-panel-link",
  ),
  4.5,
);
check(
  "panel row descriptor",
  await measure(
    page,
    "#nav-panel-creative-services .nav-panel-link-body span:nth-child(2)",
    "#nav-panel-creative-services .nav-panel-link",
  ),
  4.5,
);
await page.keyboard.press("Escape");
await page.mouse.move(20, 20);
await page.waitForTimeout(400);

// --- Capability rows on /selected-work: name at 4.5, decorative arrow at the 3:1 graphic floor.
await page.goto(BASE + "/selected-work", { waitUntil: "domcontentloaded" });
await settle();
await page.evaluate(() => document.querySelector(".capability-links").scrollIntoView());
await page.waitForTimeout(1600);
check(
  "capability row name",
  await measure(
    page,
    ".capability-row:first-child .capability-link-name",
    ".capability-row:first-child .capability-link",
  ),
  4.5,
);
check(
  "capability row arrow (rest colour)",
  await measure(
    page,
    ".capability-row:first-child .capability-link-arrow",
    ".capability-row:first-child .capability-link",
  ),
  3,
);
await page.locator(".capability-link").first().hover();
await page.waitForTimeout(600);
check(
  "capability row arrow (hover colour)",
  await measure(
    page,
    ".capability-row:first-child .capability-link-arrow",
    ".capability-row:first-child .capability-link",
  ),
  3,
);

await context.close();
await browser.close();
console.log("\n----- NOTES -----");
for (const n of notes) console.log(n);
console.log(`\n===== sweeps: ${pass} PASS, ${failures.length} FAIL =====`);
process.exit(failures.length === 0 ? 0 : 1);
