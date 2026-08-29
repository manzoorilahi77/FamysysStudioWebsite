import { describe, expect, it } from "vitest";
import { StaticMarketingContentRepository } from "./StaticMarketingContentRepository";

describe("StaticMarketingContentRepository", () => {
  it("returns hero content with a media reference", async () => {
    const repository = new StaticMarketingContentRepository();

    const hero = await repository.getHero();

    expect(hero.headlineLines.length).toBeGreaterThanOrEqual(1);
    expect(hero.media.kind).toBe("video");
    expect(hero.media.poster).toBeDefined();
  });

  it("returns a manifesto block", async () => {
    const repository = new StaticMarketingContentRepository();

    const manifesto = await repository.getManifesto();

    expect(manifesto.statementLines.length).toBeGreaterThanOrEqual(2);
  });

  it("returns exactly 3 value pillars", async () => {
    const repository = new StaticMarketingContentRepository();

    const pillars = await repository.getValuePillars();

    expect(pillars).toHaveLength(3);
    expect(pillars.map((p) => p.title)).toEqual([
      "Studio-grade craft",
      "Built for volume",
      "One team, end to end",
    ]);
  });

  it("returns a pillars section intro", async () => {
    const repository = new StaticMarketingContentRepository();

    const intro = await repository.getPillarsIntro();

    expect(intro.eyebrow.length).toBeGreaterThan(0);
    expect(intro.heading.length).toBeGreaterThan(0);
  });

  it("returns a marquee eyebrow", async () => {
    const repository = new StaticMarketingContentRepository();

    const eyebrow = await repository.getMarqueeEyebrow();

    expect(eyebrow.length).toBeGreaterThan(0);
  });

  it("returns a positioning block with a tall video media reference", async () => {
    const repository = new StaticMarketingContentRepository();

    const positioning = await repository.getPositioning();

    expect(positioning.media.kind).toBe("video");
    expect(positioning.media.aspectRatio).toBe("3:4");
    expect(positioning.media.poster).toBeDefined();
  });

  it("returns a metrics section intro", async () => {
    const repository = new StaticMarketingContentRepository();

    const intro = await repository.getMetricsIntro();

    expect(intro.eyebrow.length).toBeGreaterThan(0);
    expect(intro.heading.length).toBeGreaterThan(0);
  });

  it("returns a services section intro", async () => {
    const repository = new StaticMarketingContentRepository();

    const intro = await repository.getServicesIntro();

    expect(intro.eyebrow.length).toBeGreaterThan(0);
    expect(intro.heading.length).toBeGreaterThan(0);
  });

  it("returns a work section with an intro and explore CTA", async () => {
    const repository = new StaticMarketingContentRepository();

    const work = await repository.getWorkSection();

    expect(work.intro.heading.length).toBeGreaterThan(0);
    expect(work.exploreCta.label.value.length).toBeGreaterThan(0);
  });

  it("returns a comparison section intro", async () => {
    const repository = new StaticMarketingContentRepository();

    const intro = await repository.getComparisonIntro();

    expect(intro.eyebrow.length).toBeGreaterThan(0);
    expect(intro.heading.length).toBeGreaterThan(0);
  });

  it("returns a testimonials section intro", async () => {
    const repository = new StaticMarketingContentRepository();

    const intro = await repository.getTestimonialsIntro();

    expect(intro.eyebrow.length).toBeGreaterThan(0);
    expect(intro.heading.length).toBeGreaterThan(0);
  });

  it("returns exactly 4 process steps", async () => {
    const repository = new StaticMarketingContentRepository();

    const process = await repository.getProcessBlock();

    expect(process.steps).toHaveLength(4);
    expect(process.steps.map((step) => step.title)).toEqual(["Brief", "Build", "Review", "Deliver"]);
  });

  it("returns exactly 4 differentiators", async () => {
    const repository = new StaticMarketingContentRepository();

    const differentiators = await repository.getDifferentiatorsBlock();

    expect(differentiators.items).toHaveLength(4);
  });

  it("returns a talent block with exactly 9 tiles", async () => {
    const repository = new StaticMarketingContentRepository();

    const talent = await repository.getTalentBlock();

    expect(talent.tiles).toHaveLength(9);
    expect(talent.tiles.every((tile) => tile.aspectRatio === "1:1")).toBe(true);
  });

  it("returns a closing CTA block", async () => {
    const repository = new StaticMarketingContentRepository();

    const cta = await repository.getClosingCta();

    expect(cta.headlineLines.length).toBeGreaterThanOrEqual(1);
    expect(cta.supportingParagraph.length).toBeGreaterThan(0);
  });

  it("returns footer content with legal and social links", async () => {
    const repository = new StaticMarketingContentRepository();

    const footer = await repository.getFooterContent();

    expect(footer.legalLinks.length).toBeGreaterThanOrEqual(2);
    expect(footer.socialLinks.length).toBeGreaterThan(0);
  });
});
