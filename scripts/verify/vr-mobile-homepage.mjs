// THE FOUR MOBILE HOMEPAGE CHANGES, ASSERTED — and asserted at BOTH ends.
//
// Every claim the mobile pass makes is a check here rather than a screenshot somebody has
// to agree with. The desktop half is not a formality: three of the four changes are
// `display` rules on elements that must still render above the breakpoint, and a rule
// that leaks is invisible in a mobile screenshot by definition. So 1440 is measured for
// the ABSENCE of each change and for the presence of what it hides.
//
//   1  The bar is the SAME bar a desktop gets — the mark on its own clamp, the trigger a
//      plain word — with a 44px tap target that costs no visible size. An enlarged mark
//      and a bordered trigger were built and rejected; these checks are what stop them
//      coming back.
//   2  The hero strip is the accordion, in colour, showing the three bands the client
//      named — Colour, Design, Content — numbered 01 02 03 by their place in the strip
//      rather than in the list of six. The desktop accordion still shows all six, still
//      numbered from the markup.
//   5  The six capability cards spotlight themselves on scroll where there is no cursor:
//      whichever card's centre is nearest the middle of the screen wears the state hover
//      would have given it, and nothing is lit where a mouse is present.
//   3  The Differentiator is its closing statement alone below 900, with everything else
//      display:none and STILL IN THE DOM, and complete above it.
//   4  Ways to Work With Us is display:none below 900, in the DOM, and rendered above it.
//
// Plus what the whole page has to hold regardless: no horizontal overflow at four widths
// and two awkward viewports, every target at 44px, and no string that only exists under a
// cursor.
//
// THE HYDRATION GATE is `--header-height` on the document element. Header.tsx measures the
// bar and publishes it from an effect, so the property is absent until React has hydrated
// and present the moment it has — which is a real signal, unlike `networkidle`, and unlike
// a `data-` attribute whose server-rendered value is the same as its client one.
//
// Usage: `node scripts/verify/vr-mobile-homepage.mjs` against a production build.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const BASE = process.env.BASE ?? "http://127.0.0.1:4610";
const OUT = process.env.OUT ?? path.resolve("shots-mobile/homepage");
mkdirSync(OUT, { recursive: true });

/** The site's one breakpoint. Below it the four changes apply; at 901 and up, none do. */
const BREAKPOINT = 900;

const MOBILE = [
  ["320x800", 320, 800],
  ["360x800", 360, 800],
  ["390x844", 390, 844],
  ["430x932", 430, 932],
  ["390x667", 390, 667],
  ["844x390", 844, 390],
];

const TOUCH_TAP = 44;
const INTERACTIVE =
  'a[href], button:not([disabled]), input:not([type=hidden]), select, textarea, summary, [role="button"]';

let passed = 0;
const failures = [];

function check(condition, label, detail = "") {
  if (condition) {
    passed += 1;
    console.log(`  ok   ${label}`);
  } else {
    failures.push(`${label} :: ${detail}`);
    console.log(`  FAIL ${label} :: ${detail}`);
  }
}

async function open(browser, width, height, touch) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    hasTouch: touch,
  });
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  // THE GATE. Nothing below is measured against a page that has not hydrated.
  await page.waitForFunction(
    () =>
      getComputedStyle(document.documentElement).getPropertyValue("--header-height").trim() !== "",
    { timeout: 30_000 },
  );
  const coarse = await page.evaluate(() => matchMedia("(pointer: coarse)").matches);
  if (coarse !== touch) {
    throw new Error(`pointer emulation did not take: expected coarse=${touch}, got ${coarse}`);
  }
  return { context, page };
}

/** Walk the page so lazy images and every scroll-driven layer settle, then come back. */
async function settle(page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.85;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(500);
}

