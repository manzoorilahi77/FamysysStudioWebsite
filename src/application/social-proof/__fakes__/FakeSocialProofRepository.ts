import type { ClientLogo } from "../../../domain/social-proof/entities/ClientLogo";
import type { MetricStat } from "../../../domain/social-proof/entities/MetricStat";
import type { Testimonial } from "../../../domain/social-proof/entities/Testimonial";
import type { SocialProofRepository } from "../../../domain/social-proof/repositories/SocialProofRepository";

export class FakeSocialProofRepository implements SocialProofRepository {
  testimonialsCalls = 0;
  metricsCalls = 0;
  logosCalls = 0;
  error: Error | undefined;

  constructor(
    private readonly testimonials: ReadonlyArray<Testimonial>,
    private readonly metrics: ReadonlyArray<MetricStat>,
    private readonly logos: ReadonlyArray<ClientLogo>,
  ) {}

  async getTestimonials(): Promise<ReadonlyArray<Testimonial>> {
    this.testimonialsCalls += 1;
    if (this.error) {
      throw this.error;
    }
    return this.testimonials;
  }

  async getImpactMetrics(): Promise<ReadonlyArray<MetricStat>> {
    this.metricsCalls += 1;
    if (this.error) {
      throw this.error;
    }
    return this.metrics;
  }

  async getClientLogos(): Promise<ReadonlyArray<ClientLogo>> {
    this.logosCalls += 1;
    if (this.error) {
      throw this.error;
    }
    return this.logos;
  }
}
