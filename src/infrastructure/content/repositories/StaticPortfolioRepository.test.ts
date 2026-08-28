import { describe, expect, it } from "vitest";
import { StaticPortfolioRepository } from "./StaticPortfolioRepository";

describe("StaticPortfolioRepository", () => {
  it("returns exactly 2 featured stories", async () => {
    const repository = new StaticPortfolioRepository();

    const stories = await repository.getFeaturedStories();

    expect(stories).toHaveLength(2);
    expect(stories.every((story) => story.media.kind === "video")).toBe(true);
  });

  it("returns exactly 6 case studies, each with a unique slug", async () => {
    const repository = new StaticPortfolioRepository();

    const caseStudies = await repository.getCaseStudies();
    const slugs = new Set(caseStudies.map((study) => study.slug.value));

    expect(caseStudies).toHaveLength(6);
    expect(slugs.size).toBe(6);
  });
});