/** Everything one viewport can tell us about the four changes and the page around them. */
function readPage() {
  const doc = document.documentElement;
  const box = (element) => {
    if (!element) return null;
    const r = element.getBoundingClientRect();
    return {
      w: Math.round(r.width * 10) / 10,
      h: Math.round(r.height * 10) / 10,
      x: Math.round(r.left),
      right: Math.round(r.right),
      top: Math.round(r.top),
    };
  };
  /**
   * PAINTED, not "has a display value". `display: none` on an ANCESTOR does not change a
   * descendant's own computed display — the four element frames inside a hidden Container
   * still compute `display: flex` — so a check on the element's own style credits every
   * one of them as visible, which is the exact thing this file exists to disprove.
   * `checkVisibility` walks the ancestors; `getClientRects` is the fallback.
   */
  const shown = (element) => {
    if (!element) return false;
    if (typeof element.checkVisibility === "function") {
      return element.checkVisibility({ checkVisibilityCSS: true });
    }
    return element.getClientRects().length > 0;
  };

  const bar = document.querySelector("[data-header-bar]");
  const mark = document.querySelector(".cnav-mark img");
  const menu = document.querySelector(".cnav-menu");
  const navRow = document.querySelector(".cnav");

  const bands = Array.from(document.querySelectorAll(".hero-final-band"));
  const visibleBands = bands.filter(shown);

  const elementSection = document.querySelector(".element-section");
  const elementKids = elementSection ? Array.from(elementSection.children) : [];
  const thesis = document.querySelector(".element-thesis");
  const thesisLine = document.querySelector(".element-thesis-line");
  const frames = Array.from(document.querySelectorAll(".element-frame"));
  const ways = document.querySelector(".ways-section");
  const wayTiles = Array.from(document.querySelectorAll(".ways-section .tile"));

  // Horizontal overflow, and who is causing it.
  const offenders = [];
  if (doc.scrollWidth > doc.clientWidth) {
    for (const element of document.querySelectorAll("body *")) {
      const style = getComputedStyle(element);
      if (style.display === "none" || style.visibility === "hidden") continue;
      const r = element.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.right <= doc.clientWidth + 1 && r.left >= -1) continue;
      let node = element.parentElement;
      let scroller = false;
      while (node && node !== document.body) {
        const ox = getComputedStyle(node).overflowX;
        if (ox === "auto" || ox === "scroll" || ox === "clip") {
          scroller = true;
          break;
        }
        node = node.parentElement;
      }
      if (scroller) continue;
      offenders.push(
        `${element.tagName.toLowerCase()}.${String(element.className || "").slice(0, 40)} L${Math.round(r.left)} R${Math.round(r.right)}`,
      );
    }
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
    scrollWidth: doc.scrollWidth,
    clientWidth: doc.clientWidth,
    offenders: offenders.slice(0, 8),

    bar: box(bar),
    barPad: bar ? parseFloat(getComputedStyle(bar).paddingBlockStart) : null,
    mark: box(mark),
    menu: box(menu),
    menuShown: shown(menu),
    menuBorder: menu ? getComputedStyle(menu).borderTopWidth : null,
    menuFont: menu ? getComputedStyle(menu).fontSize : null,
    navRow: box(navRow),
    navGutter: navRow
      ? Math.round(parseFloat(getComputedStyle(navRow.parentElement).paddingInlineStart))
      : null,

    bandCount: bands.length,
    visibleBandCount: visibleBands.length,
    bandBoxes: visibleBands.map(box),
    bandFilters: visibleBands.map((b) => getComputedStyle(b.querySelector("img")).filter),
    // The band's NAME, without the numeral the label also carries.
    bandNames: visibleBands.map((b) =>
      (b.querySelector(".hero-final-band-label")?.firstChild?.textContent ?? "").trim(),
    ),
    bandNumerals: visibleBands.map((b) =>
      b.querySelector(".hero-final-band-label b").textContent.trim(),
    ),
    // Which band the numeral is actually LEGIBLE on. It belongs to the open band on every
    // width — it is the strip's index, not a descriptor, and a sliver has no room for it.
    bandNumeralShown: visibleBands.map(
      (b) => Number(getComputedStyle(b.querySelector(".hero-final-band-label b")).opacity) > 0.5,
    ),
    openBandCount: visibleBands.filter((b) => b.classList.contains("is-open")).length,

    capabilityCount: document.querySelectorAll(".service-cell").length,
    litCount: document.querySelectorAll('.service-cell[data-lit="true"]').length,

    elementSectionShown: shown(elementSection),
    elementKidsShown: elementKids.map((k) => `${k.className || k.tagName}=${shown(k)}`),
    frameCount: frames.length,
    framesShown: frames.filter(shown).length,
    thesisShown: shown(thesis),
    thesisRuleContent: thesis ? getComputedStyle(thesis, "::before").content : null,
    thesisFont: thesisLine ? getComputedStyle(thesisLine).fontSize : null,
    thesisText: thesisLine ? thesisLine.textContent.replace(/\s+/g, " ").trim() : null,
    thesisBox: box(thesis),

    waysInDom: Boolean(ways),
    waysShown: shown(ways),
    waysTileCount: wayTiles.length,
  };
}

