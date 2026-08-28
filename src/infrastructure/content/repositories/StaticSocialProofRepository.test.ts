import { describe, expect, it } from "vitest";
import { StaticSocialProofRepository } from "./StaticSocialProofRepository";

describe("StaticSocialProofRepository", () => {
  it("returns 10 client logos", async () => {
    const repository = new StaticSocialProofRepository();

    const logos = await repository.getClientLogos();

    expect(logos).toHaveLength(10);
  });

  it("returns exactly 4 impact metrics", async () => {
    const repository = new StaticSocialProofRepository();

    const metrics = await repository.getImpactMetrics();

    expect(metrics).toHaveLength(4);
    expect(metrics.every((metric) => metric.value > 0)).toBe(true);
  });

  it("returns 9 testimonials", async () => {
    const repository = new StaticSocialProofRepository();

    const testimonials = await repository.getTestimonials();

    expect(testimonials).toHaveLength(9);
    expect(testimonials.every((t) => t.quote.trim().length > 0)).toBe(true);
  });
});
