"use client";

import Image from "next/image";
import type { CaseStudyView } from "../lib/viewModels";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface CaseStudyCardProps {
  readonly caseStudy: CaseStudyView;
  /** CSS aspect-ratio for the media tile. Varied down the grid so the rows are uneven. */
  readonly aspectRatio?: string;
  readonly isPriority?: boolean;
}

export function CaseStudyCard({
  caseStudy,
  aspectRatio = "4 / 3",
  isPriority = false,
}: CaseStudyCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <article>
      <div className="media-tile" style={{ aspectRatio }}>
        <Image
          src={caseStudy.media.src}
          alt={caseStudy.media.alt}
          width={1200}
          height={900}
          sizes="(min-width: 1024px) 50vw, (min-width: 768px) 50vw, 100vw"
          {...(isPriority ? { priority: true } : { loading: "lazy" as const })}
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