function readTaps({ minTap, interactive }) {
  const small = [];
  const seen = new Set();
  for (const element of document.querySelectorAll(interactive)) {
    const style = getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden") continue;
    if (element.closest("[inert]")) continue;
    if (String(element.className || "").includes("sr-only")) continue;
    let rect = element.getBoundingClientRect();
    const after = getComputedStyle(element, "::after");
    if (
      after.content !== "none" &&
      after.position === "absolute" &&
      after.insetBlockStart === "0px" &&
      after.insetInlineStart === "0px"
    ) {
      let node = element.parentElement;
      while (node) {
        if (getComputedStyle(node).position !== "static") {
          rect = node.getBoundingClientRect();
          break;
        }
        node = node.parentElement;
      }
    }
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
    small.push(
      `${w}x${h} ${element.tagName.toLowerCase()}.${String(element.className || "").slice(0, 40)} "${label}"`,
    );
  }
  return small;
}

const browser = await chromium.launch();
const report = {};

// ---------------------------------------------------------------------------
// MOBILE
// ---------------------------------------------------------------------------
for (const [label, width, height] of MOBILE) {
  console.log(`\n${label} (touch)`);
  const { context, page } = await open(browser, width, height, true);
  await settle(page);
  const m = await page.evaluate(readPage);
  const taps = await page.evaluate(readTaps, { minTap: TOUCH_TAP, interactive: INTERACTIVE });
  report[label] = { ...m, taps };

  check(
    m.scrollWidth === m.clientWidth,
    `${label} no horizontal overflow`,
    `scrollWidth=${m.scrollWidth} clientWidth=${m.clientWidth} ${m.offenders.join(" | ")}`,
  );
  check(taps.length === 0, `${label} every target clears 44px`, taps.slice(0, 6).join(" | "));

  // 1 · THE BAR, AND IT IS THE DESKTOP BAR. An enlarged mark and a bordered trigger were
  //     tried and rejected as too big, so what is asserted here is that the phone gets the
  //     SAME bar every other width gets — plus the 44px target, which is invisible.
  check(m.mark.h <= 32.5, `${label} wordmark keeps its desktop size`, `${m.mark.h}px`);
  check(m.barPad === 24, `${label} the bar keeps its own padding`, `${m.barPad}px`);
  check(
    m.menuShown && m.menu.w >= 44 && m.menu.h >= 44,
    `${label} menu trigger >= 44x44`,
    `${m.menu?.w}x${m.menu?.h}`,
  );
  check(
    parseFloat(m.menuBorder ?? "0") === 0,
    `${label} the trigger is a word, not a box`,
    String(m.menuBorder),
  );
  const clearance = m.menu.x - m.mark.right;
  check(clearance >= 24, `${label} mark and trigger do not crowd`, `${clearance}px between them`);
  check(
    m.mark.x >= m.navGutter - 1 && m.menu.right <= m.width - m.navGutter + 1,
    `${label} neither crowds the edge`,
    `markL=${m.mark.x} menuR=${m.menu.right} gutter=${m.navGutter} vw=${m.width}`,
  );

  // 2 · the hero's three items — absent on a landscape phone, which drops the strip
  if (height > 500) {
    check(m.visibleBandCount === 3, `${label} three showcase items`, String(m.visibleBandCount));
    check(
      m.bandNames.join("|") === "Colour|Design|Content",
      `${label} they are Colour, Design and Content`,
      m.bandNames.join(" | "),
    );
    check(
      m.bandNumerals.join("|") === "01|02|03",
      `${label} numbered 01 02 03, not by DOM position`,
      m.bandNumerals.join(" | "),
    );
    // STILL AN ACCORDION: one band open and two held back as slivers. Equal thirds were
    // tried and rejected — the open band is what says which piece of work is the subject.
    check(m.openBandCount === 1, `${label} exactly one band is open`, String(m.openBandCount));
    check(
      m.bandNumeralShown.filter(Boolean).length === 1,
      `${label} the numeral belongs to the open band`,
      m.bandNumeralShown.join(" / "),
    );
    const widths = m.bandBoxes.map((b) => b.w);
    const open = Math.max(...widths);
    const sliver = Math.min(...widths);
    check(open > sliver * 2, `${label} the open band dominates`, widths.join(" / "));
    check(sliver >= 44, `${label} even a sliver clears 44px`, widths.join(" / "));
    check(m.bandBoxes[0].h >= 130, `${label} each item >= 130px tall`, `${m.bandBoxes[0].h}px`);
    const closed = m.bandFilters.filter((f) => f !== "none");
    check(
      closed.every((f) => !f.includes("saturate(0.28)")),
      `${label} items are in colour, not the desktop grade`,
      m.bandFilters.join(" | "),
    );
  } else {
    check(
      m.visibleBandCount === 0,
      `${label} strip stands down on a landscape phone`,
      String(m.visibleBandCount),
    );
  }

  // 3 · the Differentiator
  check(m.elementSectionShown, `${label} Differentiator section still renders`, "");
  check(m.frameCount === 4, `${label} all four elements still in the DOM`, String(m.frameCount));
  check(m.framesShown === 0, `${label} none of the four is painted`, String(m.framesShown));
  check(
    m.elementKidsShown.filter((k) => k.endsWith("=true")).length === 1,
    `${label} only the statement is painted`,
    m.elementKidsShown.join(" | "),
  );
  check(m.thesisShown, `${label} the closing statement stays`, "");
  check(
    /AI is our production advantage/.test(m.thesisText ?? ""),
    `${label} it is the right sentence`,
    m.thesisText ?? "",
  );
  check(
    m.thesisRuleContent !== "none",
    `${label} the statement carries its own rule`,
    String(m.thesisRuleContent),
  );
  check(
    parseFloat(m.thesisFont) >= 27,
    `${label} the statement is set larger than the shared clamp`,
    String(m.thesisFont),
  );

  // 4 · Ways to Work With Us
  check(m.waysInDom, `${label} Ways to Work is still in the DOM`, "");
  check(!m.waysShown, `${label} Ways to Work is not painted`, "");
  check(
    m.waysTileCount === 4,
    `${label} its four tiles are still in the markup`,
    String(m.waysTileCount),
  );

  await page.screenshot({
    path: path.join(OUT, `bar-${label}.png`),
    clip: { x: 0, y: 0, width, height: Math.min(220, height) },
  });
  await context.close();
}

