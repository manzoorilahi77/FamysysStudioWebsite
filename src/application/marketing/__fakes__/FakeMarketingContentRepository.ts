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

export interface FakeMarketingContentFixtures {
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

const METHOD_NAMES = [
  "getHero",
  "getManifesto",
  "getValuePillars",
  "getPillarsIntro",
  "getMarqueeEyebrow",
  "getPositioning",
  "getMetricsIntro",
  "getServicesIntro",
  "getWorkSection",
  "getComparisonIntro",
  "getTestimonialsIntro",
  "getProcessBlock",
  "getDifferentiatorsBlock",
  "getTalentBlock",
  "getClosingCta",
  "getFooterContent",
] as const;

type MethodName = (typeof METHOD_NAMES)[number];

const FIXTURE_KEY_BY_METHOD: Record<MethodName, keyof FakeMarketingContentFixtures> = {
  getHero: "hero",
  getManifesto: "manifesto",
  getValuePillars: "pillars",
  getPillarsIntro: "pillarsIntro",
  getMarqueeEyebrow: "marqueeEyebrow",
  getPositioning: "positioning",
  getMetricsIntro: "metricsIntro",
  getServicesIntro: "servicesIntro",
  getWorkSection: "workSection",
  getComparisonIntro: "comparisonIntro",
  getTestimonialsIntro: "testimonialsIntro",
  getProcessBlock: "process",
  getDifferentiatorsBlock: "differentiators",
  getTalentBlock: "talent",
  getClosingCta: "closingCta",
  getFooterContent: "footer",
};

export class FakeMarketingContentRepository implements MarketingContentRepository {
  callCounts: Record<MethodName, number> = Object.fromEntries(
    METHOD_NAMES.map((name) => [name, 0]),
  ) as Record<MethodName, number>;
  error: Error | undefined;

  constructor(private readonly fixtures: FakeMarketingContentFixtures) {}

  private async resolve<T>(method: MethodName): Promise<T> {
    this.callCounts[method] += 1;
    if (this.error) {
      throw this.error;
    }
    return this.fixtures[FIXTURE_KEY_BY_METHOD[method]] as T;
  }

  getHero(): Promise<HeroContent> {
    return this.resolve("getHero");
  }

  getManifesto(): Promise<ManifestoBlock> {
    return this.resolve("getManifesto");
  }

  getValuePillars(): Promise<ReadonlyArray<ValuePillar>> {
    return this.resolve("getValuePillars");
  }

  getPillarsIntro(): Promise<SectionIntro> {
    return this.resolve("getPillarsIntro");
  }

  getMarqueeEyebrow(): Promise<string> {
    return this.resolve("getMarqueeEyebrow");
  }

  getPositioning(): Promise<PositioningBlock> {
    return this.resolve("getPositioning");
  }

  getMetricsIntro(): Promise<SectionIntro> {
    return this.resolve("getMetricsIntro");
  }

  getServicesIntro(): Promise<SectionIntro> {
    return this.resolve("getServicesIntro");
  }

  getWorkSection(): Promise<WorkSection> {
    return this.resolve("getWorkSection");
  }

  getComparisonIntro(): Promise<SectionIntro> {
    return this.resolve("getComparisonIntro");
  }

  getTestimonialsIntro(): Promise<SectionIntro> {
    return this.resolve("getTestimonialsIntro");
  }

  getProcessBlock(): Promise<ProcessBlock> {
    return this.resolve("getProcessBlock");
  }

  getDifferentiatorsBlock(): Promise<DifferentiatorsBlock> {
    return this.resolve("getDifferentiatorsBlock");
  }

  getTalentBlock(): Promise<TalentBlock> {
    return this.resolve("getTalentBlock");
  }

  getClosingCta(): Promise<ClosingCtaBlock> {
    return this.resolve("getClosingCta");
  }

  getFooterContent(): Promise<FooterContent> {
    return this.resolve("getFooterContent");
  }
}
