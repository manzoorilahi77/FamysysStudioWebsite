import { describe, expect, it } from "vitest";
import { faqBlock, processBlock, waysToWorkBlock } from "../static/marketing.content";
import { navigationContent } from "../static/navigation.content";
import { StaticServiceCatalogRepository } from "./StaticServiceCatalogRepository";

const CAPABILITY_TITLES = [
  "Creative Design",
  "Video Production & Editing",
  "AI Video & Virtual Presenters",
  "Explainer & Training Videos",
  "Motion Graphics & Advanced Creative",
  "Product & Brand Visuals",
];

/** The brief's own bound: every block lists five to seven concrete deliverables. */
const MIN_DELIVERABLES = 5;
const MAX_DELIVERABLES = 7;

describe("StaticServiceCatalogRepository", () => {
  it("returns the 6 capabilities from the brief, in order", async () => {
    const repository = new StaticServiceCatalogRepository();

    const capabilities = await repository.getCapabilities();

    expect(capabilities.map((capability) => capability.title)).toEqual(CAPABILITY_TITLES);
  });

  it("gives every capability a non-empty description", async () => {
    const repository = new StaticServiceCatalogRepository();

    const capabilities = await repository.getCapabilities();

    expect(capabilities.every((capability) => capability.description.trim().length > 0)).toBe(true);
  });
});

describe("StaticServiceCatalogRepository — Creative Services page", () => {
  // The whole point of the content file's structure: the expanded copy is drafted, but the
  // approved names and descriptors are read from the catalog rather than retyped beside it.
  // If someone ever inlines a literal title, this is the test that catches it.
  it("carries the approved titles and descriptors through unchanged", async () => {
    const repository = new StaticServiceCatalogRepository();

    const [capabilities, page] = await Promise.all([
      repository.getCapabilities(),
      repository.getCreativeServicesPage(),
    ]);

    expect(page.capabilities.map((detail) => detail.title)).toEqual(CAPABILITY_TITLES);
    expect(page.capabilities.map((detail) => detail.description)).toEqual(
      capabilities.map((capability) => capability.description),
    );
  });

  it("anchors each capability at the fragment the nav already links to", async () => {
    const page = await new StaticServiceCatalogRepository().getCreativeServicesPage();

    const creativeServices = navigationContent.primaryLinks.find(
      (entry) => entry.link.href.value === "/creative-services",
    );
    const navFragments = (creativeServices?.panel.columns ?? [])
      .flatMap((column) => column.items)
      .map((item) => item.href.value);

    expect(navFragments).toHaveLength(page.capabilities.length);
    expect(page.capabilities.map((detail) => `/creative-services#${detail.slug.value}`)).toEqual(
      navFragments,
    );
  });

  it("gives every capability expanded copy, an image with alt text and a CTA", async () => {
    const page = await new StaticServiceCatalogRepository().getCreativeServicesPage();

    for (const detail of page.capabilities) {
      expect(detail.expandedCopy.trim().length).toBeGreaterThan(0);
      expect(detail.media.alt.trim().length).toBeGreaterThan(0);
      expect(detail.media.src.value).toMatch(/^\/media\/[a-z0-9-]+\.jpg$/);
      expect(detail.cta.label.value.length).toBeGreaterThan(0);
    }
  });

  it("lists 5 to 7 deliverables per capability, with no blanks or duplicates", async () => {
    const page = await new StaticServiceCatalogRepository().getCreativeServicesPage();

    for (const detail of page.capabilities) {
      expect(detail.deliverables.length).toBeGreaterThanOrEqual(MIN_DELIVERABLES);
      expect(detail.deliverables.length).toBeLessThanOrEqual(MAX_DELIVERABLES);
      expect(detail.deliverables.every((item) => item.trim().length > 0)).toBe(true);
      expect(new Set(detail.deliverables).size).toBe(detail.deliverables.length);
    }
  });

  it("reuses the homepage's five process steps verbatim", async () => {
    const page = await new StaticServiceCatalogRepository().getCreativeServicesPage();

    expect(page.processPointer.process.steps).toEqual(processBlock.steps);
    // Only the heading is written for this page.
    expect(page.processPointer.process.heading).not.toBe(processBlock.heading);
  });

  it("names every engagement tier, and only summarises them", async () => {
    const page = await new StaticServiceCatalogRepository().getCreativeServicesPage();

    expect(page.engagementPointer.summaries.map((summary) => summary.name)).toEqual([
      ...waysToWorkBlock.tiers.map((tier) => tier.name),
      waysToWorkBlock.custom.name,
    ]);
    // A pointer, not a copy: the tiers' own summaries must not be restated here.
    const lines = page.engagementPointer.summaries.map((summary) => summary.line);
    for (const tier of waysToWorkBlock.tiers) {
      expect(lines).not.toContain(tier.summary);
    }
  });

  it("reuses three of the brief's FAQ answers verbatim and adds one", async () => {
    const page = await new StaticServiceCatalogRepository().getCreativeServicesPage();

    const items = page.faq.block.items;
    expect(items).toHaveLength(4);

    const briefQuestions = new Set(faqBlock.items.map((item) => item.question));
    const reused = items.filter((item) => briefQuestions.has(item.question));
    expect(reused).toHaveLength(3);
    for (const item of reused) {
      const original = faqBlock.items.find((candidate) => candidate.question === item.question);
      expect(item.answer).toBe(original?.answer);
    }
  });

  it("keeps the page free of pricing", async () => {
    const page = await new StaticServiceCatalogRepository().getCreativeServicesPage();

    const everyString = JSON.stringify(page);

    expect(everyString).not.toMatch(/[$£€]\s?\d|\bprice[sd]?\b|\bpricing\b|\bper month\b/i);
  });
});
