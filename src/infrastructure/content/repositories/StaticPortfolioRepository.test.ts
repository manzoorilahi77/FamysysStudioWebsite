import { describe, expect, it } from "vitest";
import { workIntro } from "../static/marketing.content";
import { caseStudies } from "../static/portfolio.content";
import { selectedWorkPage } from "../static/selected-work.content";
import { capabilities } from "../static/services.content";
import { slugifyTitle } from "../static/slugify";
import { StaticPortfolioRepository } from "./StaticPortfolioRepository";

/**
 * Keys holding a route, file path, enum or derived identifier rather than reviewable
 * copy. Mirrors `NON_COPY_KEYS` in scripts/generate-content-todo.mjs, so the rules
 * asserted here and the inventory published in docs/content-todo.md are drawn over the
 * same set of strings. `aspectRatio` is the one that matters most: "3:4" is a machine
 * value, and a rule that forbids digits in the page's prose must not read it as prose.
 */
const NON_COPY_KEYS = new Set([
  "href",
  "src",
  "poster",
  "kind",
  "aspectRatio",
  "slug",
  "pieceSlugs",
]);

/**
 * Every string reachable from a value, so a rule can be asserted over the whole page
 * rather than over the fields someone remembered to check.
 */
function collectStrings(node: unknown, out: string[] = []): string[] {
  if (node && typeof node === "object" && "value" in node) {
    const inner = (node as { value: unknown }).value;
    if (typeof inner === "string") {
      out.push(inner);
      return out;
    }
  }
  if (typeof node === "string") {
    out.push(node);
    return out;
  }
  if (Array.isArray(node)) {
    for (const element of node) {
      collectStrings(element, out);
    }
    return out;
  }
  if (node && typeof node === "object") {
    for (const [key, child] of Object.entries(node)) {
      if (NON_COPY_KEYS.has(key)) {
        continue;
      }
      collectStrings(child, out);
    }
  }
  return out;
}

const APPROVED = new Set(collectStrings([workIntro, caseStudies, capabilities]));

function draftedStrings(): ReadonlyArray<string> {
  return collectStrings(selectedWorkPage).filter((text) => !APPROVED.has(text));
}

