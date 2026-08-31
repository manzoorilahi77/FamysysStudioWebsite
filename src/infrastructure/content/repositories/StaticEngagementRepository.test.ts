import { describe, expect, it } from "vitest";
import { TIER_FIELD_LABELS, faqBlock, waysToWorkBlock } from "../static/marketing.content";
import { caseStudies } from "../static/portfolio.content";
import { capabilities } from "../static/services.content";
import { joinListSentence, waysToWorkPage } from "../static/ways-to-work.content";
import { StaticEngagementRepository } from "./StaticEngagementRepository";

const TIER_NAMES = ["Launch", "Grow", "Scale"];

/**
 * Every string the client has approved, from all three of their content modules. Used to
 * separate approved copy from copy this page drafted — the same rule the docs generator
 * applies, asserted here rather than only reported.
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
    for (const child of Object.values(node)) {
      collectStrings(child, out);
    }
  }
  return out;
}

const APPROVED = new Set(
  collectStrings([waysToWorkBlock, faqBlock, TIER_FIELD_LABELS, caseStudies, capabilities]),
);

function draftedStrings(): ReadonlyArray<string> {
  return collectStrings(waysToWorkPage).filter((text) => !APPROVED.has(text));
}

describe("StaticEngagementRepository — Ways to Work With Us page", () => {
  // The whole point of the content file's structure: the expanded copy is drafted, but
  // every string the brief supplies is read from the homepage's block rather than
  // retyped beside it. If someone ever inlines a literal, this is the test that catches it.
  it("carries the approved tier names, labels, summaries and both lists through unchanged", async () => {
    const page = await new StaticEngagementRepository().getWaysToWorkPage();

    expect(page.tiers.map((tier) => tier.name)).toEqual(TIER_NAMES);
    expect(page.tiers.map((tier) => tier.name)).toEqual(waysToWorkBlock.tiers.map((t) => t.name));
    expect(page.tiers.map((tier) => tier.descriptor)).toEqual(
      waysToWorkBlock.tiers.map((tier) => tier.descriptor),
    );
    expect(page.tiers.map((tier) => tier.summary)).toEqual(
      waysToWorkBlock.tiers.map((tier) => tier.summary),
    );
    expect(page.tiers.map((tier) => tier.idealFor)).toEqual(
      waysToWorkBlock.tiers.map((tier) => tier.idealFor),
    );
    expect(page.tiers.map((tier) => tier.typicalWork)).toEqual(
      waysToWorkBlock.tiers.map((tier) => tier.typicalWork),
    );
  });

  it("carries the approved custom partnership through unchanged", async () => {
    const page = await new StaticEngagementRepository().getWaysToWorkPage();

    expect(page.custom.name).toBe(waysToWorkBlock.custom.name);
    expect(page.custom.descriptor).toBe(waysToWorkBlock.custom.descriptor);
    expect(page.custom.summary).toBe(waysToWorkBlock.custom.summary);
    expect(page.custom.invitation).toBe(waysToWorkBlock.custom.invitation);
  });

  it("takes the hero heading and intro from the brief rather than restating them", async () => {
    const page = await new StaticEngagementRepository().getWaysToWorkPage();

    expect(page.hero.heading).toBe(waysToWorkBlock.heading);
    expect(page.hero.body).toBe(waysToWorkBlock.body);
  });

  it("labels the two approved comparison rows with the brief's own field names", async () => {
    const page = await new StaticEngagementRepository().getWaysToWorkPage();

    expect(page.comparison.rowLabels.idealFor).toBe(TIER_FIELD_LABELS.idealFor);
    expect(page.comparison.rowLabels.typicalWork).toBe(TIER_FIELD_LABELS.typicalWork);
  });

  // The lists are rendered as lists, but they are the SAME approved sentence split up.
  // Re-joining has to reproduce the client's string exactly, or the page has quietly
  // reworded them.
  it("splits both approved lists without changing a character", async () => {
    const page = await new StaticEngagementRepository().getWaysToWorkPage();

    for (const tier of page.tiers) {
      expect(joinListSentence(tier.idealForItems)).toBe(tier.idealFor);
      expect(joinListSentence(tier.typicalWorkItems)).toBe(tier.typicalWork);
      expect(tier.idealForItems.length).toBeGreaterThan(1);
      expect(tier.typicalWorkItems.length).toBeGreaterThan(1);
      expect(tier.idealForItems.every((item) => item.trim().length > 0)).toBe(true);
      expect(tier.typicalWorkItems.every((item) => item.trim().length > 0)).toBe(true);
    }
  });

  it("slugs every tier, uniquely, for the how-to-choose anchors", async () => {
    const page = await new StaticEngagementRepository().getWaysToWorkPage();

    const slugs = [...page.tiers.map((tier) => tier.slug.value), page.custom.slug.value];
    expect(slugs).toEqual(["launch", "grow", "scale", "custom-creative-partnership"]);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("points every how-to-choose answer at a tier that exists on the page", async () => {
    const page = await new StaticEngagementRepository().getWaysToWorkPage();

    const known = new Map(
      [...page.tiers, page.custom].map((tier) => [tier.slug.value, tier.name] as const),
    );
    expect(page.howToChoose.questions.length).toBeGreaterThanOrEqual(3);
    for (const question of page.howToChoose.questions) {
      expect(known.get(question.tierSlug)).toBe(question.tierName);
    }
    // Every tier is reachable from the chooser, or a reader can be left with no answer.
    const pointed = new Set(page.howToChoose.questions.map((q) => q.tierSlug));
    expect([...known.keys()].every((slug) => pointed.has(slug))).toBe(true);
  });

  it("gives every tier expanded copy, both comparison rows and an image with alt text", async () => {
    const page = await new StaticEngagementRepository().getWaysToWorkPage();

    for (const tier of [...page.tiers, page.custom]) {
      expect(tier.expandedCopy.trim().length).toBeGreaterThan(0);
      expect(tier.media.alt.trim().length).toBeGreaterThan(0);
      expect(tier.media.src.value).toMatch(/^\/media\/[a-z0-9-]+\.jpg$/);
    }
    for (const tier of page.tiers) {
      expect(tier.bestWhen.trim().length).toBeGreaterThan(0);
      expect(tier.engagementShape.trim().length).toBeGreaterThan(0);
    }
  });

  it("reuses two of the brief's FAQ answers verbatim and adds two", async () => {
    const page = await new StaticEngagementRepository().getWaysToWorkPage();

    const items = page.faq.block.items;
    expect(items).toHaveLength(4);

    const briefQuestions = new Set(faqBlock.items.map((item) => item.question));
    const reused = items.filter((item) => briefQuestions.has(item.question));
    expect(reused.map((item) => item.question)).toEqual([
      "How much do your services cost?",
      "Do you offer ongoing monthly support?",
    ]);
    for (const item of reused) {
      const original = faqBlock.items.find((candidate) => candidate.question === item.question);
      expect(item.answer).toBe(original?.answer);
    }
  });

  // The strongest constraint on this page. The brief forbids public pricing, and this is
  // the page a reader arrives at looking for it — so no string WE wrote may mention it.
  // The client's own answer about custom quotations is imported, and is the only place
  // the subject appears at all.
  it("puts no price, pricing or cost in any drafted string", async () => {
    const drafted = draftedStrings();

    expect(drafted.length).toBeGreaterThan(20);
    const offenders = drafted.filter((text) => /\bpric(e|es|ed|ing)\b|\bcosts?\b/i.test(text));
    expect(offenders).toEqual([]);
  });

  it("carries no figure, range or rate anywhere on the page", async () => {
    const page = await new StaticEngagementRepository().getWaysToWorkPage();

    const everyString = JSON.stringify(page);

    expect(everyString).not.toMatch(/[$£€]\s?\d/);
    expect(everyString).not.toMatch(/\bstarting (from|at)\b/i);
    expect(everyString).not.toMatch(/\bday rate\b|\bhourly\b|\bper (hour|day|asset|video)\b/i);
    expect(everyString).not.toMatch(/\bfrom \d/i);
  });

  // Turnarounds, revision counts, minimum terms and notice periods are commitments the
  // brief never made. The scoping block in particular is where one would slip in.
  it("states no duration or minimum term in the scoping block", async () => {
    const page = await new StaticEngagementRepository().getWaysToWorkPage();

    const scoping = JSON.stringify(page.scoping);

    expect(scoping).not.toMatch(/\b\d+\s*(hour|day|week|month|working day)/i);
    expect(scoping).not.toMatch(
      /\b(within|inside|under)\s+(a|an|one|two|three|four|five|\d+)\s+(hour|day|week|month|business day|working day)/i,
    );
    expect(scoping).not.toMatch(
      /\bsame[- ]day\b|\bturnaround\b|\bminimum term\b|\bnotice period\b/i,
    );
  });

  it("keeps the comparison free of feature gating", async () => {
    const page = await new StaticEngagementRepository().getWaysToWorkPage();

    // Four rows, every one of which says what a tier IS. A row that named an absence
    // would turn a fit-finder into a price ladder without a single figure on it.
    const labels = Object.values(page.comparison.rowLabels);
    expect(labels).toHaveLength(4);
    expect(new Set(labels).size).toBe(4);
    expect(page.comparison.caption.trim().length).toBeGreaterThan(0);

    const cells = page.tiers.flatMap((tier) => [
      tier.idealFor,
      tier.typicalWork,
      tier.bestWhen,
      tier.engagementShape,
    ]);
    for (const cell of cells) {
      expect(cell).not.toMatch(/\bnot included\b|\bunavailable\b|\bexcluded\b|\bupgrade to\b/i);
    }
  });
});