// ---------------------------------------------------------------------------
// DESKTOP — the same four things, absent.
// ---------------------------------------------------------------------------
for (const [label, width, height] of [
  ["1440x900", 1440, 900],
  ["901x900", 901, 900],
]) {
  console.log(`\n${label} (mouse)`);
  const { context, page } = await open(browser, width, height, false);
  await settle(page);
  const d = await page.evaluate(readPage);
  report[label] = d;

  check(
    d.scrollWidth === d.clientWidth,
    `${label} no horizontal overflow`,
    `${d.scrollWidth}/${d.clientWidth}`,
  );
  // The drawer trigger is the bar's control from 0 to 1023 — the inline links do not fit
  // below 1024 — so at 901 it is correctly still there. What must not cross 900 is its
  // MOBILE TREATMENT: the bordered 44px box and the enlarged mark.
  if (width >= 1024) {
    check(!d.menuShown, `${label} no drawer trigger`, "");
  } else {
    check(d.menuShown, `${label} drawer trigger still carries the bar`, "");
  }
  check(
    parseFloat(d.menuBorder ?? "0") === 0,
    `${label} the trigger has no mobile border`,
    String(d.menuBorder),
  );
  check(d.mark.h <= 44.5, `${label} wordmark keeps its desktop clamp`, `${d.mark.h}px`);
  check(d.visibleBandCount === 6, `${label} the hero still has six bands`, String(d.visibleBandCount));
  check(
    d.bandNumerals.join("|") === "01|02|03|04|05|06",
    `${label} numbered from the markup, no counter`,
    d.bandNumerals.join(" | "),
  );
  check(
    d.bandNames[0] === "Camera & rig",
    `${label} the list still starts at Camera & rig`,
    d.bandNames.join(" | "),
  );
  check(d.litCount === 0, `${label} no capability card is spotlit`, String(d.litCount));
  const widths = d.bandBoxes.map((b) => b.w);
  check(
    Math.max(...widths) - Math.min(...widths) <= 1.5,
    `${label} bands are a column, not thirds`,
    widths.join("/"),
  );
  const heights = d.bandBoxes.map((b) => b.h);
  check(
    Math.max(...heights) - Math.min(...heights) > 20,
    `${label} one band is open — the accordion still works`,
    heights.map((h) => Math.round(h)).join("/"),
  );
  check(
    d.bandFilters.some((f) => f.includes("saturate(0.28)")),
    `${label} closed bands keep the desktop grade`,
    d.bandFilters[0] ?? "",
  );
  check(d.framesShown === 4, `${label} all four elements are painted`, String(d.framesShown));
  check(
    d.elementKidsShown.every((k) => k.endsWith("=true")),
    `${label} the whole Differentiator is painted`,
    d.elementKidsShown.join(" | "),
  );
  check(
    d.thesisRuleContent === "none",
    `${label} the statement carries no mobile rule`,
    String(d.thesisRuleContent),
  );
  check(d.waysShown, `${label} Ways to Work is painted`, "");
  check(d.waysTileCount === 4, `${label} with its four tiles`, String(d.waysTileCount));

  await context.close();
}

