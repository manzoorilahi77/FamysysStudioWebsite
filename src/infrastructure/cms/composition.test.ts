import { describe, expect, it } from "vitest";
import { PAGE_SOURCE, SECTION_OF, orderSections, readComposition } from "./composition";
import { toRecord } from "./records";

/**
 * The sidebar's order comes from the route files, so these read the real ones. A test with a
 * fixture page would prove the parser works and nothing about whether the panel agrees with
 * the site, which is the only question worth asking here.
 */

describe("reading a page's composition", () => {
  it("returns the homepage's blocks in the order the page renders them", () => {
    expect(readComposition("home")).toEqual([
      "Hero",
      "WhatWeDo",
      "Differentiator",
      "HowWeWorkFrames",
      "WaysToWorkTiles",
      "SelectedWorkCovers",
      "FinalCta",
      "Footer",
    ]);
  });

  it("reads every one of the seven routes", () => {
    for (const pageId of Object.keys(PAGE_SOURCE)) {
      expect(readComposition(pageId), pageId).not.toBeNull();
      expect(readComposition(pageId)?.length ?? 0, pageId).toBeGreaterThan(1);
    }
  });

  it("never lists the header, which is generated from the routes rather than written", () => {
    for (const pageId of Object.keys(PAGE_SOURCE)) {
      expect(readComposition(pageId), pageId).not.toContain("Header");
    }
  });

  it("returns null for something that is not one of the seven pages", () => {
    expect(readComposition("blog")).toBeNull();
  });

  // If this fails, a component was renamed or removed and the panel would show it as an
  // unmapped block. That is the correct BEHAVIOUR, and this is the reminder to finish the job.
  it("has a section mapped for every component the seven pages render", () => {
    const unmapped = Object.keys(PAGE_SOURCE).flatMap((pageId) =>
      (readComposition(pageId) ?? [])
        .filter((component) => component !== "Footer")
        .filter((component) => !(SECTION_OF[pageId] ?? {})[component])
        .map((component) => `${pageId}: ${component}`),
    );

    expect(unmapped).toEqual([]);
  });
});

describe("ordering the declared sections", () => {
  const declared = ["closing-cta", "hero", "why-famysys", "footer", "what-we-do"].map((id) =>
    toRecord({ id, title: id, summary: "", updatedAt: null }),
  );

  it("puts them in the page's order rather than the order they were declared in", () => {
    const ordered = orderSections("home", declared);

    expect(ordered.derived).toBe(true);
    expect(ordered.sections.slice(0, 4).map((section) => section.id)).toEqual([
      "hero",
      "what-we-do",
      "closing-cta",
      "footer",
    ]);
  });

  it("keeps a section the page no longer renders, and marks it rather than dropping it", () => {
    const ordered = orderSections("home", declared);
    const last = ordered.sections.at(-1);

    // WhyFamysys is off the homepage at the client's direction. Its content is still here.
    expect(last?.id).toBe("why-famysys");
    expect(last?.note).toContain("does not currently render it");
  });

  it("falls back to the declared order, and says so, when the source cannot be read", () => {
    const ordered = orderSections("blog", declared);

    expect(ordered.derived).toBe(false);
    expect(ordered.sections).toEqual(declared);
  });
});
