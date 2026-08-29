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
import {
  closingCta,
  differentiatorBlock,
  faqBlock,
  footerContent,
  heroContent,
  processBlock,
  waysToWorkBlock,
  whatWeDoIntro,
  whyFamysysBlock,
  workIntro,
} from "../static/marketing.content";

export class StaticMarketingContentRepository implements MarketingContentRepository {
  async getHero(): Promise<HeroContent> {
    return heroContent;
  }

  async getWhatWeDoIntro(): Promise<WhatWeDoIntro> {
    return whatWeDoIntro;
  }

  async getDifferentiatorBlock(): Promise<DifferentiatorBlock> {
    return differentiatorBlock;
  }

  async getProcessBlock(): Promise<ProcessBlock> {
    return processBlock;
  }

  async getWaysToWorkBlock(): Promise<WaysToWorkBlock> {
    return waysToWorkBlock;
  }

  async getWorkIntro(): Promise<SectionIntro> {
    return workIntro;
  }

  async getWhyFamysysBlock(): Promise<WhyFamysysBlock> {
    return whyFamysysBlock;
  }

  async getFaqBlock(): Promise<FaqBlock> {
    return faqBlock;
  }

  async getClosingCta(): Promise<ClosingCtaBlock> {
    return closingCta;
  }

  async getFooterContent(): Promise<FooterContent> {
    return footerContent;
  }
}
