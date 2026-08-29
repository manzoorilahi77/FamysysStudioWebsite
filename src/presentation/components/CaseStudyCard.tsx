"use client";

import Image from "next/image";
import type { CaseStudyView } from "../lib/viewModels";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface CaseStudyCardProps {
  readonly caseStudy: CaseStudyView;
}

export function CaseStudyCard({ caseStudy }: CaseStudyCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <article>
      <div className="media-tile" style={{ aspectRatio: "4 / 3" }}>
        <Image
          src={caseStudy.media.src}
          alt={caseStudy.media.alt}
          width={600}
          height={450}
          loading="lazy"
          className={`media-tile-media h-full w-full object-cover ${
            prefersReducedMotion ? "" : "media-tile-media--scalable"
          }`}
        />
        <span className="media-tile-chip label">{caseStudy.reference}</span>
      </div>
      <p className="text-display-s mt-4 font-medium text-ink">{caseStudy.title}</p>
      <p className="text-small mt-2 text-ink-70">{caseStudy.description}</p>
    </article>
  );
}