// ---------------------------------------------------------------------------
// NOTHING DEPENDS ON HOVER — asked of a coarse pointer, where hover cannot happen.
// ---------------------------------------------------------------------------
{
  console.log("\nhover independence (390x844, coarse)");
  const { context, page } = await open(browser, 390, 844, true);
  await settle(page);
  const h = await page.evaluate(() => {
    const visible = (el) => {
      if (!el) return false;
      const s = getComputedStyle(el);
      if (s.display === "none" || s.visibility === "hidden") return false;
      return Number(s.opacity) > 0.01;
    };
    const liveBands = Array.from(document.querySelectorAll(".hero-final-band")).filter(
      (b) => getComputedStyle(b).display !== "none",
    );
    return {
      bandLabels: liveBands.map((b) => visible(b.querySelector(".hero-final-band-label"))),
      bandNames: liveBands.map((b) =>
        (b.querySelector(".hero-final-band-label")?.firstChild?.textContent ?? "").trim(),
      ),
      frameSentences: Array.from(document.querySelectorAll(".element-panel-say")).map(
        (p) => p.textContent.trim().length > 10,
      ),
      // `.frame-more` is the MOTION LAYER's touch alternative to a hover-revealed
      // sentence, and the motion layer is off below 900 — so on a phone there is no
      // sentence to reveal and `.frame-say` is simply on the page. That is what to check.
      frameSays: Array.from(document.querySelectorAll(".frame-say")).map(
        (el) => visible(el) && el.textContent.trim().length > 10,
      ),
      coverTags: Array.from(document.querySelectorAll(".cover-tag")).map((el) => visible(el)),
    };
  });
  report.hover = h;
  check(
    h.bandLabels.every(Boolean),
    "every hero item's label is visible without hover",
    JSON.stringify(h.bandLabels),
  );
  // NOT "every numeral is visible" — the numeral is the open band's, at every width, and
  // it indexes the strip rather than describing anything. What must not depend on a cursor
  // is the NAME, and every band carries its own in full whether it is open or a sliver: a
  // sliver clips it visually, which is what a sliver is, and clips nothing from the DOM.
  check(
    h.bandNames.length === 3 && h.bandNames.every((n) => n.length > 3),
    "every hero item's name is in the document without hover",
    JSON.stringify(h.bandNames),
  );
  check(
    h.frameSentences.length === 4,
    "the four elements' sentences are still in the document",
    JSON.stringify(h.frameSentences),
  );
  check(
    h.frameSays.length > 0 && h.frameSays.every(Boolean),
    "every process step's sentence is visible without hover",
    JSON.stringify(h.frameSays),
  );
  check(
    h.coverTags.length === 0 || h.coverTags.every(Boolean),
    "the work covers' tags are visible without hover",
    JSON.stringify(h.coverTags),
  );
  await context.close();
}

