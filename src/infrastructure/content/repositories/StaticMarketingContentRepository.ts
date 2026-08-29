import type { ClosingCtaBlock } from "../../../domain/marketing/entities/ClosingCtaBlock";
import type { FooterContent } from "../../../domain/marketing/entities/FooterContent";
import type { HeroContent } from "../../../domain/marketing/entities/HeroContent";
import type { ManifestoBlock } from "../../../domain/marketing/entities/ManifestoBlock";
import type { PositioningBlock } from "../../../domain/marketing/entities/PositioningBlock";
import type { ProcessBlock } from "../../../domain/marketing/entities/ProcessBlock";
import type { SectionIntro } from "../../../domain/marketing/entities/SectionIntro";
import type { TalentBlock } from "../../../domain/marketing/entities/TalentBlock";
import type { ValuePillar } from "../../../domain/marketing/entities/ValuePillar";
import type {
  DifferentiatorsBlock,
  MarketingContentRepository,
  WorkSection,
} from "../../../domain/marketing/repositories/MarketingContentRepository";
import {
  closingCta,
  comparisonIntro,
  differentiatorsBlock,
  footerContent,
  heroContent,
  manifestoBlock,
  marqueeEyebrow,
  metricsIntro,
  pillarsIntro,
  positioningBlock,
  processBlock,
  servicesIntro,
  talentBlock,
  testimonialsIntro,
  valuePillars,
  workSection,
} from "../static/marketing.content";

export class StaticMarketingContentRepository implements MarketingContentRepository {
  async getHero(): Promise<HeroContent> {
    return heroContent;
  }

  async getManifesto(): Promise<ManifestoBlock> {
    return manifestoBlock;
  }

  async getValuePillars(): Promise<ReadonlyArray<ValuePillar>> {
    return valuePillars;
  }

  async getPillarsIntro(): Promise<SectionIntro> {
    return pillarsIntro;
  }

  async getMarqueeEyebrow(): Promise<string> {
    return marqueeEyebrow;
  }

  async getPositioning(): Promise<PositioningBlock> {
    return positioningBlock;
  }

  async getMetricsIntro(): Promise<SectionIntro> {
    return metricsIntro;
  }

  async getServicesIntro(): Promise<SectionIntro> {
    return servicesIntro;
  }

  async getWorkSection(): Promise<WorkSection> {
    return workSection;
  }

  async getComparisonIntro(): Promise<SectionIntro> {
    return comparisonIntro;
  }

  async getTestimonialsIntro(): Promise<SectionIntro> {
    return testimonialsIntro;
  }

  async getProcessBlock(): Promise<ProcessBlock> {
    return processBlock;
  }

  async getDifferentiatorsBlock(): Promise<DifferentiatorsBlock> {
    return differentiatorsBlock;
  }

  async getTalentBlock(): Promise<TalentBlock> {
    return talentBlock;
  }

  async getClosingCta(): Promise<ClosingCtaBlock> {
    return closingCta;
  }

  async getFooterContent(): Promise<FooterContent> {
    return footerContent;
  }
}
