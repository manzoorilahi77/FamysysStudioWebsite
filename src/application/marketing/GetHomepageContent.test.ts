import { describe, expect, it } from "vitest";
import { createCta } from "../../domain/shared/value-objects/Cta";
import { MediaRef } from "../../domain/shared/value-objects/MediaRef";
import type { HeroContent } from "../../domain/marketing/entities/HeroContent";
import type { ManifestoBlock } from "../../domain/marketing/entities/ManifestoBlock";
import type { PositioningBlock } from "../../domain/marketing/entities/PositioningBlock";
import type { SectionIntro } from "../../domain/marketing/entities/SectionIntro";
import type { ValuePillar } from "../../domain/marketing/entities/ValuePillar";
import {
  FakeMarketingContentRepository,
  type FakeMarketingContentFixtures,
} from "./__fakes__/FakeMarketingContentRepository";
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

function fixtureIntro(label: string): SectionIntro {
  return { eyebrow: label, heading: `${label} heading` };
}

function fixturePositioning(): PositioningBlock {
  return {
    eyebrow: "Where we sit",
    heading: "Studio discipline, agency reach.",
    supportingParagraph: "We run like an engineering team and pitch like a creative one.",
    media: MediaRef.create({
      kind: "video",
      src: "/media/positioning.mp4",
      poster: "/media/positioning-poster.svg",
      alt: "Placeholder reel illustrating studio positioning",
      aspectRatio: "3:4",
    }),
  };
}

function fixtures(): FakeMarketingContentFixtures {
  return {
    hero: fixtureHero(),
    manifesto: fixtureManifesto(),
    pillars: fixturePillars(),
    pillarsIntro: fixtureIntro("How we're built"),
    marqueeEyebrow: "Trusted by teams shipping every week",
    positioning: fixturePositioning(),
    metricsIntro: fixtureIntro("Success in numbers"),
  };
}

describe("GetHomepageContent", () => {
  it("composes every marketing content block from the repository", async () => {
    const data = fixtures();
    const repository = new FakeMarketingContentRepository(data);
    const useCase = new GetHomepageContent(repository);

    const result = await useCase.execute();

    expect(result.hero).toBe(data.hero);
    expect(result.manifesto).toBe(data.manifesto);
    expect(result.pillars).toBe(data.pillars);
    expect(result.pillarsIntro).toBe(data.pillarsIntro);
    expect(result.marqueeEyebrow).toBe(data.marqueeEyebrow);
    expect(result.positioning).toBe(data.positioning);
    expect(result.metricsIntro).toBe(data.metricsIntro);

    for (const count of Object.values(repository.callCounts)) {
      expect(count).toBe(1);
    }
  });

  it("propagates a repository failure", async () => {
    const repository = new FakeMarketingContentRepository(fixtures());
    repository.error = new Error("content source unavailable");
    const useCase = new GetHomepageContent(repository);

    await expect(useCase.execute()).rejects.toThrow("content source unavailable");
  });
});
