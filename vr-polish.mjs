// Verification harness for the polish pass. Temporary — deleted after the run.
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const BASE = "http://127.0.0.1:3100";
const PAGES = [
  "/",
  "/creative-services",
  "/how-we-work",
  "/ways-to-work-with-us",
  "/selected-work",
  "/about",
  "/contact",
];

const CANVAS = [244, 241, 232];
const INK = [11, 44, 77];
const ACCENT = [28, 80, 255];
const ACCENT_ON_DARK = [121, 149, 245];
const FADE_START = [34, 63, 92]; // ink-90 over canvas

let pass = 0;
const failures = [];
const notes = [];

function ok(cond, label, detail = "") {
  if (cond) {
    pass += 1;
  } else {
    const line = `${label}${detail ? ` :: ${detail}` : ""}`;
    failures.push(line);
    console.log("FAIL " + line);
  }
}
function note(line) {
  notes.push(line);
}
function stage(name) {
  console.log(`--- ${name} (${pass} pass, ${failures.length} fail so far)`);
}

function lin(c) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}
function lum([r, g, b]) {
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function contrast(a, b) {
  const la = lum(a);
  const lb = lum(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
function parseRgb(value) {
  const m = String(value).match(/-?[\d.]+/g);
  if (!m) return null;
  return [Number(m[0]), Number(m[1]), Number(m[2]), m.length > 3 ? Number(m[3]) : 1];
}
function near(a, b, tol = 6) {
  return (
    Math.abs(a[0] - b[0]) <= tol && Math.abs(a[1] - b[1]) <= tol && Math.abs(a[2] - b[2]) <= tol
  );
}

async function newContext(browser, width, reduced) {
  return browser.newContext({
    viewport: { width, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: reduced ? "reduce" : "no-preference",
  });
}

async function settle(page) {
  await page.waitForLoadState("load").catch(() => {});
  // networkidle stalls for its full 30s on these pages, so wait on the thing that
  // actually matters for pixel work: every image decoded.
  await page
    .waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 8000 })
    .catch(() => {});
  await page.waitForTimeout(900);
}

/**
 * Walks the whole page so every scroll reveal has fired, then returns to `selector`.
 * Without this, geometry reads 24px out on any element still holding `translateY(24px)`
 * from `Reveal` or `.capability-reveal` — which reads as a layout defect and is not one.
 */
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

// ---------------------------------------------------------------- axe
async function runAxe(page, label) {
  const results = await new AxeBuilder({ page }).analyze();
  ok(
    results.violations.length === 0,
    `axe ${label}`,
    JSON.stringify(results.violations.map((v) => `${v.id}(${v.nodes.length})`)),
  );
  for (const inc of results.incomplete) {
    note(
      `INCOMPLETE ${label}: ${inc.id} x${inc.nodes.length} :: ${inc.nodes[0]?.target?.join(" ")}`,
    );
  }
}

// ------------------------------------------------- pixel sampling helper
/** Reads back a clipped screenshot's pixels inside the page, via a data: URL (no taint). */
async function samplePixels(page, clip, rects) {
  const buffer = await page.screenshot({ clip });
  const b64 = buffer.toString("base64");
  return page.evaluate(
    async ({ b64, clip, rects }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      return rects.map((r) => {
        const x = Math.max(0, Math.round(r.x - clip.x));
        const y = Math.max(0, Math.round(r.y - clip.y));
        const w = Math.min(canvas.width - x, Math.round(r.width));
        const h = Math.min(canvas.height - y, Math.round(r.height));
        if (w <= 0 || h <= 0) return { label: r.label, pixels: [] };
        const data = ctx.getImageData(x, y, w, h).data;
        const pixels = [];
        for (let i = 0; i < data.length; i += 4) {
          pixels.push([data[i], data[i + 1], data[i + 2]]);
        }
        return { label: r.label, pixels };
      });
    },
    { b64, clip, rects },
  );
}

// ---------------------------------------------------------------- main
const browser = await chromium.launch();

stage('1 header');
// ===== 1. Header: transparent at top, solid past 80px, nav legible over the mosaic =====
{
  const context = await newContext(browser, 1440, false);
  const page = await context.newPage();

  // /contact opens on canvas and is the one route that starts solid — see `solidAtTop`.
  const SOLID_AT_TOP = new Set(["/contact"]);

  for (const route of PAGES) {
    await page.goto(BASE + route, { waitUntil: "domcontentloaded" });
    await settle(page);
    const top = await page.evaluate(() => {
      const h = document.querySelector("header");
      const s = getComputedStyle(h);
      return { bg: s.backgroundColor, border: s.borderBottomColor, height: h.offsetHeight };
    });
    const bgTop = parseRgb(top.bg);
    if (SOLID_AT_TOP.has(route)) {
      ok(near(bgTop, INK), `header solid at scroll 0 ${route} (light hero)`, top.bg);
    } else {
      ok(bgTop[3] === 0, `header transparent at scroll 0 ${route}`, top.bg);
    }
    ok(parseRgb(top.border)[3] === 0, `header border absent at scroll 0 ${route}`, top.border);

    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(700);
    const scrolled = await page.evaluate(() => {
      const s = getComputedStyle(document.querySelector("header"));
      return { bg: s.backgroundColor, border: s.borderBottomColor };
    });
    ok(near(parseRgb(scrolled.bg), INK), `header solid ink when scrolled ${route}`, scrolled.bg);
    ok(parseRgb(scrolled.border)[3] > 0, `header hairline when scrolled ${route}`, scrolled.border);

    // --- What is actually behind the nav at scroll 0, sampled from rendered pixels.
    // axe cannot evaluate text over an image, and the homepage's mosaic drifts, so the
    // homepage is sampled repeatedly and the worst reading over all of them is the one
    // asserted. Everywhere else the ground is static and one reading is the answer.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(900);
    const hb = await (await page.$("header")).boundingBox();
    const clip = { x: 0, y: 0, width: 1440, height: Math.ceil(hb.height) };

    const linkRects = await page.evaluate(() => {
      const out = [];
      for (const el of document.querySelectorAll("header nav .nav-link-label")) {
        const r = el.getBoundingClientRect();
        out.push({
          label: el.textContent.trim(),
          x: r.x,
          y: r.y,
          width: r.width,
          height: r.height,
        });
      }
      const wm = document.querySelector('header a[aria-label*="home"] img');
      if (wm) {
        const r = wm.getBoundingClientRect();
        out.push({ label: "wordmark", x: r.x, y: r.y, width: r.width, height: r.height });
      }
      return out;
    });
    ok(linkRects.length >= 6, `nav labels + wordmark found on ${route}`, String(linkRects.length));

    const hide = await page.addStyleTag({
      content: `header nav .nav-link-label, header nav .nav-marker, header a[aria-label*="home"] img { visibility: hidden !important; }`,
    });

    const drifts = route === "/" ? 5 : 1;
    const worstByLabel = new Map();
    for (let d = 0; d < drifts; d += 1) {
      await page.waitForTimeout(700);
      const sampled = await samplePixels(page, clip, linkRects);
      for (const { label, pixels } of sampled) {
        let worst = Infinity;
        for (const px of pixels) {
          const c = contrast(px, CANVAS);
          if (c < worst) worst = c;
        }
        const prev = worstByLabel.get(label);
        if (prev === undefined || worst < prev) worstByLabel.set(label, worst);
      }
    }
    let pageWorst = Infinity;
    for (const [label, worst] of worstByLabel) {
      // Nav text is 15px/500 → normal text, 4.5:1. The wordmark is a graphic, 3:1.
      const floor = label === "wordmark" ? 3 : 4.5;
      ok(
        worst >= floor,
        `${route} scroll-0 pixels behind "${label}" hold canvas at ${floor}:1`,
        `worst ${worst.toFixed(3)}:1`,
      );
      if (label !== "wordmark" && worst < pageWorst) pageWorst = worst;
    }
    note(`${route}: worst nav-ground contrast at scroll 0 = ${pageWorst.toFixed(3)}:1 over ${drifts} sample(s)`);
    await hide.evaluate((node) => node.remove());
  }

  // Threshold either side of 80px, on the homepage.
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await settle(page);
  for (const [y, expectOpaque] of [
    [79, false],
    [81, true],
  ]) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(600);
    const s = await page.evaluate(() => {
      const st = getComputedStyle(document.querySelector("header"));
      return { bg: st.backgroundColor, border: st.borderBottomColor };
    });
    const opaque = parseRgb(s.bg)[3] === 1;
    ok(
      opaque === expectOpaque,
      `header fill at scrollY ${y} is ${expectOpaque ? "ink" : "transparent"}`,
      s.bg,
    );
    const hasBorder = parseRgb(s.border)[3] > 0;
    ok(hasBorder === expectOpaque, `header border at scrollY ${y}`, s.border);
  }

  await context.close();
}

stage('2 panels');
// ===== 2. Panels sized to content =====
{
  const context = await newContext(browser, 1440, false);
  const page = await context.newPage();
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await settle(page);

  const bar = await page.$("[data-header-bar]");
  const barBox = await bar.boundingBox();

  const panels = [
    { name: "Creative Services", id: "nav-panel-creative-services", variant: "wide" },
    { name: "Ways to Work With Us", id: "nav-panel-ways-to-work-with-us", variant: "narrow" },
    { name: "Selected Work", id: "nav-panel-selected-work", variant: "media" },
  ];

  for (const p of panels) {
    await page.getByRole("link", { name: p.name, exact: true }).first().hover();
    await page.waitForTimeout(600);
    const info = await page.evaluate((id) => {
      const el = document.getElementById(id);
      const trigger = document.getElementById(id.replace("nav-panel-", "nav-trigger-"));
      const r = el.getBoundingClientRect();
      const t = trigger.getBoundingClientRect();
      const inner = el.firstElementChild;
      const kids = [...inner.children];
      return {
        cls: el.className,
        left: r.x,
        right: r.right,
        width: r.width,
        height: r.height,
        triggerLeft: t.x,
        open: el.getAttribute("aria-labelledby") === trigger.id,
        // How much of the card's own inner box the content actually occupies.
        contentHeight: kids.reduce((sum, k) => sum + k.getBoundingClientRect().height, 0),
        bg: getComputedStyle(el).backgroundColor,
        shadow: getComputedStyle(el).boxShadow,
        radius: getComputedStyle(el).borderTopLeftRadius,
      };
    }, p.id);

    ok(
      info.cls.includes(`nav-panel--${p.variant}`),
      `${p.name} takes the ${p.variant} variant`,
      info.cls,
    );
    ok(near(parseRgb(info.bg), CANVAS), `${p.name} panel is canvas`, info.bg);
    ok(info.shadow === "none", `${p.name} panel has no shadow`, info.shadow);
    ok(info.radius === "4px", `${p.name} panel keeps the 0.25rem radius`, info.radius);
    ok(
      info.left >= 0 && info.right <= 1440,
      `${p.name} panel inside the viewport`,
      `${info.left}..${info.right}`,
    );

    if (p.variant === "narrow") {
      ok(Math.abs(info.width - 352) <= 1, `${p.name} panel is 22rem wide`, String(info.width));
      ok(
        Math.abs(info.left - info.triggerLeft) <= 1,
        `${p.name} panel starts under its trigger`,
        `${info.left} vs ${info.triggerLeft}`,
      );
      ok(
        info.width < barBox.width * 0.4,
        `${p.name} panel is not stretched to the container`,
        String(info.width),
      );
    }
    if (p.variant === "media") {
      ok(
        info.width <= 896 + 1,
        `${p.name} panel sized to its covers (<=56rem)`,
        String(info.width),
      );
      ok(
        Math.abs(info.right - (barBox.x + barBox.width - 24)) <= 1,
        `${p.name} panel anchored to the container's right edge`,
        String(info.right),
      );
    }
    if (p.variant === "wide") {
      ok(
        Math.abs(info.width - (barBox.width - 48)) <= 1,
        `${p.name} panel spans the container`,
        String(info.width),
      );
    }
    note(
      `${p.name}: ${Math.round(info.width)}x${Math.round(info.height)} panel, ${Math.round(info.contentHeight)}px of content`,
    );

    await page.keyboard.press("Escape");
    await page.mouse.move(700, 700);
    await page.waitForTimeout(400);
  }
  await context.close();
}

stage('3 work grid');
// ===== 3. Homepage work grid geometry =====
{
  const context = await newContext(browser, 1440, false);
  const page = await context.newPage();
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await settle(page);
  await revealAll(page, ".work-grid");

  const geom = await page.evaluate(() => {
    const grid = document.querySelector(".work-grid");
    const items = [...grid.querySelectorAll(".work-grid-item")].map((el) => {
      const r = el.getBoundingClientRect();
      return {
        x: Math.round(r.x),
        y: Math.round(r.y),
        w: Math.round(r.width),
        bottom: Math.round(r.bottom),
      };
    });
    const container = grid.parentElement.getBoundingClientRect();
    const cs = getComputedStyle(grid.parentElement);
    return {
      items,
      contentLeft: Math.round(container.x + parseFloat(cs.paddingLeft)),
      contentRight: Math.round(container.right - parseFloat(cs.paddingRight)),
      bleed: document.querySelectorAll(".work-bleed").length,
    };
  });

  ok(geom.bleed === 0, "no .work-bleed element remains on the homepage", String(geom.bleed));
  const xs = [...new Set(geom.items.map((i) => i.x))].sort((a, b) => a - b);
  ok(xs.length === 2, "homepage work grid has exactly two column edges", JSON.stringify(xs));
  ok(
    Math.abs(xs[0] - geom.contentLeft) <= 1,
    "first column starts at the container",
    `${xs[0]} vs ${geom.contentLeft}`,
  );
  const widths = [...new Set(geom.items.map((i) => i.w))];
  ok(
    Math.max(...widths) - Math.min(...widths) <= 1,
    "every tile is the same width",
    JSON.stringify(widths),
  );
  ok(
    Math.abs(xs[1] + geom.items[0].w - geom.contentRight) <= 1,
    "second column ends at the container",
    `${xs[1] + geom.items[0].w} vs ${geom.contentRight}`,
  );
  const gutter = xs[1] - (xs[0] + geom.items[0].w);
  note(
    `homepage work grid: 2 columns at x=${xs.join(",")}, tile width ${geom.items[0].w}, gutter ${gutter}`,
  );

  for (const col of xs) {
    const inCol = geom.items.filter((i) => i.x === col).sort((a, b) => a.y - b.y);
    const gaps = [];
    for (let i = 1; i < inCol.length; i += 1) gaps.push(inCol[i].y - inCol[i - 1].bottom);
    const spread = gaps.length ? Math.max(...gaps) - Math.min(...gaps) : 0;
    ok(spread <= 1, `column at x=${col} has one constant vertical gap`, JSON.stringify(gaps));
    note(`column x=${col}: ${inCol.length} tiles, gaps ${JSON.stringify(gaps)}`);
  }
  await context.close();
}

stage('4 serif accent');
// ===== 4. Serif accent words: colour, contrast, budget =====
{
  const context = await newContext(browser, 1440, false);
  const page = await context.newPage();
  for (const route of PAGES) {
    await page.goto(BASE + route, { waitUntil: "domcontentloaded" });
    await settle(page);
    // Everything must be in view for the reveal to have run; scroll the whole page.
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.8;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1200);

    const words = await page.evaluate(() => {
      function bgOf(el) {
        let node = el;
        while (node && node !== document.documentElement) {
          const c = getComputedStyle(node).backgroundColor;
          const m = c.match(/-?[\d.]+/g);
          if (m && (m.length < 4 || Number(m[3]) > 0.99)) return c;
          node = node.parentElement;
        }
        return getComputedStyle(document.body).backgroundColor;
      }
      return [...document.querySelectorAll(".text-display-accent")].map((el) => ({
        text: el.textContent,
        color: getComputedStyle(el).color,
        family: getComputedStyle(el).fontFamily,
        style: getComputedStyle(el).fontStyle,
        size: parseFloat(getComputedStyle(el).fontSize),
        weight: getComputedStyle(el).fontWeight,
        bg: bgOf(el),
        onDark: !!el.closest(".surface-dark"),
        inFaded: !!el.closest(".section-fade"),
      }));
    });

    // The budget is counted in PHRASES, which is the unit README deviation 5 states and
    // the unit `RevealHeading`'s `accent` prop takes. RevealHeading renders one wrapper
    // span per word, so a phrase is a maximal run of consecutive accented words inside one
    // heading. Both numbers are reported; the assertion is on the phrase count.
    const phrases = await page.evaluate(() => {
      const headings = new Set(
        [...document.querySelectorAll(".text-display-accent")].map((el) =>
          el.closest("h1, h2, h3, p"),
        ),
      );
      const found = [];
      for (const heading of headings) {
        if (!heading) continue;
        let run = null;
        for (const child of heading.children) {
          const accented = child.querySelector(".text-display-accent");
          if (accented) {
            run = run === null ? accented.textContent : `${run} ${accented.textContent}`;
          } else if (run !== null) {
            found.push(run);
            run = null;
          }
        }
        if (run !== null) found.push(run);
      }
      return found;
    });

    ok(words.length > 0, `${route} renders at least one accented word`);
    ok(
      phrases.length <= 5,
      `${route} holds the display-accent budget of 5 phrases`,
      `${phrases.length}: ${phrases.join(" | ")}`,
    );
    note(
      `${route}: ${phrases.length} accent phrase(s) / ${words.length} word(s) — ${phrases.join(" | ")}`,
    );

    for (const w of words) {
      const expected = w.onDark ? ACCENT_ON_DARK : ACCENT;
      ok(
        near(parseRgb(w.color), expected),
        `${route} "${w.text}" renders ${w.onDark ? "accent-on-dark" : "accent"}`,
        w.color,
      );
      ok(
        /instrument/i.test(w.family) && w.style === "italic",
        `${route} "${w.text}" is the serif italic`,
        `${w.family} ${w.style}`,
      );
      const c = contrast(parseRgb(w.color), parseRgb(w.bg));
      // Every accented word is display-size (>=24px), so 3:1 is the WCAG floor; all of
      // them are expected to clear 4.5:1 anyway, which is what is asserted.
      ok(
        c >= 4.5,
        `${route} "${w.text}" clears 4.5:1 on its ground`,
        `${c.toFixed(3)}:1 on ${w.bg}`,
      );
      ok(!w.inFaded, `${route} "${w.text}" is not inside a fading dark section`, String(w.inFaded));
      note(`  "${w.text}" ${w.color} on ${w.bg} = ${c.toFixed(3)}:1 @${w.size}px/${w.weight}`);
    }
  }
  await context.close();
}

