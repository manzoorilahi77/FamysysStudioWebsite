// THE MOBILE HARNESS. It measures; it does not judge.
//
// Everything the mobile pass claims is asserted here against a production build, so a
// regression is a failing run rather than a screenshot somebody has to look at. Three
// things it checks that eyes are bad at:
//
//   HORIZONTAL OVERFLOW, as `documentElement.scrollWidth === clientWidth`. A page ten
//   pixels too wide looks fine in a screenshot and feels broken in the hand. A box inside
//   its own horizontal scroller is exempt — the process bar on /how-we-work is meant to
//   be wider than the phone and is meant to be swiped.
//
//   TAP TARGETS, at 44px. It credits a card whose trigger is a stretched pseudo-element
//   (`.work-tile-trigger::after { inset: 0 }` is the real target; the button's own box is
//   four words of a title) and skips anything inert or visually hidden, so the skip link
//   at 1x1 is not reported as a failure every run.
//
//   HOW TALL THE PAGE IS IN SCREENS, which is the number that says whether a section is
//   spending a reader's scroll well.
//
// Usage: `node scripts/verify/vr-mobile.mjs` against a production server. `BASE` chooses
// the server, `OUT` where audit.json and the screenshots land. Exit code is non-zero when
// anything is found, so it can gate.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const BASE = process.env.BASE ?? "http://localhost:4610";
const OUT = process.env.OUT ?? path.resolve("shots-mobile");
mkdirSync(OUT, { recursive: true });

const PAGES = [
  ["home", "/"],
  ["creative-services", "/creative-services"],
  ["how-we-work", "/how-we-work"],
  ["ways-to-work-with-us", "/ways-to-work-with-us"],
  ["selected-work", "/selected-work"],
  ["about", "/about"],
  ["contact", "/contact"],
];

/**
 * Real devices, not arbitrary breakpoints, and each one carries WHAT IT IS POINTED WITH.
 *
 * That flag is not a detail. The site raises its targets to 44px under
 * `@media (pointer: coarse)` and holds 24px otherwise, which is the right rule — a mouse
 * placed to the pixel does not need a thumb's margin — and it means a harness that
 * asserts one number everywhere is wrong half the time. 1024 appears TWICE for exactly
 * this reason: it is a desktop window and it is also an iPad in landscape, and the two
 * have different floors.
 *
 * The last three are the awkward ones: the short phone, the phone on its side, and the
 * tablet that is as wide as a laptop and has no cursor.
 */
const SIZES = [
  ["320x800", 320, 800, true],
  ["360x800", 360, 800, true],
  ["390x844", 390, 844, true],
  ["430x932", 430, 932, true],
  ["768x1024", 768, 1024, true],
  ["820x1180", 820, 1180, true],
  ["1024x900", 1024, 900, false],
  ["1024x768 touch", 1024, 768, true],
  ["390x667", 390, 667, true],
  ["844x390", 844, 390, true],
];

/** A thumb's floor, and a cursor's — WCAG 2.5.8 puts the second at 24. */
const TOUCH_TAP = 44;
const POINTER_TAP = 24;

const INTERACTIVE =
  'a[href], button:not([disabled]), input:not([type=hidden]), select, textarea, summary, [role="button"]';

/**
 * One page at one size. `hasTouch` is what makes `(pointer: coarse)` and `(hover: none)`
 * match in Chromium, so it is the switch that decides which half of the site's own rules
 * the page under test is running — verified, not assumed.
 */
async function open(browser, width, height, touch, extra = {}) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    hasTouch: touch,
    ...extra,
  });
  return { context, page: await context.newPage() };
}

/** Walk the page so lazy images and every scroll-driven layer settle, then come back. */
async function settle(page) {
  await page.waitForTimeout(400);
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.85;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 45));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(350);
}

