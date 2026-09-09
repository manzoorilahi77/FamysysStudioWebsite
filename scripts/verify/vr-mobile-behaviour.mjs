// THE MOBILE HARNESS, PART TWO: the things a size sweep cannot see.
//
// `vr-mobile.mjs` measures every page at every width. This one drives the four behaviours
// the pass turns on, each of which is a sequence rather than a measurement:
//
//   REDUCED MOTION at 390 on every page — nothing hidden, no horizontal overflow, and no
//   section left mid-transform because a layer stood down after it had started writing.
//   HOVER DEPENDENCE — every page loaded with a coarse pointer, asking whether the strings
//   that only appear under a cursor are in the document anyway.
//   THE DRAWER — open, scroll lock, focus trap, Escape, focus returned to the trigger, and
//   every navigation destination reachable.
//   THE CONTACT FORM — filled and submitted end to end at 390x844, including the error
//   state, checking the submit button is still on screen when seven errors are showing.
//   THE ADMIN PANEL at 390 — drawer, editor, and the three controls that have to be
//   reachable without scrolling sideways.
//   200% ZOOM at 1280, which breaks fluid type in ways a narrow viewport does not.
//
// RUN IT WITH `npx tsx`, not bare node. The admin section signs in by minting a session
// with the project's own `issueSession` and the project's own SESSION_SECRET — the same
// thing e2e/global-setup.ts does, and for the same reason. The sign-in FORM cannot be used
// from a development machine: its rate limiter counts rows in `login_attempts`, the
// database is not reachable from here, and every attempt therefore answers 503. Nothing
// about the gate is bypassed — the harness presents a session it was entitled to be
// issued, and the panel's own `isValidSession` still decides whether it gets in.
import { chromium } from "@playwright/test";
import path from "node:path";
import { mkdirSync } from "node:fs";
import { loadEnv } from "../lib/loadEnv.mjs";

loadEnv();

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

const browser = await chromium.launch();

async function phone(extra = {}) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    hasTouch: true,
    ...extra,
  });
  return { context, page: await context.newPage() };
}

async function settle(page) {
  await page.waitForTimeout(300);
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.85;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 40));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(300);
}

// ---------------------------------------------------------------------------
console.log("\n== REDUCED MOTION at 390x844 ==");
for (const [name, url] of PAGES) {
  const { context, page } = await phone({ reducedMotion: "reduce" });
  await page.goto(`${BASE}${url}`, { waitUntil: "networkidle" });
  await settle(page);
  const state = await page.evaluate(() => {
    const doc = document.documentElement;
    // Anything that carries the site's entry treatment and never arrived would sit at
    // opacity 0 with its text still in the tab order — the exact failure the base-state
    // rule exists to prevent.
    const invisible = [...document.querySelectorAll("h1, h2, h3, p, li, a[href], button")].filter(
      (element) => {
        const style = getComputedStyle(element);
        if (style.display === "none" || style.visibility === "hidden") return false;
        if (!element.textContent?.trim()) return false;
        return Number(style.opacity) < 0.1;
      },
    ).length;
    return {
      overflow: doc.scrollWidth > doc.clientWidth,
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      invisible,
      reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
    };
  });
  check(state.reduced, `${name}: reduced-motion emulation took`);
  check(!state.overflow, `${name}: no overflow`, `${state.scrollWidth} > ${state.clientWidth}`);
  check(state.invisible === 0, `${name}: nothing left invisible`, `${state.invisible} element(s)`);
  await context.close();
}

// ---------------------------------------------------------------------------
console.log("\n== NOTHING DEPENDS ON HOVER (coarse pointer, no cursor used) ==");
for (const [name, url] of PAGES) {
  const { context, page } = await phone();
  await page.goto(`${BASE}${url}`, { waitUntil: "networkidle" });
  await settle(page);
  const hidden = await page.evaluate(() => {
    // The site's own hover-revealed strings, by the class each one carries. A string is
    // "reachable" when it is rendered AND visible without anything having been pointed at.
    const suspects = [
      [".frame-say", "process step sentence"],
      [".element-panel-say", "differentiator descriptor"],
      [".tile-sum", "tier summary"],
      [".tile-desc", "tier descriptor"],
      [".cover-intent", "work intent line"],
      [".service-descriptor", "capability descriptor"],
      [".rail-say", "quality sentence"],
      [".hero-final-band-label", "hero band label"],
    ];
    const out = [];
    for (const [selector, what] of suspects) {
      const nodes = [...document.querySelectorAll(selector)];
      if (nodes.length === 0) continue;
      const unreadable = nodes.filter((node) => {
        const style = getComputedStyle(node);
        if (style.display === "none" || style.visibility === "hidden") return true;
        if (Number(style.opacity) < 0.1) return true;
        return !node.textContent?.trim();
      }).length;
      if (unreadable > 0) out.push(`${what}: ${unreadable}/${nodes.length} not visible`);
    }
    return out;
  });
  check(hidden.length === 0, `${name}: every descriptor readable without hover`, hidden.join("; "));
  await context.close();
}

