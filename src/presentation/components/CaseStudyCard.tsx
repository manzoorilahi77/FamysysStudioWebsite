"use client";

import Image from "next/image";
import type { CaseStudyView } from "../lib/viewModels";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface CaseStudyCardProps {
  readonly caseStudy: CaseStudyView;
  readonly stagger?: boolean;
}

export function CaseStudyCard({ caseStudy, stagger = false }: CaseStudyCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <article
      className="case-study-card group"
      style={{ marginTop: stagger ? "2.5rem" : undefined }}
    >
      <div className="overflow-hidden rounded-sm" style={{ aspectRatio: "4 / 3" }}>
        <Image
          src={caseStudy.media.src}
          alt={caseStudy.media.alt}
          width={600}
          height={450}
          loading="lazy"
          className={`case-study-media h-full w-full object-cover ${
            prefersReducedMotion ? "" : "case-study-media--scalable"
          }`}
        />
      </div>
      <p className="label mt-4 text-ink-70">{caseStudy.client}</p>
      <p className="text-small mt-1 text-ink-70">{caseStudy.tags.join(", ")}</p>
      <p
        className="text-display-s mt-2 font-medium text-ink opacity-0 group-hover:opacity-100"
        style={{ transitionProperty: "opacity", transitionDuration: "var(--duration-fast)" }}
      >
        {caseStudy.title}
      </p>
    </article>
  );
}
