import type { ClosingCtaBlock } from "../../domain/marketing/entities/ClosingCtaBlock";
import type { DifferentiatorBlock } from "../../domain/marketing/entities/DifferentiatorBlock";
import type { FaqBlock } from "../../domain/marketing/entities/FaqBlock";
import type { FooterContent } from "../../domain/marketing/entities/FooterContent";
import type { HeroContent } from "../../domain/marketing/entities/HeroContent";
import type { ProcessBlock } from "../../domain/marketing/entities/ProcessBlock";
import type { SectionIntro } from "../../domain/marketing/entities/SectionIntro";
import type { WaysToWorkBlock } from "../../domain/marketing/entities/EngagementTier";
import type { WhyFamysysBlock } from "../../domain/marketing/entities/WhyFamysysBlock";
import type {
  MarketingContentRepository,
  WhatWeDoIntro,
} from "../../domain/marketing/repositories/MarketingContentRepository";

export interface HomepageMarketingContent {
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

export class GetHomepageContent {
  constructor(private readonly repository: MarketingContentRepository) {}

  async execute(): Promise<HomepageMarketingContent> {
    const [
      hero,
      whatWeDo,
      differentiator,
      process,
      waysToWork,
      workIntro,
      whyFamysys,
      faq,
      closingCta,
      footer,
    ] = await Promise.all([
      this.repository.getHero(),
      this.repository.getWhatWeDoIntro(),
      this.repository.getDifferentiatorBlock(),
      this.repository.getProcessBlock(),
      this.repository.getWaysToWorkBlock(),
      this.repository.getWorkIntro(),
      this.repository.getWhyFamysysBlock(),
      this.repository.getFaqBlock(),
      this.repository.getClosingCta(),
      this.repository.getFooterContent(),
    ]);
    return {
      hero,
      whatWeDo,
      differentiator,
      process,
      waysToWork,
      workIntro,
      whyFamysys,
      faq,
      closingCta,
      footer,
    };
  }
}
