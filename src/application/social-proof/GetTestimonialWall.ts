import type { Testimonial } from "../../domain/social-proof/entities/Testimonial";
import type { SocialProofRepository } from "../../domain/social-proof/repositories/SocialProofRepository";

export class GetTestimonialWall {
  constructor(private readonly repository: SocialProofRepository) {}

  async execute(): Promise<ReadonlyArray<Testimonial>> {
    return this.repository.getTestimonials();
  }
}
