import { expect, test } from "@playwright/test";

/**
 * EVERY BLOCK THE PANEL CAN OPEN IS FINDABLE IN THE PAGE THAT RENDERS IT.
 *
 * The section preview aims at `data-cms-section`. When the attribute is missing the frame
 * falls back to the whole page and says so — honest, but useless, and it is the exact
 * failure this suite exists to catch: an editor presses Preview on the Hero and gets the top
 * of the site, which looks so much like a working preview that nobody reports it.
 *
 * The expected ids are written out in full ON PURPOSE, in the same spirit as the block lists
 * in 01-navigation: deriving them from `SECTION_OF` would make this test agree with the code
 * under test. A section renamed in one place and not the other has to be reflected here
 * deliberately.
 *
 * WHAT IS DELIBERATELY ABSENT is listed too, with the reason. A test that only asserts
 * presence cannot tell "switched off" from "we forgot", and those need different fixes.
 */

const ANCHORED: ReadonlyArray<{
  readonly route: string;
  readonly sections: ReadonlyArray<string>;
}> = [
  {
    route: "/",
    sections: [
      "hero",
      "what-we-do",
      "differentiator",
      "how-we-work",
      "ways-to-work",
      "selected-work",
      "closing-cta",
      "footer",
    ],
  },
  {
    route: "/creative-services",
    sections: [
      "hero",
      "capability-index",
      "capabilities",
      "process-pointer",
      "engagement-pointer",
      "closing-cta",
    ],
  },
  {
    route: "/how-we-work",
    sections: [
      "hero",
      "process-overview",
      "process-steps",
      "worked-example",
      "scope-and-revisions",
      "closing-cta",
    ],
  },
  {
    route: "/ways-to-work-with-us",
    sections: [
      "hero",
      "tier-comparison",
      "engagement-tiers",
      "custom-partnership",
      "how-to-choose",
      "scoping",
      "closing-cta",
    ],
  },
  {
    route: "/selected-work",
    sections: [
      "hero",
      "framing",
      "filters",
      "gallery",
      "progression",
      "capability-links",
      "closing-cta",
    ],
  },
  {
    route: "/about",
    sections: [
      "hero",
      "belief",
      "approach",
      "inputs",
      "building",
      "ecosystem",
      "direction",
      "closing-cta",
    ],
  },
  { route: "/contact", sections: ["hero", "form", "next-steps"] },
];

/**
 * Blocks the panel lists that the page does not render, and why. Each is a case the preview
 * reports rather than pretends about, and each would be a bug if it started rendering
 * without an anchor.
 */
const NOT_RENDERED: ReadonlyArray<{
  readonly route: string;
  readonly section: string;
  readonly because: string;
}> = [
  { route: "/", section: "why-famysys", because: "off the homepage at the client's direction" },
  { route: "/", section: "faq", because: "the shared questions render on /faq now, not on the homepage" },
  {
    route: "/selected-work",
    section: "piece-detail",
    because: "a dialog that exists only once a visitor opens a piece",
  },
];

for (const { route, sections } of ANCHORED) {
  test(`${route} marks every block the panel can preview`, async ({ page }) => {
    await page.goto(route);

    for (const section of sections) {
      // `.first()` because a section can legitimately be a RUN of elements — the six
      // capability blocks are one section, and so are the five process steps. The preview
      // measures the union of them; this only asserts the run is not empty.
      await expect(
        page.locator(`[data-cms-section="${section}"]`).first(),
        `${route} renders no element marked "${section}" — the section preview would fall back to the whole page`,
      ).toBeAttached();
    }
  });
}

test("blocks the panel lists but the page does not render stay absent", async ({ page }) => {
  for (const { route, section, because } of NOT_RENDERED) {
    await page.goto(route);
    await expect(
      page.locator(`[data-cms-section="${section}"]`),
      `${route} now renders "${section}" (${because}) — give it an anchor and move it into ANCHORED`,
    ).toHaveCount(0);
  }
});
