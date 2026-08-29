import { describe, expect, it } from "vitest";
import { createCta } from "../../domain/shared/value-objects/Cta";
import { MediaRef } from "../../domain/shared/value-objects/MediaRef";
import type { ClosingCtaBlock } from "../../domain/marketing/entities/ClosingCtaBlock";
import type { FooterContent } from "../../domain/marketing/entities/FooterContent";
import type { HeroContent } from "../../domain/marketing/entities/HeroContent";
import type { ManifestoBlock } from "../../domain/marketing/entities/ManifestoBlock";
import type { PositioningBlock } from "../../domain/marketing/entities/PositioningBlock";
import type { ProcessBlock } from "../../domain/marketing/entities/ProcessBlock";
import type { SectionIntro } from "../../domain/marketing/entities/SectionIntro";
import type { TalentBlock } from "../../domain/marketing/entities/TalentBlock";
import type { ValuePillar } from "../../domain/marketing/entities/ValuePillar";
import type { DifferentiatorsBlock, WorkSection } from "../../domain/marketing/repositories/MarketingContentRepository";
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
    mosaicTiles: Array.from({ length: 8 }, (_, index) =>
      MediaRef.create({
        kind: "image",
        src: `/media/mosaic-${String(index + 1).padStart(2, "0")}.svg`,
        alt: `Placeholder reel still ${index + 1}`,
        aspectRatio: "1:1",
      }),
    ),
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

function fixtureWorkSection(): WorkSection {
  return { intro: fixtureIntro("Selected work"), exploreCta: createCta("Explore all our work", "/work") };
}

function fixtureProcessBlock(): ProcessBlock {
  return {
    eyebrow: "How a project runs",
    heading: "Four steps, every time.",
    steps: [
      { title: "Brief", description: "Scope and schedule locked before a camera is booked." },
      { title: "Build", description: "Production runs against the locked scope." },
      { title: "Review", description: "One structured review pass, not an open-ended thread." },
      { title: "Deliver", description: "Final files land on the date promised at brief." },
    ],
  };
}

function fixtureDifferentiatorsBlock(): DifferentiatorsBlock {
  return {
    intro: fixtureIntro("Why Famysys"),
    items: [
      { title: "One team", description: "Strategy and production sit together." },
      { title: "Fixed scope", description: "Scope is locked before production starts." },
      { title: "Senior editors", description: "The same editor from brief to delivery." },
      { title: "Volume-tested", description: "Built for fifty deliverables a month." },
    ],
  };
}

function fixtureTalentBlock(): TalentBlock {
  return {
    eyebrow: "Who you'll work with",
    heading: "A team, not a roster.",
    supportingParagraph: "Every project runs through a small, senior team you can name.",
    tiles: Array.from({ length: 9 }, (_, index) =>
      MediaRef.create({
        kind: "image",
        src: `/media/talent-${String(index + 1).padStart(2, "0")}.svg`,
        alt: `Placeholder portrait tile ${index + 1}`,
        aspectRatio: "1:1",
      }),
    ),
    roles: Array.from({ length: 9 }, (_, index) => `Role ${index + 1}`),
  };
}

function fixtureClosingCta(): ClosingCtaBlock {
  return {
    headlineLines: ["Let's scope your first brief."],
    supportingParagraph: "Tell us what you need to ship and we'll come back with a fixed plan.",
  };
}

function fixtureFooterContent(): FooterContent {
  return {
    tagline: "Video design and creative production, run like engineering.",
    contactEmail: "hello@famysys.com",
    legalLinks: [createCta("Privacy policy", "/privacy"), createCta("Terms of use", "/terms")],
    socialLinks: [createCta("Twitter", "https://twitter.com/famysysstudio")],
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
    servicesIntro: fixtureIntro("What we make"),
    workSection: fixtureWorkSection(),
    comparisonIntro: fixtureIntro("How we compare"),
    testimonialsIntro: fixtureIntro("What clients say"),
    process: fixtureProcessBlock(),
    differentiators: fixtureDifferentiatorsBlock(),
    talent: fixtureTalentBlock(),
    closingCta: fixtureClosingCta(),
    footer: fixtureFooterContent(),
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
    expect(result.servicesIntro).toBe(data.servicesIntro);
    expect(result.workSection).toBe(data.workSection);
    expect(result.comparisonIntro).toBe(data.comparisonIntro);
    expect(result.testimonialsIntro).toBe(data.testimonialsIntro);
    expect(result.process).toBe(data.process);
    expect(result.differentiators).toBe(data.differentiators);
    expect(result.talent).toBe(data.talent);
    expect(result.closingCta).toBe(data.closingCta);
    expect(result.footer).toBe(data.footer);

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
