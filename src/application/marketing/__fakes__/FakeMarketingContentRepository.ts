import type { ClosingCtaBlock } from "../../../domain/marketing/entities/ClosingCtaBlock";
import type { DifferentiatorBlock } from "../../../domain/marketing/entities/DifferentiatorBlock";
import type { FaqBlock } from "../../../domain/marketing/entities/FaqBlock";
import type { FooterContent } from "../../../domain/marketing/entities/FooterContent";
import type { HeroContent } from "../../../domain/marketing/entities/HeroContent";
import type { ProcessBlock } from "../../../domain/marketing/entities/ProcessBlock";
import type { SectionIntro } from "../../../domain/marketing/entities/SectionIntro";
import type { WaysToWorkBlock } from "../../../domain/marketing/entities/EngagementTier";
import type { WhyFamysysBlock } from "../../../domain/marketing/entities/WhyFamysysBlock";
import type {
  MarketingContentRepository,
  WhatWeDoIntro,
} from "../../../domain/marketing/repositories/MarketingContentRepository";

export interface FakeMarketingContentFixtures {
  readonly hero: HeroContent;
  readonly whatWeDo: WhatWeDoIntro;
  readonly differentiator: DifferentiatorBlock;
  readonly process: ProcessBlock;
  readonly waysToWork: WaysToWorkBlock;
  readonly workIntro: SectionIntro;
  readonly whyFamysys: WhyFamysysBlock;
  readonly faq: FaqBlock;
  readonly closingCta: ClosingCtaBlock;
  readonly footer: FooterContent;
}

const METHOD_NAMES = [
  "getHero",
  "getWhatWeDoIntro",
  "getDifferentiatorBlock",
  "getProcessBlock",
  "getWaysToWorkBlock",
  "getWorkIntro",
  "getWhyFamysysBlock",
  "getFaqBlock",
  "getClosingCta",
  "getFooterContent",
] as const;

type MethodName = (typeof METHOD_NAMES)[number];

const FIXTURE_KEY_BY_METHOD: Record<MethodName, keyof FakeMarketingContentFixtures> = {
  getHero: "hero",
  getWhatWeDoIntro: "whatWeDo",
  getDifferentiatorBlock: "differentiator",
  getProcessBlock: "process",
  getWaysToWorkBlock: "waysToWork",
  getWorkIntro: "workIntro",
  getWhyFamysysBlock: "whyFamysys",
  getFaqBlock: "faq",
  getClosingCta: "closingCta",
  getFooterContent: "footer",
};

export class FakeMarketingContentRepository implements MarketingContentRepository {
  callCounts: Record<MethodName, number> = Object.fromEntries(
    METHOD_NAMES.map((name) => [name, 0]),
  ) as Record<MethodName, number>;
  error: Error | undefined;

  constructor(private readonly fixtures: FakeMarketingContentFixtures) {}

  private async resolve<T>(method: MethodName): Promise<T> {
    this.callCounts[method] += 1;
    if (this.error) {
      throw this.error;
    }
    return this.fixtures[FIXTURE_KEY_BY_METHOD[method]] as T;
  }

  getHero(): Promise<HeroContent> {
    return this.resolve("getHero");
  }

  getWhatWeDoIntro(): Promise<WhatWeDoIntro> {
    return this.resolve("getWhatWeDoIntro");
  }

  getDifferentiatorBlock(): Promise<DifferentiatorBlock> {
    return this.resolve("getDifferentiatorBlock");
  }

  getProcessBlock(): Promise<ProcessBlock> {
    return this.resolve("getProcessBlock");
  }

  getWaysToWorkBlock(): Promise<WaysToWorkBlock> {
    return this.resolve("getWaysToWorkBlock");
  }

  getWorkIntro(): Promise<SectionIntro> {
    return this.resolve("getWorkIntro");
  }

  getWhyFamysysBlock(): Promise<WhyFamysysBlock> {
    return this.resolve("getWhyFamysysBlock");
  }

  getFaqBlock(): Promise<FaqBlock> {
    return this.resolve("getFaqBlock");
  }

  getClosingCta(): Promise<ClosingCtaBlock> {
    return this.resolve("getClosingCta");
  }

  getFooterContent(): Promise<FooterContent> {
    return this.resolve("getFooterContent");
  }
}