stage('5 fade-start');
// ===== 5. Fade-start rule across the site =====
{
  const context = await newContext(browser, 1440, false);
  const page = await context.newPage();
  for (const route of PAGES) {
    await page.goto(BASE + route, { waitUntil: "domcontentloaded" });
    await settle(page);
    const risky = await page.evaluate((fadeStart) => {
      function lin(c) {
        const s = c / 255;
        return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      }
      function lum(p) {
        return 0.2126 * lin(p[0]) + 0.7152 * lin(p[1]) + 0.0722 * lin(p[2]);
      }
      const out = [];
      for (const section of document.querySelectorAll("section.section-fade")) {
        for (const el of section.querySelectorAll("*")) {
          if (!el.textContent || el.children.length > 0) continue;
          const cs = getComputedStyle(el);
          const m = cs.color.match(/-?[\d.]+/g);
          if (!m) continue;
          const col = [Number(m[0]), Number(m[1]), Number(m[2])];
          const la = lum(col);
          const lb = lum(fadeStart);
          const ratio = (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
          const size = parseFloat(cs.fontSize);
          const large = size >= 24 || (size >= 18.66 && Number(cs.fontWeight) >= 700);
          if (ratio < (large ? 3 : 4.5)) {
            out.push(
              `${el.tagName}.${el.className} "${el.textContent.slice(0, 24)}" ${cs.color} ${ratio.toFixed(3)}:1`,
            );
          }
        }
      }
      return out;
    }, FADE_START);
    ok(risky.length === 0, `fade-start rule holds on ${route}`, risky.join(" | "));
  }
  await context.close();
}

stage('6 faq');
// ===== 6. FAQ disclosure =====
{
  const context = await newContext(browser, 1440, false);
  const page = await context.newPage();
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await settle(page);
  await revealAll(page, ".faq-list");

  const before = await page.evaluate(() => {
    const rows = [...document.querySelectorAll(".faq-row")];
    return rows.map((row) => {
      const t = row.querySelector("button");
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      return {
        expanded: t.getAttribute("aria-expanded"),
        controlsResolves: !!panel,
        inert: panel?.hasAttribute("inert"),
        labelled: panel?.getAttribute("aria-labelledby") === t.id,
        role: panel?.getAttribute("role"),
        headingWrapped: t.parentElement.tagName === "H3",
        ruleColor: getComputedStyle(row.querySelector(".faq-rule")).backgroundColor,
      };
    });
  });
  ok(before.length === 7, "seven FAQ rows", String(before.length));
  ok(
    before.every((r) => r.expanded === "false"),
    "every row starts collapsed",
  );
  ok(
    before.every((r) => r.controlsResolves),
    "every aria-controls resolves to a real element",
  );
  ok(
    before.every((r) => r.inert === true),
    "every collapsed answer is inert",
  );
  ok(
    before.every((r) => r.labelled && r.role === "region"),
    "every answer is a region labelled by its trigger",
  );
  ok(
    before.every((r) => r.headingWrapped),
    "every trigger sits inside an h3",
  );
  ok(
    before.every((r) => !near(parseRgb(r.ruleColor), ACCENT)),
    "no hairline is accent while every row is closed",
  );

  const reachable = await page.evaluate(
    () =>
      [...document.querySelectorAll('.faq-panel[data-open="false"] a[href]')].filter(
        (a) => !a.closest("[inert]"),
      ).length,
  );
  ok(reachable === 0, "no link inside a collapsed answer is reachable", String(reachable));

  await page.locator(".faq-row button").nth(2).click();
  await page.waitForTimeout(700);
  const after = await page.evaluate(() => {
    const rows = [...document.querySelectorAll(".faq-row")];
    const open = rows[2];
    const t = open.querySelector("button");
    const panel = document.getElementById(t.getAttribute("aria-controls"));
    return {
      expanded: t.getAttribute("aria-expanded"),
      inert: panel.hasAttribute("inert"),
      height: panel.getBoundingClientRect().height,
      answerOpacity: getComputedStyle(panel.querySelector(".faq-answer")).opacity,
      ruleColor: getComputedStyle(open.querySelector(".faq-rule")).backgroundColor,
      chevron: getComputedStyle(t.querySelector(".faq-chevron")).transform,
      others: rows
        .filter((_, i) => i !== 2)
        .every((r) => r.querySelector("button").getAttribute("aria-expanded") === "false"),
    };
  });
  ok(after.expanded === "true", "clicking a question expands it");
  ok(after.inert === false, "the open answer is no longer inert");
  ok(after.height > 40, "the open answer has real height", String(Math.round(after.height)));
  ok(
    Number(after.answerOpacity) === 1,
    "the open answer's text is at full opacity",
    after.answerOpacity,
  );
  ok(near(parseRgb(after.ruleColor), ACCENT), "the open row's hairline is accent", after.ruleColor);
  ok(after.chevron.startsWith("matrix(-1"), "the open row's chevron is rotated", after.chevron);
  ok(after.others, "only one row is open at a time");

  // Hover vocabulary on a closed row.
  const sweep = await page.evaluate(() => {
    const t = document.querySelectorAll(".faq-row button")[0];
    return getComputedStyle(t, "::before").backgroundColor;
  });
  ok(sweep.startsWith("rgba(11, 44, 77"), "closed rows sweep in ink-04", sweep);
  const openSweep = await page.evaluate(() => {
    const t = document.querySelectorAll(".faq-row button")[2];
    return getComputedStyle(t, "::before").content;
  });
  ok(openSweep === "none" || openSweep === "normal", "the open row has no sweep", openSweep);

  await context.close();
}

stage('7 why famysys');
// ===== 7. Why Famysys =====
{
  const context = await newContext(browser, 1440, false);
  const page = await context.newPage();
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await settle(page);
  await revealAll(page, ".reason-title");

  const cards = await page.evaluate(() => {
    const items = [...document.querySelectorAll(".reason-title")].map((t) => {
      const card = t.closest(".capability-card");
      const r = card.getBoundingClientRect();
      const numeral = card.querySelector(".capability-numeral");
      const draw = card.querySelector(".reason-icon-draw");
      const ghost = card.querySelector(".reason-icon-ghost");
      return {
        title: t.textContent,
        x: Math.round(r.x),
        y: Math.round(r.y),
        w: Math.round(r.width),
        numeral: getComputedStyle(numeral, "::before").content,
        marks: draw.children.length,
        ghostColor: getComputedStyle(ghost).color,
        drawColor: getComputedStyle(draw).color,
        dashoffset: getComputedStyle(draw).strokeDashoffset,
        revealed: card.closest(".capability-reveal").dataset.visible,
        surface: getComputedStyle(card).backgroundColor,
        border: getComputedStyle(card).borderTopColor,
      };
    });
    return items;
  });

  ok(cards.length === 5, "five reason cards", String(cards.length));
  ok(
    cards.every((c) => c.revealed === "true"),
    "every reason card has revealed",
  );
  ok(
    cards.every((c) => c.marks >= 2),
    "every card carries a multi-path mark",
    JSON.stringify(cards.map((c) => c.marks)),
  );
  ok(
    cards.every((c) => near(parseRgb(c.drawColor), ACCENT)),
    "the drawn mark is accent",
    cards[0].drawColor,
  );
  ok(
    cards.every((c) => parseFloat(c.dashoffset) === 1),
    "marks rest undrawn",
    cards[0].dashoffset,
  );
  ok(
    cards.every((c) => /0[1-5]/.test(c.numeral)),
    "numerals are CSS generated content",
    JSON.stringify(cards.map((c) => c.numeral)),
  );
  ok(
    cards.every(
      (c) => c.surface === "rgba(11, 44, 77, 0.059)" || c.surface.startsWith("rgba(11, 44, 77"),
    ),
    "cards use the locked ink-06 fill",
    cards[0].surface,
  );

  const rows = new Map();
  for (const c of cards) rows.set(c.y, [...(rows.get(c.y) ?? []), c]);
  const rowSizes = [...rows.values()].map((r) => r.length);
  ok(rowSizes.join(",") === "3,2", "the grid is 3 + 2", JSON.stringify(rowSizes));
  const [top, bottom] = [...rows.values()];
  ok(
    Math.abs(top[0].x - bottom[0].x) <= 1,
    "both rows start at the same left edge",
    `${top[0].x} vs ${bottom[0].x}`,
  );
  ok(
    Math.abs(
      bottom[bottom.length - 1].x +
        bottom[bottom.length - 1].w -
        (top[top.length - 1].x + top[top.length - 1].w),
    ) <= 2,
    "both rows end at the same right edge",
  );
  note(
    `why-famysys rows: ${rowSizes.join(" + ")}, top widths ${top.map((c) => c.w).join(",")}, bottom ${bottom.map((c) => c.w).join(",")}`,
  );

  // Hover behaviour on one card.
  await page.locator(".reason-title").first().hover();
  await page.waitForTimeout(700);
  const hovered = await page.evaluate(() => {
    const card = document.querySelector(".reason-title").closest(".capability-card");
    return {
      dashoffset: getComputedStyle(card.querySelector(".reason-icon-draw")).strokeDashoffset,
      numeralColor: getComputedStyle(card.querySelector(".capability-numeral")).color,
      numeralTransform: getComputedStyle(card.querySelector(".capability-numeral")).transform,
      titleTransform: getComputedStyle(card.querySelector(".reason-title")).transform,
      border: getComputedStyle(card).borderTopColor,
      lift: getComputedStyle(card).transform,
      glow: getComputedStyle(card.querySelector(".capability-glow")).opacity,
    };
  });
  ok(parseFloat(hovered.dashoffset) === 0, "hover draws the mark", hovered.dashoffset);
  ok(
    near(parseRgb(hovered.numeralColor), ACCENT),
    "hover takes the numeral to accent",
    hovered.numeralColor,
  );
  ok(
    hovered.numeralTransform.startsWith("matrix(1.06"),
    "hover scales the numeral 1.06",
    hovered.numeralTransform,
  );
  ok(
    hovered.titleTransform.endsWith("4, 0)"),
    "hover shifts the title 4px",
    hovered.titleTransform,
  );
  ok(near(parseRgb(hovered.border), ACCENT), "hover takes the border to accent", hovered.border);
  ok(hovered.lift.endsWith("-6)"), "hover lifts the card 6px", hovered.lift);
  ok(Number(hovered.glow) === 1, "hover shows the cursor glow", hovered.glow);

  await context.close();
}

stage('8 chips');
// ===== 8. Filter chip boundary on /selected-work =====
{
  const context = await newContext(browser, 1440, false);
  const page = await context.newPage();
  await page.goto(BASE + "/selected-work", { waitUntil: "domcontentloaded" });
  await settle(page);
  const chip = await page.evaluate(() => {
    const el = document.querySelector('.work-filter-chip[aria-pressed="false"]');
    const cs = getComputedStyle(el);
    return { border: cs.borderTopColor, fill: cs.backgroundColor };
  });
  const border = parseRgb(chip.border);
  const flat = (c) => [
    Math.round(c[0] * c[3] + CANVAS[0] * (1 - c[3])),
    Math.round(c[1] * c[3] + CANVAS[1] * (1 - c[3])),
    Math.round(c[2] * c[3] + CANVAS[2] * (1 - c[3])),
  ];
  const borderFlat = flat(border);
  const fillFlat = flat(parseRgb(chip.fill));
  const vsCanvas = contrast(borderFlat, CANVAS);
  const vsFill = contrast(borderFlat, fillFlat);
  ok(vsCanvas >= 3, "chip border clears 3:1 against the section", `${vsCanvas.toFixed(3)}:1`);
  ok(vsFill >= 3, "chip border clears 3:1 against the chip's own fill", `${vsFill.toFixed(3)}:1`);
  note(
    `filter chip border ${chip.border}: ${vsCanvas.toFixed(3)}:1 vs canvas, ${vsFill.toFixed(3)}:1 vs fill`,
  );
  await context.close();
}

stage('9 axe');
// ===== 9. axe, both widths, both motion modes, three runs =====
for (let run = 1; run <= 3; run += 1) {
  for (const width of [390, 1440]) {
    for (const reduced of [false, true]) {
      const context = await newContext(browser, width, reduced);
      const page = await context.newPage();
      for (const route of PAGES) {
        await page.goto(BASE + route, { waitUntil: "domcontentloaded" });
        await settle(page);
        await runAxe(page, `${route} ${width} ${reduced ? "reduced" : "full"} run${run} top`);
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
        await page.waitForTimeout(900);
        await runAxe(page, `${route} ${width} ${reduced ? "reduced" : "full"} run${run} mid`);
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(900);
        await runAxe(page, `${route} ${width} ${reduced ? "reduced" : "full"} run${run} bottom`);
      }

      // Panel open + FAQ open, on the homepage.
      await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
      await settle(page);
      if (width === 1440) {
        await page.getByRole("link", { name: "Creative Services", exact: true }).first().hover();
        await page.waitForTimeout(600);
        await runAxe(page, `/ panel-open ${width} ${reduced ? "reduced" : "full"} run${run}`);
        await page.keyboard.press("Escape");
      } else {
        await page.getByRole("button", { name: "Menu" }).click();
        await page.waitForTimeout(600);
        await runAxe(page, `/ drawer-open ${width} ${reduced ? "reduced" : "full"} run${run}`);
        await page.keyboard.press("Escape");
      }
      await page.waitForTimeout(400);
      await page.evaluate(() => document.querySelector(".faq-list").scrollIntoView());
      await page.locator(".faq-row button").nth(1).click();
      await page.waitForTimeout(700);
      await runAxe(page, `/ faq-open ${width} ${reduced ? "reduced" : "full"} run${run}`);
      await context.close();
    }
  }
}

stage('10 overflow');
// ===== 10. No overflow, 360–1920 =====
{
  const widths = [360, 390, 414, 480, 640, 768, 834, 1024, 1180, 1280, 1440, 1680, 1920];
  for (const width of widths) {
    const context = await newContext(browser, width, false);
    const page = await context.newPage();
    for (const route of PAGES) {
      await page.goto(BASE + route, { waitUntil: "domcontentloaded" });
      await settle(page);
      const over = await page.evaluate(() => ({
        doc: document.documentElement.scrollWidth,
        win: window.innerWidth,
      }));
      ok(
        over.doc <= over.win + 1,
        `no horizontal overflow ${route} @${width}`,
        JSON.stringify(over),
      );
    }
    if (width >= 1280) {
      await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
      await settle(page);
      for (const name of ["Creative Services", "Ways to Work With Us", "Selected Work"]) {
        await page.getByRole("link", { name, exact: true }).first().hover();
        await page.waitForTimeout(500);
        const over = await page.evaluate(() => ({
          doc: document.documentElement.scrollWidth,
          win: window.innerWidth,
        }));
        ok(
          over.doc <= over.win + 1,
          `no overflow with "${name}" open @${width}`,
          JSON.stringify(over),
        );
        await page.keyboard.press("Escape");
        await page.mouse.move(50, 700);
        await page.waitForTimeout(300);
      }
    }
    await context.close();
  }
}

stage('11 reduced motion');
// ===== 11. Reduced motion =====
{
  const context = await newContext(browser, 1440, true);
  const page = await context.newPage();
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await settle(page);

  ok((await page.locator(".nav-backdrop").count()) === 0, "reduced motion renders no backdrop");
  ok((await page.locator(".button-roll-label--copy").count()) > 0, "roll copy still in the DOM");
  const rollHidden = await page.evaluate(
    () => getComputedStyle(document.querySelector(".button-roll-label--copy")).display,
  );
  ok(rollHidden === "none", "reduced motion removes the roll copy", rollHidden);

  await page.evaluate(() => document.querySelector(".faq-list").scrollIntoView());
  await page.waitForTimeout(500);
  const faq = await page.evaluate(() => {
    const rule = document.querySelector(".faq-rule");
    const trig = document.querySelector(".faq-row button");
    return {
      ruleTransform: getComputedStyle(rule).transform,
      triggerOpacity: getComputedStyle(trig).opacity,
      // A `display: none` pseudo-element still reports its `content`, so `display` is the
      // question, not `content`.
      sweepDisplay: getComputedStyle(trig, "::before").display,
    };
  });
  ok(
    faq.ruleTransform === "none" || faq.ruleTransform === "matrix(1, 0, 0, 1, 0, 0)",
    "reduced motion: rules start drawn",
    faq.ruleTransform,
  );
  ok(
    Number(faq.triggerOpacity) === 1,
    "reduced motion: questions start visible",
    faq.triggerOpacity,
  );
  ok(faq.sweepDisplay === "none", "reduced motion: no sweep", faq.sweepDisplay);

  await page.locator(".faq-row button").first().click();
  await page.waitForTimeout(400);
  const opened = await page.evaluate(() => {
    const t = document.querySelector(".faq-row button");
    const p = document.getElementById(t.getAttribute("aria-controls"));
    return { expanded: t.getAttribute("aria-expanded"), height: p.getBoundingClientRect().height };
  });
  ok(
    opened.expanded === "true" && opened.height > 40,
    "reduced motion: the FAQ still opens",
    JSON.stringify(opened),
  );

  await page.evaluate(() =>
    document.querySelector(".reason-title").closest("section").scrollIntoView(),
  );
  await page.waitForTimeout(600);
  const reason = await page.evaluate(() => {
    const card = document.querySelector(".reason-title").closest(".capability-card");
    return {
      dashoffset: getComputedStyle(card.querySelector(".reason-icon-draw")).strokeDashoffset,
      reveal: getComputedStyle(card.closest(".capability-reveal")).clipPath,
      glow: document.querySelectorAll(".capability-glow").length,
    };
  });
  ok(parseFloat(reason.dashoffset) === 0, "reduced motion: marks fully drawn", reason.dashoffset);
  ok(reason.reveal === "none", "reduced motion: no clip curtain", reason.reveal);
  ok(reason.glow === 0, "reduced motion: no glow element", String(reason.glow));

  await context.close();
}

await browser.close();

console.log("\n----- NOTES -----");
for (const n of notes) console.log(n);
console.log(`\n===== ${pass} PASS, ${failures.length} FAIL =====`);
for (const f of failures) console.log("FAIL " + f);
process.exit(failures.length === 0 ? 0 : 1);
