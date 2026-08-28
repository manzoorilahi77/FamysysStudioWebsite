import type { HeroContent } from "../entities/HeroContent";
import type { ManifestoBlock } from "../entities/ManifestoBlock";
import type { ValuePillar } from "../entities/ValuePillar";

export interface MarketingContentRepository {
  getHero(): Promise<HeroContent>;
  getManifesto(): Promise<ManifestoBlock>;
  getValuePillars(): Promise<ReadonlyArray<ValuePillar>>;
}
