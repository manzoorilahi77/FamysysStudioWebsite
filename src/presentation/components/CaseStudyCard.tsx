"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import type { CaseStudyView } from "../lib/viewModels";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface CaseStudyCardProps {
  readonly caseStudy: CaseStudyView;
  /** Position in the grid. Drives the stagger only — every tile is the same size. */
  readonly index?: number;
  readonly isPriority?: boolean;
}

/** Column stagger, so a row arrives left then right rather than as one slab. */
const STAGGER_STEP_MS = 90;

/**
 * One piece of work, in a frame the same shape as every other frame in the grid.
 *
 * THE RATIO IS FIXED. It used to be handed in per tile from a cycling array — 4:3, 3:4,
 * 1:1 — on the theory that an uneven grid reads as editorial rather than as a catalogue.
 * It did not. Two tiles of different heights in one row leave a hole under the shorter
 * one, the row below starts at a different place on each side, and the eye reads the gaps
 * instead of the work. A capped media height had already been added to bound the damage,
 * which is the tell: the layout needed a patch to be survivable. One ratio for every tile
 * removes the problem rather than bounding it, and `object-fit: cover` means the source
 * images can still be any shape they like.
 *
 * The card arrives in two beats, and they are one gesture rather than two effects. The
 * frame WIPES UP — `clip-path` from a full inset, which takes the border with it, so the
 * frame draws itself as the image appears inside it — while the photograph settles from
 * 1.06 to 1. The caption follows a beat later. Under reduced motion the whole thing is
 * simply there; see `.work-card` in globals.css, where the stagger delay is zeroed rather
 * than shortened, because a delay is not a duration and survives the global rule.
 */
export function CaseStudyCard({ caseStudy, index = 0, isPriority = false }: CaseStudyCardProps) {
  const [ref, isInView] = useInView<HTMLElement>({ threshold: 0.2, once: true });
  const prefersReducedMotion = useReducedMotion();
  const hasArrived = prefersReducedMotion || isInView;

  return (
    <article
      ref={ref}
      className="work-card"
      data-revealed={hasArrived}
      style={
        {
          "--work-reveal-delay": prefersReducedMotion
            ? "0ms"
            : `${(index % 2) * STAGGER_STEP_MS}ms`,
        } as CSSProperties
      }
    >
      <div className="media-tile">
        <Image
          src={caseStudy.media.src}
          alt={caseStudy.media.alt}
          width={1600}
          height={1200}
          sizes="(min-width: 768px) 50vw, 100vw"
          {...(isPriority ? { priority: true } : { loading: "lazy" as const })}
          className={`media-tile-media h-full w-full object-cover ${
            prefersReducedMotion ? "" : "media-tile-media--scalable"
          }`}
        />
        <span className="media-tile-chip label">{caseStudy.reference}</span>
      </div>
      <div className="work-card-caption">
        <p className="text-display-s mt-5 font-medium text-ink">{caseStudy.title}</p>
        <p className="text-small mt-2 text-ink-70">{caseStudy.description}</p>
      </div>
    </article>
  );
}
