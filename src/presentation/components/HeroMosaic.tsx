"use client";

import Image from "next/image";
import type { MediaView } from "../lib/viewModels";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface HeroMosaicProps {
  readonly tiles: ReadonlyArray<MediaView>;
}

const COLUMN_SIZE = 2;

/** Four columns, each drifting at a different speed/direction/offset so the mosaic reads as
    one deliberately staggered field rather than a repeating tile. Reuses the testimonial-track
    drift keyframes (identical translateY(-50%) loop mechanic, just applied vertically here too). */
const COLUMNS = [
  { offset: "0rem", duration: "26s", direction: "down" as const },
  { offset: "3rem", duration: "34s", direction: "up" as const },
  { offset: "-1.5rem", duration: "22s", direction: "down" as const },
  { offset: "4rem", duration: "30s", direction: "up" as const },
];

export function HeroMosaic({ tiles }: HeroMosaicProps) {
  const prefersReducedMotion = useReducedMotion();

  const columns = COLUMNS.map((column, index) => ({
    column,
    items: tiles.slice(index * COLUMN_SIZE, index * COLUMN_SIZE + COLUMN_SIZE),
  }));

  return (
    <div className="hero-mosaic-edge-mask grid h-full grid-cols-2 gap-3 overflow-hidden rounded-sm lg:grid-cols-4">
      {columns.map(({ column, items }, columnIndex) => {
        const trackItems = prefersReducedMotion ? items : [...items, ...items];
        return (
          <div key={columnIndex} className="overflow-hidden" style={{ marginTop: column.offset }}>
            <div
              className={
                prefersReducedMotion
                  ? "flex flex-col gap-3"
                  : `testimonial-track testimonial-track--${column.direction} flex flex-col gap-3`
              }
              style={prefersReducedMotion ? undefined : { animationDuration: column.duration }}
            >
              {trackItems.map((tile, itemIndex) => (
                <div
                  key={itemIndex}
                  className="overflow-hidden rounded-sm"
                  style={{ aspectRatio: tile.aspectRatio.replace(":", " / ") }}
                >
                  <Image
                    src={tile.src}
                    alt={tile.alt}
                    width={400}
                    height={400}
                    loading={columnIndex === 0 && itemIndex === 0 ? "eager" : "lazy"}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
