import type { HeroContent } from "../../../domain/marketing/entities/HeroContent";
import type { ManifestoBlock } from "../../../domain/marketing/entities/ManifestoBlock";
import type { PositioningBlock } from "../../../domain/marketing/entities/PositioningBlock";
import type { SectionIntro } from "../../../domain/marketing/entities/SectionIntro";
import type { ValuePillar } from "../../../domain/marketing/entities/ValuePillar";
import type { MarketingContentRepository } from "../../../domain/marketing/repositories/MarketingContentRepository";

export interface FakeMarketingContentFixtures {
  readonly hero: HeroContent;
  readonly manifesto: ManifestoBlock;
  readonly pillars: ReadonlyArray<ValuePillar>;
  readonly pillarsIntro: SectionIntro;
  readonly marqueeEyebrow: string;
  readonly positioning: PositioningBlock;
  readonly metricsIntro: SectionIntro;
}

const METHOD_NAMES = [
  "getHero",
  "getManifesto",
  "getValuePillars",
  "getPillarsIntro",
  "getMarqueeEyebrow",
  "getPositioning",
  "getMetricsIntro",
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
}
