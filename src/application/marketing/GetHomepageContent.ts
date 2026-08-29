import type { ClosingCtaBlock } from "../../domain/marketing/entities/ClosingCtaBlock";
import type { FooterContent } from "../../domain/marketing/entities/FooterContent";
import type { HeroContent } from "../../domain/marketing/entities/HeroContent";
import type { ManifestoBlock } from "../../domain/marketing/entities/ManifestoBlock";
import type { PositioningBlock } from "../../domain/marketing/entities/PositioningBlock";
import type { ProcessBlock } from "../../domain/marketing/entities/ProcessBlock";
import type { SectionIntro } from "../../domain/marketing/entities/SectionIntro";
import type { TalentBlock } from "../../domain/marketing/entities/TalentBlock";
import type { ValuePillar } from "../../domain/marketing/entities/ValuePillar";
import type {
  DifferentiatorsBlock,
  MarketingContentRepository,
  WorkSection,
} from "../../domain/marketing/repositories/MarketingContentRepository";

export interface HomepageMarketingContent {
  readonly hero: HeroContent;
  readonly manifesto: ManifestoBlock;
  readonly pillars: ReadonlyArray<ValuePillar>;
  readonly pillarsIntro: SectionIntro;
  readonly marqueeEyebrow: string;
  readonly positioning: PositioningBlock;
  readonly metricsIntro: SectionIntro;
  readonly servicesIntro: SectionIntro;
  readonly workSection: WorkSection;
  readonly comparisonIntro: SectionIntro;
  readonly testimonialsIntro: SectionIntro;
  readonly process: ProcessBlock;
  readonly differentiators: DifferentiatorsBlock;
  readonly talent: TalentBlock;
  readonly closingCta: ClosingCtaBlock;
  readonly footer: FooterContent;
}

export class GetHomepageContent {
  constructor(private readonly repository: MarketingContentRepository) {}

  async execute(): Promise<HomepageMarketingContent> {
    const [
      hero,
      manifesto,
      pillars,
      pillarsIntro,
      marqueeEyebrow,
      positioning,
      metricsIntro,
      servicesIntro,
      workSection,
      comparisonIntro,
      testimonialsIntro,
      process,
      differentiators,
      talent,
      closingCta,
      footer,
    ] = await Promise.all([
      this.repository.getHero(),
      this.repository.getManifesto(),
      this.repository.getValuePillars(),
      this.repository.getPillarsIntro(),
      this.repository.getMarqueeEyebrow(),
      this.repository.getPositioning(),
      this.repository.getMetricsIntro(),
      this.repository.getServicesIntro(),
      this.repository.getWorkSection(),
      this.repository.getComparisonIntro(),
      this.repository.getTestimonialsIntro(),
      this.repository.getProcessBlock(),
      this.repository.getDifferentiatorsBlock(),
      this.repository.getTalentBlock(),
      this.repository.getClosingCta(),
      this.repository.getFooterContent(),
    ]);
    return {
      hero,
      manifesto,
      pillars,
      pillarsIntro,
      marqueeEyebrow,
      positioning,
      metricsIntro,
      servicesIntro,
      workSection,
      comparisonIntro,
      testimonialsIntro,
      process,
      differentiators,
      talent,
      closingCta,
      footer,
    };
  }
}
