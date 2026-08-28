import type { ClientLogo } from "../entities/ClientLogo";
import type { MetricStat } from "../entities/MetricStat";
import type { Testimonial } from "../entities/Testimonial";

export interface SocialProofRepository {
  getTestimonials(): Promise<ReadonlyArray<Testimonial>>;
  getImpactMetrics(): Promise<ReadonlyArray<MetricStat>>;
  getClientLogos(): Promise<ReadonlyArray<ClientLogo>>;
}
