import type { Testimonial } from "../../domain/social-proof/entities/Testimonial";

interface TestimonialCardProps {
  readonly testimonial: Testimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <blockquote className="card-surface p-6">
      <p className="text-body text-ink">&ldquo;{testimonial.quote}&rdquo;</p>
      <footer className="mt-4">
        <p className="text-small font-medium text-ink">{testimonial.name}</p>
        <p className="text-small text-ink-70">
          {testimonial.role}, {testimonial.company}
        </p>
      </footer>
    </blockquote>
  );
}
