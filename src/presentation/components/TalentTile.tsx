"use client";

import Image from "next/image";
import type { MediaView } from "../lib/viewModels";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface TalentTileProps {
  readonly media: MediaView;
  readonly row: number;
  readonly column: number;
}

const STAGGER_STEP_MS = 50;

export function TalentTile({ media, row, column }: TalentTileProps) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.2, once: true });
  const prefersReducedMotion = useReducedMotion();
  const isRevealed = isInView || prefersReducedMotion;
  const delayMs = (row + column) * STAGGER_STEP_MS;

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-sm"
      style={{
        aspectRatio: "1 / 1",
        opacity: isRevealed ? 1 : 0,
        transitionProperty: "opacity",
        transitionDuration: prefersReducedMotion ? "120ms" : "400ms",
        transitionDelay: prefersReducedMotion ? "0ms" : `${delayMs}ms`,
        transitionTimingFunction: "var(--ease-base)",
      }}
    >
      <Image src={media.src} alt={media.alt} width={200} height={200} loading="lazy" className="h-full w-full object-cover" />
    </div>
  );
}