async function measure(page, minTap, interactive) {
  return page.evaluate(
    ({ minTap, interactive }) => {
      const doc = document.documentElement;

      /** The box a thumb actually has to hit, which is not always the element's own. */
      function targetRect(element) {
        const own = element.getBoundingClientRect();
        const after = getComputedStyle(element, "::after");
        const stretched =
          after.content !== "none" &&
          after.position === "absolute" &&
          after.insetBlockStart === "0px" &&
          after.insetInlineStart === "0px" &&
          after.insetBlockEnd === "0px" &&
          after.insetInlineEnd === "0px";
        if (!stretched) {
          return own;
        }
        let node = element.parentElement;
        while (node) {
          if (getComputedStyle(node).position !== "static") {
            return node.getBoundingClientRect();
          }
          node = node.parentElement;
        }
        return own;
      }

      /** True when some ancestor scrolls or clips horizontally on purpose. */
      function insideScroller(element) {
        let node = element.parentElement;
        while (node && node !== document.body) {
          const overflowX = getComputedStyle(node).overflowX;
          if (overflowX === "auto" || overflowX === "scroll" || overflowX === "clip") {
            return true;
          }
          node = node.parentElement;
        }
        return false;
      }

      const offenders = [];
      if (doc.scrollWidth > doc.clientWidth) {
        for (const element of document.querySelectorAll("body *")) {
          const style = getComputedStyle(element);
          if (style.display === "none" || style.visibility === "hidden") continue;
          const rect = element.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) continue;
          if (rect.right <= doc.clientWidth + 1 && rect.left >= -1) continue;
          if (insideScroller(element)) continue;
          offenders.push({
            tag: element.tagName.toLowerCase(),
            cls: String(element.className || "").slice(0, 60),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
          });
        }
      }

      const small = [];
      const seen = new Set();
      for (const element of document.querySelectorAll(interactive)) {
        const style = getComputedStyle(element);
        if (style.display === "none" || style.visibility === "hidden") continue;
        if (element.closest("[inert]")) continue;
        // The skip link is 1x1 until it takes focus, which is the whole point of it.
        if (String(element.className || "").includes("sr-only")) continue;
        const rect = targetRect(element);
        if (rect.width === 0 || rect.height === 0) continue;
        const w = Math.round(rect.width * 10) / 10;
        const h = Math.round(rect.height * 10) / 10;
        if (w >= minTap && h >= minTap) continue;
        const label = (element.getAttribute("aria-label") || element.textContent || "")
          .trim()
          .slice(0, 40);
        const key = `${element.tagName}|${label}|${w}x${h}`;
        if (seen.has(key)) continue;
        seen.add(key);
        small.push({
          tag: element.tagName.toLowerCase(),
          cls: String(element.className || "").slice(0, 50),
          label,
          w,
          h,
        });
      }

      return {
        scrollWidth: doc.scrollWidth,
        clientWidth: doc.clientWidth,
        documentHeight: document.body.scrollHeight,
        viewportHeight: window.innerHeight,
        offenders: offenders.slice(0, 10),
        small: small.slice(0, 40),
      };
    },
    { minTap, interactive },
  );
}

const results = [];
let findings = 0;
const browser = await chromium.launch();

for (const [name, url] of PAGES) {
  for (const [label, width, height, touch] of SIZES) {
    const minTap = touch ? TOUCH_TAP : POINTER_TAP;
    const { context, page } = await open(browser, width, height, touch);
    await page.goto(`${BASE}${url}`, { waitUntil: "networkidle", timeout: 60_000 });
    await settle(page);
    // The site's rules key off the pointer, so the harness proves the emulation took
    // before it trusts a single measurement made under it.
    const coarse = await page.evaluate(() => matchMedia("(pointer: coarse)").matches);
    if (coarse !== touch) {
      throw new Error(
        `pointer emulation did not take at ${label}: expected coarse=${touch}, got ${coarse}`,
      );
    }
    const m = await measure(page, minTap, INTERACTIVE);
    const overflowed = m.scrollWidth > m.clientWidth;
    if (overflowed || m.small.length > 0) findings += 1;
    results.push({ page: name, size: label, touch, minTap, ...m });
    const screens = (m.documentHeight / m.viewportHeight).toFixed(1);
    console.log(
      `${name.padEnd(21)} ${label.padEnd(15)} ${touch ? "touch" : "mouse"} sw=${String(
        m.scrollWidth,
      ).padStart(4)} cw=${String(m.clientWidth).padStart(4)}${
        overflowed ? " OVERFLOW" : "        "
      } screens=${screens.padStart(5)} under-${minTap}=${m.small.length}`,
    );
    for (const o of m.offenders.slice(0, 4)) {
      console.log(`      overflow: ${o.tag}.${o.cls} L${o.left} R${o.right}`);
    }
    for (const s of m.small.slice(0, 8)) {
      console.log(`      tap ${s.w}x${s.h}  ${s.tag}.${s.cls} "${s.label}"`);
    }
    await context.close();
  }
}

// Screenshots at 390, MID-SCROLL rather than full-page: a full-page capture of a sticky
// or scroll-driven section shows a composite state no reader ever sees.
const shotDir = path.join(OUT, "390");
mkdirSync(shotDir, { recursive: true });
for (const [name, url] of PAGES) {
  const { context, page } = await open(browser, 390, 844, true);
  await page.goto(`${BASE}${url}`, { waitUntil: "networkidle", timeout: 60_000 });
  await settle(page);
  const total = await page.evaluate(() => document.body.scrollHeight);
  const stops = [0, 0.18, 0.36, 0.54, 0.72, 0.9];
  for (const [index, fraction] of stops.entries()) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(total * fraction));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(shotDir, `${name}-${String(index + 1).padStart(2, "0")}.png`),
    });
  }
  await context.close();
}

await browser.close();
writeFileSync(path.join(OUT, "audit.json"), JSON.stringify(results, null, 2));
console.log(`\nscreenshots: ${shotDir}`);
console.log(`audit: ${path.join(OUT, "audit.json")}`);
console.log(
  findings === 0
    ? "\nPASS - no horizontal overflow; every target clears its own pointer's floor"
    : `\n${findings} size(s) with findings`,
);
process.exitCode = findings === 0 ? 0 : 1;
