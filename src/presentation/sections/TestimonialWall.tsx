"use client";

import type { SectionIntro } from "../../domain/marketing/entities/SectionIntro";
import type { Testimonial } from "../../domain/social-proof/entities/Testimonial";
import { Container } from "../components/Container";
import { Eyebrow } from "../components/Eyebrow";
import { Section } from "../components/Section";
import { TestimonialCard } from "../components/TestimonialCard";
import { TestimonialColumn } from "../components/TestimonialColumn";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface TestimonialWallProps {
  readonly intro: SectionIntro;
  readonly testimonials: ReadonlyArray<Testimonial>;
}

const COLUMN_COUNT = 3;
const COLUMN_DURATIONS = [34, 42, 38];
const COLUMN_DIRECTIONS: ReadonlyArray<"up" | "down"> = ["up", "down", "up"];

function distributeIntoColumns(testimonials: ReadonlyArray<Testimonial>): Testimonial[][] {
  const columns: Testimonial[][] = Array.from({ length: COLUMN_COUNT }, () => []);
  testimonials.forEach((testimonial, index) => {
    columns[index % COLUMN_COUNT]?.push(testimonial);
  });
  return columns;
}

export function TestimonialWall({ intro, testimonials }: TestimonialWallProps) {
  const [sectionRef, sectionVisible] = useInView<HTMLDivElement>({ threshold: 0.1, once: false });
  const prefersReducedMotion = useReducedMotion();
  const columns = distributeIntoColumns(testimonials);

  return (
    <Section ariaLabel={intro.heading}>
      <Container>
        <Eyebrow>{intro.eyebrow}</Eyebrow>
        <h2 className="text-display-l mt-4 font-medium text-ink">{intro.heading}</h2>

        {prefersReducedMotion ? (
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.name} testimonial={testimonial} />
            ))}
          </div>
        ) : (
          <div ref={sectionRef} className="mt-12 grid gap-6 md:grid-cols-3">
            {columns.map((columnTestimonials, index) => (
              <TestimonialColumn
                key={index}
                testimonials={columnTestimonials}
                direction={COLUMN_DIRECTIONS[index] ?? "up"}
                durationSeconds={COLUMN_DURATIONS[index] ?? 36}
                sectionVisible={sectionVisible}
              />
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