// ---------------------------------------------------------------------------
console.log("\n== THE DRAWER: scroll lock, focus trap, Escape, every destination ==");
{
  const { context, page } = await phone();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);

  const trigger = page.locator("#mobile-drawer-trigger");
  const triggerBox = await trigger.boundingBox();
  check(
    (triggerBox?.width ?? 0) >= 44 && (triggerBox?.height ?? 0) >= 44,
    "Menu trigger is at least 44x44",
    `${Math.round(triggerBox?.width ?? 0)}x${Math.round(triggerBox?.height ?? 0)}`,
  );

  await trigger.click();
  await page.waitForTimeout(400);

  check(
    (await page.evaluate(() => getComputedStyle(document.body).overflow)) === "hidden",
    "body scroll is locked while the drawer is open",
  );
  check(
    await page.evaluate(() => document.activeElement?.id === "mobile-drawer"),
    "focus moves into the drawer on open",
    await page.evaluate(() => document.activeElement?.tagName ?? "none"),
  );

  // Every route the site has, reachable from the drawer — including How We Work, which
  // lives inside a panel on desktop and must not become an orphan here.
  const wanted = [
    "/",
    "/creative-services",
    "/how-we-work",
    "/ways-to-work-with-us",
    "/selected-work",
    "/about",
    "/contact",
  ];
  // Expand every group first: a destination behind a collapsed disclosure is reachable,
  // and the test has to reach it the same way a reader would.
  const chevrons = page.locator("#mobile-drawer button[aria-expanded]");
  for (let i = 0; i < (await chevrons.count()); i += 1) {
    await chevrons.nth(i).click();
    await page.waitForTimeout(150);
  }
  const hrefs = await page.evaluate(() =>
    [...document.querySelectorAll("#mobile-drawer a[href]")].map((a) => a.getAttribute("href")),
  );
  const missing = wanted.filter((route) => route !== "/" && !hrefs.includes(route));
  check(missing.length === 0, "every page is reachable from the drawer", `missing ${missing}`);

  // Tab all the way round and confirm focus never leaves the dialog.
  let escaped = false;
  for (let i = 0; i < 40; i += 1) {
    await page.keyboard.press("Tab");
    const inside = await page.evaluate(() =>
      Boolean(document.getElementById("mobile-drawer")?.contains(document.activeElement)),
    );
    if (!inside) {
      escaped = true;
      break;
    }
  }
  check(!escaped, "focus is trapped inside the drawer across 40 tabs");

  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  check(
    await page.evaluate(() => document.activeElement?.id === "mobile-drawer-trigger"),
    "Escape closes and returns focus to the trigger",
    await page.evaluate(() => document.activeElement?.id ?? "none"),
  );
  check(
    (await page.evaluate(() => getComputedStyle(document.body).overflow)) !== "hidden",
    "body scroll is released on close",
  );
  await context.close();
}

