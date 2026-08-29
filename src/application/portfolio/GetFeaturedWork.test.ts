import { describe, expect, it } from "vitest";
import { MediaRef } from "../../domain/shared/value-objects/MediaRef";
import { Slug } from "../../domain/shared/value-objects/Slug";
import type { CaseStudy } from "../../domain/portfolio/entities/CaseStudy";
import { FakePortfolioRepository } from "./__fakes__/FakePortfolioRepository";
import { GetFeaturedWork } from "./GetFeaturedWork";

function fixtureCaseStudies(): ReadonlyArray<CaseStudy> {
  return [
    {
      slug: Slug.create("famysys-studio-capability-film"),
      reference: "01",
      title: "Famysys Studio Capability Film",
      description: "Show what the Studio itself can do.",
      media: MediaRef.create({
        kind: "image",
        src: "/media/case-01.svg",
        alt: "Placeholder artwork",
        aspectRatio: "4:3",
      }),
    },
  ];
}

describe("GetFeaturedWork", () => {
  it("returns the case studies from the repository", async () => {
    const caseStudies = fixtureCaseStudies();
    const repository = new FakePortfolioRepository(caseStudies);
    const useCase = new GetFeaturedWork(repository);

    const result = await useCase.execute();

    expect(result).toBe(caseStudies);
    expect(repository.caseStudiesCalls).toBe(1);
  });

  it("propagates a repository failure", async () => {
    const repository = new FakePortfolioRepository(fixtureCaseStudies());
    repository.error = new Error("portfolio source unavailable");
    const useCase = new GetFeaturedWork(repository);

    await expect(useCase.execute()).rejects.toThrow("portfolio source unavailable");
  });
});