// ---------------------------------------------------------------------------
// THE CAPABILITIES SPOTLIGHT — what the six cards do with no cursor to point with.
// Walked down the section rather than sampled once: the claim is that the lit card
// FOLLOWS the reader, and one stationary reading cannot tell that from a card that
// happens to be lit and never changes.
// ---------------------------------------------------------------------------
{
  console.log("\ncapabilities spotlight (390x844, coarse)");
  const { context, page } = await open(browser, 390, 844, true);
  await settle(page);
  const seen = [];
  const readings = [];
  const stops = await page.evaluate(() => {
    const cells = Array.from(document.querySelectorAll(".service-cell"));
    return cells.map((cell) => {
      const rect = cell.getBoundingClientRect();
      return Math.round(rect.top + scrollY + rect.height / 2 - innerHeight / 2);
    });
  });
  for (const y of stops) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(320);
    const state = await page.evaluate(() => {
      const cells = Array.from(document.querySelectorAll(".service-cell"));
      const lit = cells.filter((c) => c.dataset.lit === "true");
      const middle = innerHeight / 2;
      let nearest = null;
      let shortest = Infinity;
      for (const cell of cells) {
        const rect = cell.getBoundingClientRect();
        if (rect.bottom <= 0 || rect.top >= innerHeight) continue;
        const distance = Math.abs(rect.top + rect.height / 2 - middle);
        if (distance < shortest) {
          shortest = distance;
          nearest = cell;
        }
      }
      const card = lit[0];
      return {
        litCount: lit.length,
        // The lit card must be the nearest one, and it must actually LOOK lit: the wash
        // fully drawn and the title flipped to the on-dark colour, which is the state a
        // cursor gives it. An attribute nothing is styled by would pass a weaker check.
        isNearest: lit.length === 1 && lit[0] === nearest,
        title: card?.querySelector(".service-title")?.textContent?.trim().slice(0, 28) ?? null,
        wash: card ? getComputedStyle(card.querySelector(".service-wash")).clipPath : null,
        titleColour: card ? getComputedStyle(card.querySelector(".service-title")).color : null,
      };
    });
    readings.push(state);
    if (state.title) seen.push(state.title);
  }
  report.spotlight = { stops, readings, seen };

  check(
    readings.every((r) => r.litCount === 1),
    "exactly one card is lit at every stop",
    readings.map((r) => r.litCount).join(" / "),
  );
  check(
    readings.every((r) => r.isNearest),
    "the lit card is the one nearest the middle of the screen",
    readings.map((r) => (r.isNearest ? "ok" : "no")).join(" / "),
  );
  check(
    new Set(seen).size === stops.length,
    "a different card lights at each of the six stops",
    seen.join(" | "),
  );
  check(
    readings.every((r) => r.wash === "inset(0px)"),
    "the lit card's ink curtain is fully drawn",
    readings.map((r) => r.wash).join(" | "),
  );
  check(
    readings.every((r) => r.titleColour === readings[0].titleColour && r.titleColour !== null),
    "and its title has flipped to the on-dark colour",
    String(readings[0]?.titleColour),
  );
  await page.screenshot({ path: path.join(OUT, "spotlight-390.png") });
  await context.close();
}

// ---------------------------------------------------------------------------
// SCREENSHOTS — mid-scroll, never full-page: a full-page capture of a sticky or
// scroll-driven section is a composite state no reader ever sees.
// ---------------------------------------------------------------------------
for (const [label, width, height, touch] of [
  ["390", 390, 844, true],
  ["1440", 1440, 900, false],
]) {
  const { context, page } = await open(browser, width, height, touch);
  await settle(page);
  const total = await page.evaluate(() => document.body.scrollHeight);
  const stops = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9];
  for (const [index, fraction] of stops.entries()) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(total * fraction));
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(OUT, `home-${label}-${String(index + 1).padStart(2, "0")}.png`),
    });
  }
  await context.close();
}

await browser.close();
writeFileSync(path.join(OUT, "homepage.json"), JSON.stringify(report, null, 2));
console.log(`\n${passed} checks passed, ${failures.length} failed`);
for (const failure of failures) console.log(`  FAIL ${failure}`);
console.log(`\nbreakpoint asserted at ${BREAKPOINT}px; shots + json in ${OUT}`);
process.exitCode = failures.length === 0 ? 0 : 1;
