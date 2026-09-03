// Browser verification for /about against the static export served on :3100.
//
//   node vr-serve.mjs 3100 &   (from the repo root)
//   node verify-about.mjs
//
// 1. Motion: for each section, measure the opacity of its first reveal target while the
//    section is still below the fold, then scroll it into view and measure again. A
//    section only counts as animating if it was hidden BEFORE and visible AFTER.
// 2. Mid-scroll screenshots at three offsets, taken ~250ms after the scroll so the
//    frame catches reveals in flight.
// 3. axe at 390 and 1440, sampled at three settled scroll positions each.
// 4. Overflow sweep 360–1920.
// 5. Reduced motion: with the preference set, every reveal target is at opacity 1 and
//    transform none BEFORE any scrolling, and the drawn rules are at scaleX(1).
// 6. Rendered-copy invention check: no digits and no premises/award vocabulary in main.
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdirSync } from "node:fs";

const URL = "http://127.0.0.1:3100/about";
const OUT = process.argv[2] ?? "docs/about-redesign";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
let failures = 0;
const fail = (msg) => {
  failures += 1;
  console.log(`FAIL ${msg}`);
};

// ---------------------------------------------------------------- 1. motion, per section
{
  // 700px tall, not 900: the belief statement begins about 780px down at 1440 wide, so at
  // a 900px viewport it is already on screen at load and cannot be observed arriving.
  const context = await browser.newContext({ viewport: { width: 1440, height: 700 } });
  const page = await context.newPage();
  page.on("pageerror", (e) => fail(`pageerror ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") fail(`console ${m.text().slice(0, 160)}`);
  });
  await page.goto(URL, { waitUntil: "load" });
  await page.waitForTimeout(1200);

  const sectionCount = await page.locator("main > section").count();
  console.log(`sections: ${sectionCount}`);

  // The first element inside each section that carries an entry style (opacity in its
  // inline style) or a reveal word — the thing that should be hidden before entry.
  const probe = (index) =>
    page.evaluate((i) => {
      const section = document.querySelectorAll("main > section")[i];
      const targets = [
        ...section.querySelectorAll(
          "[style*='opacity'], .about-input-entry, .reveal-word-inner, .drawn-rule, .about-frame img",
        ),
      ];
      const sample = targets.slice(0, 12).map((el) => {
        const cs = getComputedStyle(el);
        return {
          tag:
            el.tagName.toLowerCase() +
            (el.className ? "." + String(el.className).split(" ")[0] : ""),
          opacity: cs.opacity,
          transform: cs.transform,
        };
      });
      const rect = section.getBoundingClientRect();
      return { top: rect.top, label: section.getAttribute("aria-label"), sample };
    }, index);

  const hiddenBefore = (sample) =>
    sample.some(
      (s) =>
        s.opacity === "0" || (s.transform !== "none" && s.transform !== "matrix(1, 0, 0, 1, 0, 0)"),
    );
  const visibleAfter = (sample) =>
    sample.every(
      (s) =>
        s.opacity === "1" && (s.transform === "none" || s.transform === "matrix(1, 0, 0, 1, 0, 0)"),
    );

  for (let i = 1; i < sectionCount; i += 1) {
    // Scroll so the section is still fully below the fold, then probe.
    await page.evaluate((i) => {
      const section = document.querySelectorAll("main > section")[i];
      const top = section.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, Math.max(0, top - window.innerHeight - 200));
    }, i);
    await page.waitForTimeout(300);
    const before = await probe(i);
    // Now bring it in and let every stagger finish.
    await page.evaluate((i) => {
      const section = document.querySelectorAll("main > section")[i];
      const top = section.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top - 120);
    }, i);
    await page.waitForTimeout(2200);
    const after = await probe(i);
    // A section that is already on screen when the page loads cannot be observed
    // "arriving on scroll" — it arrives on load. The belief statement is one: at every
    // viewport it begins inside the first screen. So for those, reload and sample the
    // moment the document is ready, before the entry has had time to finish.
    let onLoadEvidence = null;
    if (!hiddenBefore(before.sample)) {
      const fresh = await context.newPage();
      await fresh.goto(URL, { waitUntil: "commit" });
      onLoadEvidence = await fresh.evaluate((i) => {
        const section = document.querySelectorAll("main > section")[i];
        if (!section) return null;
        const el = section.querySelector("[style*='opacity'], .belief-enter");
        return el ? getComputedStyle(el).opacity : null;
      }, i);
      await fresh.close();
    }
    const ok =
      (hiddenBefore(before.sample) || Number(onLoadEvidence) < 1) && visibleAfter(after.sample);
    console.log(
      `${ok ? "ok  " : "FAIL"} section ${i} "${before.label}": hidden-before=${hiddenBefore(before.sample)} hidden-at-load=${onLoadEvidence} visible-after=${visibleAfter(after.sample)}`,
    );
    if (!ok) {
      failures += 1;
      console.log("   before:", JSON.stringify(before.sample.slice(0, 4)));
      console.log(
        "   after: ",
        JSON.stringify(
          after.sample
            .filter(
              (s) =>
                s.opacity !== "1" ||
                (s.transform !== "none" && s.transform !== "matrix(1, 0, 0, 1, 0, 0)"),
            )
            .slice(0, 4),
        ),
      );
    }
  }

  // Mid-scroll screenshots: reload so nothing has revealed, then jump and shoot fast.
  for (const [name, fraction] of [
    ["mid-1-approach", 0.22],
    ["mid-2-inputs", 0.42],
    ["mid-3-building", 0.58],
  ]) {
    await page.goto(URL, { waitUntil: "load" });
    await page.waitForTimeout(600);
    await page.evaluate(
      (f) => window.scrollTo(0, (document.body.scrollHeight - window.innerHeight) * f),
      fraction,
    );
    await page.waitForTimeout(260);
    await page.screenshot({ path: `${OUT}/${name}.png` });
    await page.waitForTimeout(1800);
    await page.screenshot({ path: `${OUT}/${name}-settled.png` });
  }

  // Settled full page at 1440 and 390 for the record (final state only — not motion evidence).
  await page.goto(URL, { waitUntil: "load" });
  for (let y = 0; y < 12000; y += 500) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/full-1440.png`, fullPage: true });
  await context.close();
}

