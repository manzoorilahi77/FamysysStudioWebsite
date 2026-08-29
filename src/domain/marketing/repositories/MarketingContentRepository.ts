import type { ClosingCtaBlock } from "../entities/ClosingCtaBlock";
import type { DifferentiatorBlock } from "../entities/DifferentiatorBlock";
import type { FaqBlock } from "../entities/FaqBlock";
import type { FooterContent } from "../entities/FooterContent";
import type { HeroContent } from "../entities/HeroContent";
import type { ProcessBlock } from "../entities/ProcessBlock";
import type { SectionIntro } from "../entities/SectionIntro";
import type { WaysToWorkBlock } from "../entities/EngagementTier";
import type { WhyFamysysBlock } from "../entities/WhyFamysysBlock";
import type { Cta } from "../../shared/value-objects/Cta";

export interface WhatWeDoIntro {
  readonly intro: SectionIntro;
  readonly cta: Cta;
}

export interface MarketingContentRepository {
  getHero(): Promise<HeroContent>;
  getWhatWeDoIntro(): Promise<WhatWeDoIntro>;
  getDifferentiatorBlock(): Promise<DifferentiatorBlock>;
  getProcessBlock(): Promise<ProcessBlock>;
  getWaysToWorkBlock(): Promise<WaysToWorkBlock>;
  getWorkIntro(): Promise<SectionIntro>;
  getWhyFamysysBlock(): Promise<WhyFamysysBlock>;
  getFaqBlock(): Promise<FaqBlock>;
  getClosingCta(): Promise<ClosingCtaBlock>;
  getFooterContent(): Promise<FooterContent>;
}