describe("StaticPortfolioRepository — Selected Work page", () => {
  it("still returns the eight case studies for the homepage", async () => {
    const result = await new StaticPortfolioRepository().getCaseStudies();

    expect(result).toBe(caseStudies);
  });

  // The whole point of the content file's structure: the expanded copy is drafted, but
  // every string the brief supplies is read from the portfolio rather than retyped
  // beside it. If someone inlines a literal title or intent line, this catches it.
  it("carries the approved titles, intent lines and references through unchanged", async () => {
    const page = await new StaticPortfolioRepository().getSelectedWorkPage();

    expect(page.pieces).toHaveLength(8);
    expect(page.pieces.map((piece) => piece.title)).toEqual(caseStudies.map((p) => p.title));
    expect(page.pieces.map((piece) => piece.description)).toEqual(
      caseStudies.map((piece) => piece.description),
    );
    expect(page.pieces.map((piece) => piece.reference)).toEqual(
      caseStudies.map((piece) => piece.reference),
    );
    expect(page.pieces.map((piece) => piece.slug.value)).toEqual(
      caseStudies.map((piece) => piece.slug.value),
    );
  });

  it("takes the hero heading and intro from the brief rather than restating them", async () => {
    const page = await new StaticPortfolioRepository().getSelectedWorkPage();

    expect(page.hero.heading).toBe(workIntro.heading);
    expect(page.hero.body).toBe(workIntro.body);
  });

  // The filter taxonomy is not invented: it IS the capability list. A chip whose name is
  // not one of the client's six would be a taxonomy this page made up for itself.
  it("derives every category from the six capabilities, with counts from the pieces", async () => {
    const page = await new StaticPortfolioRepository().getSelectedWorkPage();

    const approvedNames = capabilities.map((offering) => offering.title);
    for (const category of page.filter.categories) {
      expect(approvedNames).toContain(category.title);
      const actual = page.pieces.filter((piece) =>
        piece.capabilities.some((capability) => capability.title === category.title),
      ).length;
      expect(category.count).toBe(actual);
      expect(category.count).toBeGreaterThan(0);
    }
    // Every capability is exercised by something, or the cross-link section points at a
    // page section the work below never illustrates.
    expect(page.filter.categories.map((category) => category.title).sort()).toEqual(
      [...approvedNames].sort(),
    );
  });

  it("points every capability reference at a real /creative-services fragment", async () => {
    const page = await new StaticPortfolioRepository().getSelectedWorkPage();

    const valid = new Set(
      capabilities.map((offering) => `/creative-services#${slugifyTitle(offering.title)}`),
    );
    const references = [
      ...page.pieces.flatMap((piece) => piece.capabilities),
      ...page.capabilityCrossLink.links,
    ];
    expect(references.length).toBeGreaterThan(0);
    for (const reference of references) {
      expect(valid.has(reference.href)).toBe(true);
      expect(reference.href).toBe(`/creative-services#${slugifyTitle(reference.title)}`);
    }
    expect(page.capabilityCrossLink.links).toHaveLength(6);
  });

  it("gives every piece expanded copy, at least one capability and an image with alt text", async () => {
    const page = await new StaticPortfolioRepository().getSelectedWorkPage();

    for (const piece of page.pieces) {
      expect(piece.demonstrates.trim().length).toBeGreaterThan(0);
      expect(piece.whyThisPiece.trim().length).toBeGreaterThan(0);
      expect(piece.capabilities.length).toBeGreaterThan(0);
      expect(piece.media.alt.trim().length).toBeGreaterThan(0);
      expect(piece.media.src.value).toMatch(/^\/media\/work-[a-z-]+\.jpg$/);
    }
    // Eight distinct covers — a shared file would make two planned pieces look like one.
    const covers = page.pieces.map((piece) => piece.media.src.value);
    expect(new Set(covers).size).toBe(8);
  });

  it("names every piece in the progression exactly once, in the brief's order", async () => {
    const page = await new StaticPortfolioRepository().getSelectedWorkPage();

    const staged = page.progression.stages.flatMap((stage) => stage.pieceSlugs);
    expect(staged).toEqual(page.pieces.map((piece) => piece.slug.value));
  });

  it("keeps the honest framing block on the page rather than in a comment", async () => {
    const page = await new StaticPortfolioRepository().getSelectedWorkPage();

    expect(page.framing.paragraphs.length).toBeGreaterThanOrEqual(2);
    const framing = page.framing.paragraphs.join(" ");
    // It has to actually say the work does not exist, in visible copy.
    expect(framing).toMatch(
      /none of them is finished|does not exist|not (yet )?(been )?(made|produced)/i,
    );
    // "Coming soon" is the wording the brief rules out, everywhere on the page.
    expect(collectStrings(selectedWorkPage).join(" ")).not.toMatch(/coming soon/i);
  });

  it("uses one status wording, and uses it on every piece", async () => {
    const page = await new StaticPortfolioRepository().getSelectedWorkPage();

    expect(page.statusLabel.trim().length).toBeGreaterThan(0);
    expect(page.statusExplanation).toMatch(/planned|does not exist|stock/i);
    // The label is a page-level string precisely so it cannot be worded twice. If a
    // per-piece status field ever appears, this test is the place to notice.
    expect(Object.keys(page.pieces[0] ?? {})).not.toContain("status");
  });

  // THE constraint on this page. Nothing here has been produced, so any string that
  // reads like a record of delivered work is a lie, not a stylistic problem.
  it("invents no client, metric, date, duration or result", async () => {
    const drafted = draftedStrings();

    expect(drafted.length).toBeGreaterThan(20);
    const everything = drafted.join("\n");

    // No figures at all — a metric, a date, a duration and a budget are all digits.
    expect(everything).not.toMatch(/\d/);
    // No results or outcome claims.
    expect(everything).not.toMatch(
      /\b(increased?|boosted|grew|growth of|uplift|conversion rate|ROI|return on investment|resulted in|delivered for|award(ed|s)?|winner|shortlisted|featured in)\b/i,
    );
    // No attribution to a client or brand.
    expect(everything).not.toMatch(
      /\b(commissioned by|on behalf of|in partnership with|our client|the client said|testimonial)\b/i,
    );
    // No view counts, audiences or engagement language dressed up as words.
    expect(everything).not.toMatch(
      /\b(views|impressions|followers|subscribers|engagement rate|click-through)\b/i,
    );
  });

  it("makes no operational promise", async () => {
    const everything = draftedStrings().join("\n");

    expect(everything).not.toMatch(
      /\bturnaround\b|\bminimum term\b|\bnotice period\b|\brevision(s| round)\b|\bguarantee(d|s)?\b|\bsame[- ]day\b/i,
    );
  });
});
