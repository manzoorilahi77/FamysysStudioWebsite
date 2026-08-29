"use client";

import Image from "next/image";
import type { MediaView } from "../lib/viewModels";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface TalentTileProps {
  readonly media: MediaView;
  readonly role: string;
  readonly row: number;
  readonly column: number;
  readonly isFeature?: boolean;
}

const STAGGER_STEP_MS = 50;

export function TalentTile({ media, role, row, column, isFeature = false }: TalentTileProps) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.2, once: true });
  const prefersReducedMotion = useReducedMotion();
  const isRevealed = isInView || prefersReducedMotion;
  const delayMs = (row + column) * STAGGER_STEP_MS;

  return (
    <div
      ref={ref}
      className={isFeature ? "sm:col-span-2 sm:row-span-2" : undefined}
      style={{
        opacity: isRevealed ? 1 : 0,
        transitionProperty: "opacity",
        transitionDuration: prefersReducedMotion ? "120ms" : "400ms",
        transitionDelay: prefersReducedMotion ? "0ms" : `${delayMs}ms`,
        transitionTimingFunction: "var(--ease-base)",
      }}
    >
      <div className="media-tile h-full" style={isFeature ? undefined : { aspectRatio: "1 / 1" }}>
        <Image
          src={media.src}
          alt={media.alt}
          width={400}
          height={400}
          loading="lazy"
          className={`media-tile-media h-full w-full object-cover ${prefersReducedMotion ? "" : "media-tile-media--scalable"}`}
        />
        <span className="media-tile-chip label">{role}</span>
      </div>
    </div>
  );
}
