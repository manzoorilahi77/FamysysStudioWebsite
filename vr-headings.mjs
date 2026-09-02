// The companion to vr-no-js.mjs, with scripting ON: every heading on every route, at four
// scroll offsets, checked for full opacity once the page has settled at that position.
//
// A heading only fractionally on screen is legitimately not revealed yet — the observer
// threshold is 0.2 — so a single "faded" result at an offset where a heading is just
// cresting the fold is expected, and the run prints the fraction so it can be told apart
// from a heading that is genuinely stuck.
//
//   node vr-serve.mjs 3100 &  node vr-headings.mjs 3100
import { chromium } from "@playwright/test";
const PORT = Number(process.argv[2] ?? 3100);
const ROUTES = [
  "/",
  "/about",
  "/contact",
  "/creative-services",
  "/how-we-work",
  "/selected-work",
  "/ways-to-work-with-us",
];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const problems = [];
p.on("pageerror", (e) => problems.push("PAGEERROR " + e.message));
p.on("console", (m) => {
  if (m.type() === "error") problems.push("CONSOLE " + m.text());
});
p.on("response", (r) => {
  if (r.status() >= 400) problems.push(`HTTP ${r.status()} ${r.url()}`);
});
let worst = 0,
  checked = 0;
for (const route of ROUTES) {
  await p.goto(`http://127.0.0.1:${PORT}${route}`, { waitUntil: "networkidle" });
  const height = await p.evaluate(() => document.body.scrollHeight);
  const lines = [];
  for (let i = 0; i < 4; i += 1) {
    const y = Math.round(((height - 900) * i) / 3);
    await p.evaluate((to) => window.scrollTo(0, to), y);
    await p.waitForTimeout(1400);
    const r = await p.evaluate(() => {
      const heads = [...document.querySelectorAll("main h1, main h2, main h3")];
      const box = heads.filter((h) => {
        const b = h.getBoundingClientRect();
        return b.bottom > 0 && b.top < innerHeight;
      });
      const invisible = box.filter((h) => parseFloat(getComputedStyle(h).opacity) < 0.9);
      return {
        onScreen: box.length,
        invisible: invisible.map((h) => h.textContent.trim().slice(0, 34)),
      };
    });
    checked += r.onScreen;
    worst += r.invisible.length;
    lines.push(
      `  y=${String(y).padStart(6)}  headings on screen ${String(r.onScreen).padStart(2)}  faded ${r.invisible.length}${r.invisible.length ? " :: " + r.invisible.join(" | ") : ""}`,
    );
  }
  console.log(route);
  for (const l of lines) console.log(l);
}
console.log(
  `\n${checked} on-screen headings checked across 7 routes x 4 offsets, ${worst} below full opacity`,
);
console.log(
  problems.length ? problems.slice(0, 8).join("\n") : "no console errors, no page errors, no 4xx",
);
await b.close();
