import type { ClientLogo } from "../../../domain/social-proof/entities/ClientLogo";
import type { MetricStat } from "../../../domain/social-proof/entities/MetricStat";
import type { Testimonial } from "../../../domain/social-proof/entities/Testimonial";
import type { SocialProofRepository } from "../../../domain/social-proof/repositories/SocialProofRepository";
import { clientLogos, impactMetrics, testimonials } from "../static/social-proof.content";

export class StaticSocialProofRepository implements SocialProofRepository {
  async getTestimonials(): Promise<ReadonlyArray<Testimonial>> {
    return testimonials;
  }

  async getImpactMetrics(): Promise<ReadonlyArray<MetricStat>> {
    return impactMetrics;
  }

  async getClientLogos(): Promise<ReadonlyArray<ClientLogo>> {
    return clientLogos;
  }
}
