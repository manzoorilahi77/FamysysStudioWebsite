import type { HeroContent } from "../../../domain/marketing/entities/HeroContent";
import type { ManifestoBlock } from "../../../domain/marketing/entities/ManifestoBlock";
import type { ValuePillar } from "../../../domain/marketing/entities/ValuePillar";
import type { MarketingContentRepository } from "../../../domain/marketing/repositories/MarketingContentRepository";
import { heroContent, manifestoBlock, valuePillars } from "../static/marketing.content";

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
}
