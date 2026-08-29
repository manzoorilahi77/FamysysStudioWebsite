import type { HeroContent } from "../../domain/marketing/entities/HeroContent";
import type { ManifestoBlock } from "../../domain/marketing/entities/ManifestoBlock";
import type { PositioningBlock } from "../../domain/marketing/entities/PositioningBlock";
import type { SectionIntro } from "../../domain/marketing/entities/SectionIntro";
import type { ValuePillar } from "../../domain/marketing/entities/ValuePillar";
import type { MarketingContentRepository } from "../../domain/marketing/repositories/MarketingContentRepository";

export interface HomepageMarketingContent {
  readonly hero: HeroContent;
  readonly manifesto: ManifestoBlock;
  readonly pillars: ReadonlyArray<ValuePillar>;
  readonly pillarsIntro: SectionIntro;
  readonly marqueeEyebrow: string;
  readonly positioning: PositioningBlock;
  readonly metricsIntro: SectionIntro;
}

export class GetHomepageContent {
  constructor(private readonly repository: MarketingContentRepository) {}

  async execute(): Promise<HomepageMarketingContent> {
    const [hero, manifesto, pillars, pillarsIntro, marqueeEyebrow, positioning, metricsIntro] =
      await Promise.all([
        this.repository.getHero(),
        this.repository.getManifesto(),
        this.repository.getValuePillars(),
        this.repository.getPillarsIntro(),
        this.repository.getMarqueeEyebrow(),
        this.repository.getPositioning(),
        this.repository.getMetricsIntro(),
      ]);
    return {
      hero,
      manifesto,
      pillars,
      pillarsIntro,
      marqueeEyebrow,
      positioning,
      metricsIntro,
    };
  }
}
