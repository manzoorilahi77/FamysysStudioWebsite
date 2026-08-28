import { describe, expect, it } from "vitest";
import { createCta } from "../../domain/shared/value-objects/Cta";
import { MediaRef } from "../../domain/shared/value-objects/MediaRef";
import type { HeroContent } from "../../domain/marketing/entities/HeroContent";
import type { ManifestoBlock } from "../../domain/marketing/entities/ManifestoBlock";
import type { ValuePillar } from "../../domain/marketing/entities/ValuePillar";
import { FakeMarketingContentRepository } from "./__fakes__/FakeMarketingContentRepository";
import { GetHomepageContent } from "./GetHomepageContent";

function fixtureHero(): HeroContent {
  return {
    eyebrow: "Famysys Studio",
    headlineLines: ["Craft that ships", "at studio pace."],
    subhead: "Video design and creative production built for volume.",
    primaryCta: createCta("Book a call", "/contact"),
    secondaryCta: createCta("See the reel", "/work"),
    media: MediaRef.create({
      kind: "video",
      src: "/media/hero-loop.mp4",
      poster: "/media/hero-loop-poster.svg",
      alt: "Looping gradient reel",
      aspectRatio: "16:9",
    }),
  };
}

function fixtureManifesto(): ManifestoBlock {
  return {
    eyebrow: "What we believe",
    statementLines: ["Craft is not a phase.", "It is the whole process."],
    supportingParagraph: "Every deliverable gets the same bar, regardless of volume.",
    cta: createCta("Read our approach", "/about"),
  };
}

function fixturePillars(): ReadonlyArray<ValuePillar> {
  return [
    { title: "Studio-grade craft", description: "Senior editors on every cut." },
    { title: "Built for volume", description: "Parallel pipelines, not a single bottleneck." },
    { title: "One team, end to end", description: "No handoffs between strategy and delivery." },
  ];
}

describe("GetHomepageContent", () => {
  it("composes hero, manifesto, and pillars from the repository", async () => {
    const hero = fixtureHero();
    const manifesto = fixtureManifesto();
    const pillars = fixturePillars();
    const repository = new FakeMarketingContentRepository(hero, manifesto, pillars);
    const useCase = new GetHomepageContent(repository);

    const result = await useCase.execute();

    expect(result.hero).toBe(hero);
    expect(result.manifesto).toBe(manifesto);
    expect(result.pillars).toBe(pillars);
    expect(repository.heroCalls).toBe(1);
    expect(repository.manifestoCalls).toBe(1);
    expect(repository.pillarsCalls).toBe(1);
  });

  it("propagates a repository failure", async () => {
    const repository = new FakeMarketingContentRepository(
      fixtureHero(),
      fixtureManifesto(),
      fixturePillars(),
    );
    repository.error = new Error("content source unavailable");
    const useCase = new GetHomepageContent(repository);

    await expect(useCase.execute()).rejects.toThrow("content source unavailable");
  });
});
