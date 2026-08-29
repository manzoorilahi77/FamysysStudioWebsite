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

});
