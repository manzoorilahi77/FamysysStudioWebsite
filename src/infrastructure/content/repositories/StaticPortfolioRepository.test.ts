import { describe, expect, it } from "vitest";
import { StaticPortfolioRepository } from "./StaticPortfolioRepository";

describe("StaticPortfolioRepository", () => {
  it("returns the 8 planned pieces, each with a unique slug", async () => {
    const repository = new StaticPortfolioRepository();

    const caseStudies = await repository.getCaseStudies();
    const slugs = new Set(caseStudies.map((study) => study.slug.value));

    expect(caseStudies).toHaveLength(8);
    expect(slugs.size).toBe(8);
  });

  it("numbers every piece 01-08 to match the brief's list", async () => {
    const repository = new StaticPortfolioRepository();

    const caseStudies = await repository.getCaseStudies();

    expect(caseStudies.map((study) => study.reference)).toEqual([
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
    ]);
  });

  it("gives every piece a title and a description", async () => {
    const repository = new StaticPortfolioRepository();

    const caseStudies = await repository.getCaseStudies();

    expect(caseStudies.every((study) => study.title.trim().length > 0)).toBe(true);
    expect(caseStudies.every((study) => study.description.trim().length > 0)).toBe(true);
  });
});