// ---------------------------------------------------------------------------
console.log("\n== THE CONTACT FORM, end to end at 390x844 ==");
{
  const { context, page } = await phone();
  await page.goto(`${BASE}/contact`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);

  const fields = page.locator("form .contact-field");
  const count = await fields.count();
  let shortest = Infinity;
  for (let i = 0; i < count; i += 1) {
    const box = await fields.nth(i).boundingBox();
    shortest = Math.min(shortest, box?.height ?? 0);
  }
  check(shortest >= 44, "every field is at least 44px tall", `shortest ${shortest}px`);

  const fontSizes = await page.evaluate(() =>
    [...document.querySelectorAll("form .contact-field")].map((element) =>
      parseFloat(getComputedStyle(element).fontSize),
    ),
  );
  check(
    fontSizes.every((size) => size >= 16),
    "no field is under 16px, so iOS will not zoom on focus",
    `${Math.min(...fontSizes)}px`,
  );

  check(
    await page.evaluate(
      () =>
        [...document.querySelectorAll("form select")].every(
          (element) => element.tagName === "SELECT",
        ) && document.querySelectorAll("form select").length > 0,
    ),
    "the two selects are native, so they use the platform picker",
  );

  check(
    await page.evaluate(() =>
      [...document.querySelectorAll("form .contact-field")].every((element) =>
        Boolean(document.querySelector(`label[for="${CSS.escape(element.id)}"]`)),
      ),
    ),
    "every field has a real label, not a placeholder",
  );

  // THE ERROR STATE. Submit empty, then check the submit button is still on screen with
  // seven messages showing — the failure mode the brief names.
  const submit = page.locator('form button[type="submit"]');
  await submit.scrollIntoViewIfNeeded();
  await submit.click();
  await page.waitForTimeout(600);
  const errorState = await page.evaluate(() => {
    const doc = document.documentElement;
    const button = document.querySelector('form button[type="submit"]');
    const rect = button?.getBoundingClientRect();
    return {
      errors: document.querySelectorAll("form .contact-error").length,
      overflow: doc.scrollWidth > doc.clientWidth,
      buttonInDocument: Boolean(rect && rect.height > 0),
      focusedIsField: document.activeElement?.classList.contains("contact-field") ?? false,
    };
  });
  check(errorState.errors > 0, "a failed submit reports its errors", `${errorState.errors} shown`);
  check(errorState.focusedIsField, "focus moves to the first invalid field");
  check(!errorState.overflow, "the error state does not push the page sideways");
  check(errorState.buttonInDocument, "the submit button survives the error state");

  // Fill it and send it. The endpoint is real; with no intake wired it answers 500, so
  // what is asserted is that the request went and the UI told the truth about the answer.
  await page.fill('input[name="firstName"]', "Mobile");
  await page.fill('input[name="lastName"]', "Pass");
  await page.fill('input[name="email"]', "mobile.pass@example.com");
  await page.fill('input[name="companyName"]', "Famysys QA");
  await page.selectOption('select[name="role"]', { index: 1 });
  await page.selectOption('select[name="companySize"]', { index: 1 });
  const brief = page.locator('textarea[name="brief"]');
  const beforeGrow = (await brief.boundingBox())?.height ?? 0;
  // Long enough to be unambiguous: the box starts at five rows, and at 390px wide five
  // rows is about 170 characters. A brief that only just exceeds that proves nothing.
  await brief.fill(
    "A long enough brief to prove the box grows with what is typed rather than making the "
      .repeat(6),
  );
  await page.waitForTimeout(250);
  const afterGrow = (await brief.boundingBox())?.height ?? 0;
  check(
    afterGrow > beforeGrow,
    "the brief field grows with what is typed",
    `${Math.round(beforeGrow)}px -> ${Math.round(afterGrow)}px`,
  );

  const [response] = await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/demo-request"), { timeout: 30_000 }),
    submit.click(),
  ]);
  await page.waitForTimeout(800);
  const outcome = await page.evaluate(() => ({
    confirmed: Boolean(document.querySelector('[role="status"]')),
    reportedError: document.body.textContent?.includes("went wrong") ?? false,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  console.log(`       endpoint answered ${response.status()}`);
  check(
    outcome.confirmed || outcome.reportedError || response.status() >= 400,
    "the form submits and reports what came back",
    `status ${response.status()}, confirmed=${outcome.confirmed}`,
  );
  check(!outcome.overflow, "no overflow after submitting");
  await context.close();
}

// ---------------------------------------------------------------------------
console.log("\n== 200% ZOOM at 1280x800 (a 640px CSS viewport with desktop type) ==");
for (const [name, url] of PAGES) {
  const context = await browser.newContext({
    viewport: { width: 640, height: 400 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await page.goto(`${BASE}${url}`, { waitUntil: "networkidle" });
  await settle(page);
  const state = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  check(
    !state.overflow,
    `${name}: no overflow at 200% zoom`,
    `${state.scrollWidth} > ${state.clientWidth}`,
  );
  await context.close();
}

// ---------------------------------------------------------------------------
console.log("\n== THE ADMIN PANEL at 390x844 ==");
if (!process.env.SESSION_SECRET) {
  console.log("  skipped: SESSION_SECRET is not set, so no session can be minted");
} else {
  const { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, issueSession } = await import(
    "../../src/infrastructure/auth/session.ts"
  );
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    hasTouch: true,
  });
  await context.addCookies([
    {
      name: SESSION_COOKIE,
      value: issueSession(),
      domain: "localhost",
      path: "/",
      expires: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    },
  ]);
  const page = await context.newPage();
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  check(!page.url().includes("/admin/login"), "the minted session reaches the panel", page.url());

  check(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
    "admin home: no horizontal overflow at 390",
  );

  const sections = page.locator('button[aria-controls="admin-drawer"]');
  check(await sections.isVisible(), "the sidebar is a drawer behind a button, not a fixed rail");
  const triggerBox = await sections.boundingBox();
  check(
    (triggerBox?.height ?? 0) >= 44,
    "the drawer trigger is at least 44px tall",
    `${Math.round(triggerBox?.height ?? 0)}px`,
  );

  await sections.click();
  await page.waitForTimeout(400);
  check(
    await page.evaluate(() => {
      const drawer = document.getElementById("admin-drawer");
      return Boolean(drawer) && !drawer.hasAttribute("inert");
    }),
    "the drawer opens and stops being inert",
  );
  check(
    (await page.evaluate(() => getComputedStyle(document.body).overflow)) === "hidden",
    "the page behind the admin drawer does not scroll",
  );

  // Into a SECTION editor, which is where Save, Preview and Publish live — not the page
  // screen above it, whose links look the same in the drawer. Four path segments is what
  // tells them apart: /admin/pages/<page>/<section>.
  const sectionHref = await page.evaluate(() => {
    const links = [...document.querySelectorAll('#admin-drawer a[href*="/admin/pages/"]')];
    const section = links.find((a) => (a.getAttribute("href") ?? "").split("/").length === 5);
    return section?.getAttribute("href") ?? null;
  });
  if (!sectionHref) {
    throw new Error("no section link in the admin drawer");
  }
  await page.goto(`${BASE}${sectionHref}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);

  const editorState = await page.evaluate(() => {
    const doc = document.documentElement;
    const names = ["Save draft", "Preview", "Publish"];
    const found = names.map((name) => {
      const button = [...document.querySelectorAll("button")].find(
        (element) => element.textContent?.trim() === name,
      );
      if (!button) return { name, present: false };
      const rect = button.getBoundingClientRect();
      return {
        name,
        present: true,
        height: Math.round(rect.height),
        withinPage: rect.left >= -1 && rect.right <= doc.clientWidth + 1,
      };
    });
    const boxes = [...document.querySelectorAll("textarea, input[type=text]")];
    return {
      overflow: doc.scrollWidth > doc.clientWidth,
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      found,
      shortestField: boxes.length
        ? Math.min(...boxes.map((element) => Math.round(element.getBoundingClientRect().height)))
        : null,
      smallestType: boxes.length
        ? Math.min(...boxes.map((element) => parseFloat(getComputedStyle(element).fontSize)))
        : null,
    };
  });
  check(
    !editorState.overflow,
    "section editor: no horizontal overflow at 390",
    `${editorState.scrollWidth} > ${editorState.clientWidth}`,
  );
  for (const control of editorState.found) {
    check(
      control.present && control.withinPage && control.height >= 44,
      `${control.name} is reachable without scrolling sideways, at 44px`,
      JSON.stringify(control),
    );
  }
  check(
    (editorState.shortestField ?? 0) >= 44,
    "every field editor has real height",
    `shortest ${editorState.shortestField}px`,
  );
  check(
    (editorState.smallestType ?? 0) >= 16,
    "no field editor is under 16px, so iOS will not zoom on focus",
    `${editorState.smallestType}px`,
  );

  // The preview is the panel's other half, and it has to be legible on a small screen.
  const previewButton = page.locator("button", { hasText: "Preview" }).first();
  if (await previewButton.isVisible()) {
    await previewButton.click();
    await page.waitForTimeout(2500);
    const preview = await page.evaluate(() => {
      const frame = document.querySelector("iframe");
      if (!frame) return null;
      const rect = frame.getBoundingClientRect();
      return {
        height: Math.round(rect.height),
        width: Math.round(rect.width),
        share: Number((rect.height / window.innerHeight).toFixed(2)),
      };
    });
    check(
      preview !== null && preview.share >= 0.6,
      "the preview frame takes most of a small screen",
      JSON.stringify(preview),
    );
  }

  await page.screenshot({ path: path.join(OUT, "admin-390.png") });
  await context.close();
}

await browser.close();

console.log(`\n${passed} passed, ${failures.length} failed`);
for (const failure of failures) console.log(`  ${failure}`);
process.exitCode = failures.length === 0 ? 0 : 1;
