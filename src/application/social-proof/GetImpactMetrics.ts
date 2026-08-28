import type { MetricStat } from "../../domain/social-proof/entities/MetricStat";
import type { SocialProofRepository } from "../../domain/social-proof/repositories/SocialProofRepository";

export class GetImpactMetrics {
  constructor(private readonly repository: SocialProofRepository) {}

  async execute(): Promise<ReadonlyArray<MetricStat>> {
    return this.repository.getImpactMetrics();
  }
}
