import { describe, expect, it } from "vitest";
import { StaticMarketingContentRepository } from "./StaticMarketingContentRepository";

describe("StaticMarketingContentRepository", () => {
  it("returns hero content with a media reference", async () => {
    const repository = new StaticMarketingContentRepository();

    const hero = await repository.getHero();

    expect(hero.headlineLines.length).toBeGreaterThanOrEqual(2);
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
});
