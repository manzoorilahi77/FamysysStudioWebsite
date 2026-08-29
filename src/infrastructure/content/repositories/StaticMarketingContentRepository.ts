import type { HeroContent } from "../../../domain/marketing/entities/HeroContent";
import type { ManifestoBlock } from "../../../domain/marketing/entities/ManifestoBlock";
import type { PositioningBlock } from "../../../domain/marketing/entities/PositioningBlock";
import type { SectionIntro } from "../../../domain/marketing/entities/SectionIntro";
import type { ValuePillar } from "../../../domain/marketing/entities/ValuePillar";
import type { MarketingContentRepository } from "../../../domain/marketing/repositories/MarketingContentRepository";
import {
  heroContent,
  manifestoBlock,
  marqueeEyebrow,
  metricsIntro,
  pillarsIntro,
  positioningBlock,
  valuePillars,
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
}
