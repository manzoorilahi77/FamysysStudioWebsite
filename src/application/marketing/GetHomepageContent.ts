import type { HeroContent } from "../../domain/marketing/entities/HeroContent";
import type { ManifestoBlock } from "../../domain/marketing/entities/ManifestoBlock";
import type { ValuePillar } from "../../domain/marketing/entities/ValuePillar";
import type { MarketingContentRepository } from "../../domain/marketing/repositories/MarketingContentRepository";

export interface HomepageMarketingContent {
  readonly hero: HeroContent;
  readonly manifesto: ManifestoBlock;
  readonly pillars: ReadonlyArray<ValuePillar>;
}

export class GetHomepageContent {
  constructor(private readonly repository: MarketingContentRepository) {}

  async execute(): Promise<HomepageMarketingContent> {
    const [hero, manifesto, pillars] = await Promise.all([
      this.repository.getHero(),
      this.repository.getManifesto(),
      this.repository.getValuePillars(),
    ]);
    return { hero, manifesto, pillars };
  }
}
