import { describe, expect, it } from "vitest";
import { createCta } from "../../domain/shared/value-objects/Cta";
import { MediaRef } from "../../domain/shared/value-objects/MediaRef";
import type { ClosingCtaBlock } from "../../domain/marketing/entities/ClosingCtaBlock";
import type { DifferentiatorBlock } from "../../domain/marketing/entities/DifferentiatorBlock";
import type { FaqBlock } from "../../domain/marketing/entities/FaqBlock";
import type { FooterContent } from "../../domain/marketing/entities/FooterContent";
import type { HeroContent } from "../../domain/marketing/entities/HeroContent";
import type { ProcessBlock } from "../../domain/marketing/entities/ProcessBlock";
import type { SectionIntro } from "../../domain/marketing/entities/SectionIntro";
import type { WaysToWorkBlock } from "../../domain/marketing/entities/EngagementTier";
import type { WhyFamysysBlock } from "../../domain/marketing/entities/WhyFamysysBlock";
import type { WhatWeDoIntro } from "../../domain/marketing/repositories/MarketingContentRepository";
import {
  FakeMarketingContentRepository,
  type FakeMarketingContentFixtures,
} from "./__fakes__/FakeMarketingContentRepository";
import { GetHomepageContent } from "./GetHomepageContent";

function fixtureHero(): HeroContent {
  return {
    heading: "Creative production, without the agency overhead.",
    body: "Design, video, AI-powered content, motion and product visuals.",
    primaryCta: createCta("Start a Conversation", "/contact"),
    secondaryCta: createCta("Explore Our Services", "/creative-services"),
    supportingLine: "Project-based when you need it. Ongoing when you need more.",
    mosaicTiles: Array.from({ length: 8 }, (_, index) =>
      MediaRef.create({
        kind: "image",
        src: `/media/mosaic-${String(index + 1).padStart(2, "0")}.svg`,
        alt: `Placeholder creative still ${index + 1}`,
        aspectRatio: "1:1",
      }),
    ),
  };
}

function fixtureIntro(label: string): SectionIntro {
  return { eyebrow: label, heading: `${label} heading`, body: `${label} body` };
}

function fixtureWhatWeDo(): WhatWeDoIntro {
  return { intro: fixtureIntro("Our capabilities"), cta: createCta("Explore All Services", "/creative-services") };
}

function fixtureMedia(): MediaRef {
  return MediaRef.create({
    kind: "image",
    src: "/media/element-01.jpg",
    alt: "An element image.",
    aspectRatio: "4:3",
  });
}

function fixtureDifferentiator(): DifferentiatorBlock {
  return {
    heading: "The right mix of creativity, technology and people.",
    body: "AI has changed how creative work can be produced.",
    leadIn: "At Famysys Studio, we combine:",
    elements: [
      { title: "Human Creativity", description: "Ideas, storytelling, art direction.", media: fixtureMedia() },
      {
        title: "Intelligent AI Workflows",
        description: "AI used where it genuinely improves speed.",
        media: fixtureMedia(),
      },
      {
        title: "Professional Production",
        description: "Design, editing, motion, compositing.",
        media: fixtureMedia(),
      },
      { title: "Efficient Delivery", description: "Structured workflows.", media: fixtureMedia() },
    ],
    closingStatement: "AI is our production advantage — not our identity.",
  };
}

function fixtureProcessBlock(): ProcessBlock {
  return {
    heading: "From idea to finished creative.",
    steps: [
      { title: "Understand", description: "We understand what you're trying to communicate." },
      { title: "Create", description: "We develop the concept." },
      { title: "Produce", description: "Our team builds the content." },
      { title: "Refine", description: "We incorporate feedback within the agreed scope." },
      { title: "Deliver", description: "You receive platform-ready creative assets." },
    ],
  };
}

function fixtureWaysToWork(): WaysToWorkBlock {
  return {
    heading: "Flexible ways to work with Famysys Studio.",
    body: "Whether you need one creative asset or an ongoing production partner.",
    tiers: [
      {
        name: "Launch",
        descriptor: "Essential Content",
        summary: "For businesses establishing regular creative output.",
        idealFor: "Small businesses and startups.",
        typicalWork: "Social creatives and short-form content.",
        cta: createCta("Talk to us", "/contact"),
      },
    ],
    custom: {
      name: "Custom Creative Partnership",
      descriptor: "Your flexible creative production team.",
      summary: "For businesses needing ongoing creative support.",
      invitation: "Tell us what you need.",
      cta: createCta("Talk to us about your requirements", "/contact"),
    },
  };
}

function fixtureWhyFamysys(): WhyFamysysBlock {
  return {
    heading: "Professional creative support. Without unnecessary overhead.",
    body: "A third option between expensive agencies and inconsistent freelancers.",
    reasons: [
      { title: "Flexible", description: "Start with a single project." },
      { title: "Efficient", description: "Structured production workflows." },
      { title: "Human-led", description: "Creative judgment stays with our team." },
      { title: "Scalable", description: "Designed to grow into ongoing partnerships." },
      { title: "Value-driven", description: "Better creative value for the investment." },
    ],
  };
}

function fixtureFaq(): FaqBlock {
  return {
    items: [
      { question: "Do you work with small businesses?", answer: "Yes." },
      {
        question: "How much do your services cost?",
        answer: "We currently provide custom quotations rather than public pricing.",
        cta: createCta("Talk to us about your project", "/contact"),
      },
    ],
  };
}

function fixtureClosingCta(): ClosingCtaBlock {
  return {
    heading: "Have a creative requirement? Let's talk.",
    body: "Tell us what you're trying to create.",
    cta: createCta("Start a Conversation", "/contact"),
    closingLine: "Project today. Creative partner tomorrow.",
  };
}

function fixtureFooterContent(): FooterContent {
  return {
    tagline: "A professional creative production partner.",
    contactEmail: "hello@famysys.com",
    legalLinks: [createCta("Privacy policy", "/privacy"), createCta("Terms of use", "/terms")],
    socialLinks: [],
  };
}

function fixtures(): FakeMarketingContentFixtures {
  return {
    hero: fixtureHero(),
    whatWeDo: fixtureWhatWeDo(),
    differentiator: fixtureDifferentiator(),
    process: fixtureProcessBlock(),
    waysToWork: fixtureWaysToWork(),
    workIntro: fixtureIntro("Selected Creative Work"),
    whyFamysys: fixtureWhyFamysys(),
    faq: fixtureFaq(),
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
    expect(result.whatWeDo).toBe(data.whatWeDo);
    expect(result.differentiator).toBe(data.differentiator);
    expect(result.process).toBe(data.process);
    expect(result.waysToWork).toBe(data.waysToWork);
    expect(result.workIntro).toBe(data.workIntro);
    expect(result.whyFamysys).toBe(data.whyFamysys);
    expect(result.faq).toBe(data.faq);
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
