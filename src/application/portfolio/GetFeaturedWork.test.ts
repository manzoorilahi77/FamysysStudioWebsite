import { describe, expect, it } from "vitest";
import { MediaRef } from "../../domain/shared/value-objects/MediaRef";
import { Slug } from "../../domain/shared/value-objects/Slug";
import type { CaseStudy } from "../../domain/portfolio/entities/CaseStudy";
import type { ShowreelClip } from "../../domain/portfolio/entities/ShowreelClip";
import { FakePortfolioRepository } from "./__fakes__/FakePortfolioRepository";
import { GetFeaturedWork } from "./GetFeaturedWork";

function fixtureStories(): ReadonlyArray<ShowreelClip> {
  return [
    {
      client: "Northwind Logistics",
      quote: "They cut through eighteen months of scope in a single sprint.",
      media: MediaRef.create({
        kind: "video",
        src: "/media/story-01.mp4",
        poster: "/media/story-01-poster.svg",
        alt: "Northwind Logistics case study loop",
        aspectRatio: "16:9",
      }),
    },
  ];
}

function fixtureCaseStudies(): ReadonlyArray<CaseStudy> {
  return [
    {
      slug: Slug.create("core-platform-modernisation"),
      client: "Acme Bank",
      title: "Core platform modernisation",
      tags: [{ label: "Motion graphics" }],
      media: MediaRef.create({
        kind: "image",
        src: "/media/case-01.svg",
        alt: "Core platform modernisation placeholder",
        aspectRatio: "4:3",
      }),
    },
  ];
}

describe("GetFeaturedWork", () => {
  it("composes stories and case studies from the repository", async () => {
    const stories = fixtureStories();
    const caseStudies = fixtureCaseStudies();
    const repository = new FakePortfolioRepository(stories, caseStudies);
    const useCase = new GetFeaturedWork(repository);

    const result = await useCase.execute();

    expect(result.stories).toBe(stories);
    expect(result.caseStudies).toBe(caseStudies);
    expect(repository.storiesCalls).toBe(1);
    expect(repository.caseStudiesCalls).toBe(1);
  });

  it("propagates a repository failure", async () => {
    const repository = new FakePortfolioRepository(fixtureStories(), fixtureCaseStudies());
    repository.error = new Error("portfolio source unavailable");
    const useCase = new GetFeaturedWork(repository);

    await expect(useCase.execute()).rejects.toThrow("portfolio source unavailable");
  });
});
