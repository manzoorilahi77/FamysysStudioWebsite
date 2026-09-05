// Loads every route with SCRIPTING DISABLED and reports what is invisible.
//
// The site's reveals are decoration; nothing readable may depend on the client bundle
// running. Before the fix in useInView this printed 9 of 16 headings hidden on the
// homepage. It should now print 0 on every route, and the only remaining hidden blocks
// should be UI that is SUPPOSED to be closed: collapsed FAQ answers and the card
// descriptors that open on hover.
//
//   node vr-serve.mjs 3100 &  node vr-no-js.mjs 3100
//
// Temporary tooling, run by hand — not wired into `npm test`.
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
const ctx = await b.newContext({
  viewport: { width: 1440, height: 900 },
  javaScriptEnabled: false,
});
const p = await ctx.newPage();
for (const route of ROUTES) {
  await p.goto(`http://127.0.0.1:${PORT}${route}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  const out = await p.evaluate(() => {
    const hidden = [...document.querySelectorAll("main *, footer *")].filter(
      (el) => parseFloat(getComputedStyle(el).opacity) < 0.05 && el.textContent.trim().length > 0,
    );
    const headings = [...document.querySelectorAll("main h1, main h2, main h3")];
    return {
      headingsHidden: headings.filter((el) => parseFloat(getComputedStyle(el).opacity) < 0.05)
        .length,
      headingsTotal: headings.length,
      hiddenWithText: hidden.filter((el) => !hidden.includes(el.parentElement)).length,
      samples: hidden
        .filter((el) => !hidden.includes(el.parentElement))
        .slice(0, 4)
        .map(
          (el) =>
            `${el.tagName.toLowerCase()}.${(el.className || "").toString().split(" ")[0]} :: ${el.textContent.trim().slice(0, 40)}`,
        ),
    };
  });
  console.log(
    `${route.padEnd(22)} headings ${out.headingsHidden}/${out.headingsTotal} hidden | other hidden blocks: ${out.hiddenWithText}`,
  );
  for (const s of out.samples) console.log(`    ${s}`);
}
await b.close();