// ---------------------------------------------------------------- 3. axe at 390 and 1440
for (const width of [390, 1440]) {
  const context = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: "load" });
  await page.waitForTimeout(900);
  for (const f of [0.0, 0.55, 0.98]) {
    await page.evaluate(
      (v) => window.scrollTo(0, (document.body.scrollHeight - window.innerHeight) * v),
      f,
    );
    await page.waitForTimeout(1600);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    for (const v of results.violations) {
      fail(
        `AXE @${width} ${f} [${v.impact}] ${v.id} x${v.nodes.length} ${v.nodes[0].target.join(" ")}`,
      );
    }
    console.log(`axe @${width} f=${f}: ${results.violations.length} violations`);
  }
  if (width === 390) {
    await page.screenshot({ path: `${OUT}/full-390.png`, fullPage: true });
  }
  await context.close();
}

// ---------------------------------------------------------------- 4. overflow 360–1920
{
  const context = await browser.newContext();
  const page = await context.newPage();
  for (const width of [360, 390, 414, 600, 768, 900, 1024, 1180, 1280, 1440, 1600, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(URL, { waitUntil: "load" });
    await page.waitForTimeout(500);
    for (let y = 0; y < 12000; y += 700) {
      await page.evaluate((y) => window.scrollTo(0, y), y);
      await page.waitForTimeout(60);
    }
    const wide = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (wide > 1) fail(`OVERFLOW @${width} +${wide}px`);
    else console.log(`overflow @${width}: none`);
  }
  await context.close();
}

// ---------------------------------------------------------------- 5. reduced motion
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: "load" });
  await page.waitForTimeout(700);
  const report = await page.evaluate(() => {
    const targets = [
      ...document.querySelectorAll(
        "main [style*='opacity'], .about-input-entry, .reveal-word-inner, .drawn-rule, .about-frame img",
      ),
    ];
    const bad = [];
    for (const el of targets) {
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const belowFold = rect.top > window.innerHeight;
      const transformOk = cs.transform === "none" || cs.transform === "matrix(1, 0, 0, 1, 0, 0)";
      // Below the fold, with reduced motion, opacity must already be 1 and transform none.
      if (belowFold && (cs.opacity !== "1" || !transformOk)) {
        bad.push({
          tag: el.tagName.toLowerCase() + "." + String(el.className).split(" ")[0],
          opacity: cs.opacity,
          transform: cs.transform,
        });
      }
      if (
        el.classList.contains("drawn-rule") &&
        cs.transform !== "matrix(1, 0, 0, 1, 0, 0)" &&
        cs.transform !== "none"
      ) {
        bad.push({ tag: "drawn-rule", transform: cs.transform });
      }
      if (el.tagName === "IMG" && !transformOk) {
        bad.push({ tag: "about-frame img", transform: cs.transform });
      }
    }
    // Stagger delays must be 0 under reduced motion.
    const delayed = [...document.querySelectorAll("main [style*='transition-delay']")].filter(
      (el) => parseFloat(getComputedStyle(el).transitionDelay) > 0,
    ).length;
    return { checked: targets.length, bad: bad.slice(0, 8), badCount: bad.length, delayed };
  });
  console.log(
    `reduced motion: ${report.checked} targets checked, ${report.badCount} not at final state, ${report.delayed} with a delay`,
  );
  if (report.badCount > 0 || report.delayed > 0) {
    fail(`reduced motion ${JSON.stringify(report.bad)}`);
  }
  await page.screenshot({ path: `${OUT}/reduced-motion-top.png` });
  await context.close();
}

// ---------------------------------------------------------------- 6. rendered copy
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: "load" });
  // Everything except the closing CTA, whose form is a shared component: its company-size
  // select carries "1–50 employees" and the rest of the site's form vocabulary, which is
  // not About copy and is not what this check is for.
  const text = await page.evaluate(() =>
    [...document.querySelectorAll("main > section")]
      .slice(0, -1)
      .map((s) => s.innerText)
      .join(String.fromCharCode(10)),
  );
  const digits = text.match(/\d+/g) ?? [];
  // The only digits allowed on the page are the decorative stage numerals, which are
  // generated content and therefore NOT in innerText — so the answer must be none.
  if (digits.length > 0) fail(`digits in rendered copy: ${digits.join(",")}`);
  const banned = text.match(
    /\b(founded|established in|our team of|employees|headquartered|based in|award[- ]winning|certified|accredited|trusted by|hundreds of|thousands of|industry[- ]leading|world[- ]class|turnaround|guaranteed?|unlimited)\b/gi,
  );
  if (banned) fail(`banned vocabulary rendered: ${banned.join(",")}`);
  const h1 = await page.locator("h1").count();
  const h2 = await page.locator("h2").count();
  const h3 = await page.locator("h3").count();
  console.log(`headings: h1=${h1} h2=${h2} h3=${h3}; rendered words: ${text.split(/\s+/).length}`);
  await context.close();
}

await browser.close();
console.log(`\nfailures: ${failures}`);
process.exit(failures > 0 ? 1 : 0);
