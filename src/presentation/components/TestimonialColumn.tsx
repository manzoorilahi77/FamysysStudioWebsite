"use client";

import { useState } from "react";
import type { Testimonial } from "../../domain/social-proof/entities/Testimonial";
import { TestimonialCard } from "./TestimonialCard";

interface TestimonialColumnProps {
  readonly testimonials: ReadonlyArray<Testimonial>;
  readonly direction: "up" | "down";
  readonly durationSeconds: number;
  readonly sectionVisible: boolean;
}

export function TestimonialColumn({
  testimonials,
  direction,
  durationSeconds,
  sectionVisible,
}: TestimonialColumnProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isPaused = isHovered || !sectionVisible;

  return (
    <div
      className="overflow-hidden"
      style={{ maxHeight: "36rem" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`testimonial-track testimonial-track--${direction} flex flex-col gap-6`}
        data-paused={isPaused}
        style={{ animationDuration: `${durationSeconds}s` }}
      >
        {[0, 1].map((copy) => (
          <div key={copy} aria-hidden={copy === 1} className="flex flex-col gap-6">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.name} testimonial={testimonial} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
