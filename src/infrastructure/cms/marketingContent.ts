import type { ClosingCtaBlock } from "../../domain/marketing/entities/ClosingCtaBlock";
import type { DifferentiatorBlock } from "../../domain/marketing/entities/DifferentiatorBlock";
import type { WaysToWorkBlock } from "../../domain/marketing/entities/EngagementTier";
import type { FaqBlock } from "../../domain/marketing/entities/FaqBlock";
import type { FooterContent } from "../../domain/marketing/entities/FooterContent";
import type { HeroContent } from "../../domain/marketing/entities/HeroContent";
import type { ProcessBlock } from "../../domain/marketing/entities/ProcessBlock";
import type { SectionIntro } from "../../domain/marketing/entities/SectionIntro";
import type { WhyFamysysBlock } from "../../domain/marketing/entities/WhyFamysysBlock";
import type {
  MarketingContentRepository,
  WhatWeDoIntro,
} from "../../domain/marketing/repositories/MarketingContentRepository";

/**
 * The ten homepage blocks, read in one pass.
 *
 * `application/marketing/GetHomepageContent` already does exactly this, and the CMS
 * would rather call it than repeat it — but infrastructure/ cannot import application/
 * (see the boundary rules in eslint.config.mjs), and the CMS repository is
 * infrastructure. So the aggregate is assembled here instead, from the same interface,
 * which keeps the dependency arrow pointing the right way at the cost of this file.
 */
export interface MarketingContent {
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

export async function loadMarketingContent(
  repository: MarketingContentRepository,
): Promise<MarketingContent> {
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
    repository.getHero(),
    repository.getWhatWeDoIntro(),
    repository.getDifferentiatorBlock(),
    repository.getProcessBlock(),
    repository.getWaysToWorkBlock(),
    repository.getWorkIntro(),
    repository.getWhyFamysysBlock(),
    repository.getFaqBlock(),
    repository.getClosingCta(),
    repository.getFooterContent(),
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
