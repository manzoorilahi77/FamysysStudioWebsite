import { describe, expect, it } from "vitest";
import type { Testimonial } from "../../domain/social-proof/entities/Testimonial";
import { FakeSocialProofRepository } from "./__fakes__/FakeSocialProofRepository";
import { GetTestimonialWall } from "./GetTestimonialWall";

function fixtureTestimonials(): ReadonlyArray<Testimonial> {
  return [
    {
      quote: "Placeholder testimonial — TODO: confirm with client.",
      name: "Jordan Lee",
      role: "VP Marketing",
      company: "Northwind Logistics",
    },
  ];
}

describe("GetTestimonialWall", () => {
  it("returns testimonials from the repository", async () => {
    const testimonials = fixtureTestimonials();
    const repository = new FakeSocialProofRepository(testimonials, [], []);
    const useCase = new GetTestimonialWall(repository);

    const result = await useCase.execute();

    expect(result).toBe(testimonials);
    expect(repository.testimonialsCalls).toBe(1);
  });

  it("propagates a repository failure", async () => {
    const repository = new FakeSocialProofRepository(fixtureTestimonials(), [], []);
    repository.error = new Error("testimonials unavailable");
    const useCase = new GetTestimonialWall(repository);

    await expect(useCase.execute()).rejects.toThrow("testimonials unavailable");
  });
});
