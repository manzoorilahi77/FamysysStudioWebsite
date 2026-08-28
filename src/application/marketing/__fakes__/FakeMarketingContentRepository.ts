import type { HeroContent } from "../../../domain/marketing/entities/HeroContent";
import type { ManifestoBlock } from "../../../domain/marketing/entities/ManifestoBlock";
import type { ValuePillar } from "../../../domain/marketing/entities/ValuePillar";
import type { MarketingContentRepository } from "../../../domain/marketing/repositories/MarketingContentRepository";

export class FakeMarketingContentRepository implements MarketingContentRepository {
  heroCalls = 0;
  manifestoCalls = 0;
  pillarsCalls = 0;
  error: Error | undefined;

  constructor(
    private readonly hero: HeroContent,
    private readonly manifesto: ManifestoBlock,
    private readonly pillars: ReadonlyArray<ValuePillar>,
  ) {}

  async getHero(): Promise<HeroContent> {
    this.heroCalls += 1;
    if (this.error) {
      throw this.error;
    }
    return this.hero;
  }

  async getManifesto(): Promise<ManifestoBlock> {
    this.manifestoCalls += 1;
    if (this.error) {
      throw this.error;
    }
    return this.manifesto;
  }

  async getValuePillars(): Promise<ReadonlyArray<ValuePillar>> {
    this.pillarsCalls += 1;
    if (this.error) {
      throw this.error;
    }
    return this.pillars;
  }
}
