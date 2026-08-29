"use client";

import Image from "next/image";
import type { MediaView } from "../lib/viewModels";
import { useReducedMotion } from "../hooks/useReducedMotion";

/**
 * Three columns rather than four. Four made every tile small enough that the
 * photography turned into texture; three gives each still room to read. Eight tiles
 * split 3 / 3 / 2, so the short column is the one carrying the tallest crops.
 *
 * Each column drifts at its own speed and direction, reusing the vertical
 * translateY(-50%) loop the testimonial track already defines. The tile list is
 * duplicated so the loop is seamless; under reduced motion it is not duplicated and
 * nothing animates.
 */
const COLUMNS = [
  { size: 3, offset: "0rem", duration: "13s", direction: "down" as const },
  { size: 3, offset: "3.5rem", duration: "19s", direction: "up" as const },
  { size: 2, offset: "-1.5rem", duration: "11s", direction: "down" as const },
];

/** Tiles a single loop copy must contain before it is tall enough to fill the column. */
const MIN_TILES_PER_COPY = 4;

interface HeroMosaicProps {
  readonly tiles: ReadonlyArray<MediaView>;
}

export function HeroMosaic({ tiles }: HeroMosaicProps) {
  const prefersReducedMotion = useReducedMotion();

  let cursor = 0;
  const columns = COLUMNS.map((column) => {
    const items = tiles.slice(cursor, cursor + column.size);
    cursor += column.size;
    return { column, items };
  });

  // The drift loop translates the track by exactly half its height, so one copy has to
  // be at least as tall as the column or a gap scrolls into view at the bottom. Two or
  // three tiles are not, hence the repeat before the copy is doubled.
  const buildTrack = (items: ReadonlyArray<MediaView>): ReadonlyArray<MediaView> => {
    const repeats = Math.max(1, Math.ceil(MIN_TILES_PER_COPY / Math.max(1, items.length)));
    const copy = Array.from({ length: repeats }, () => items).flat();
    return [...copy, ...copy];
  };

  return (
    <div className="hero-mosaic-edge-mask grid h-full grid-cols-2 gap-3 overflow-hidden rounded-sm lg:grid-cols-3">
      {columns.map(({ column, items }, columnIndex) => {
        const trackItems = prefersReducedMotion ? items : buildTrack(items);
        return (
          <div
            key={columnIndex}
            className={`overflow-hidden ${columnIndex === 2 ? "hidden lg:block" : ""}`}
            style={{ marginTop: column.offset }}
          >
            <div
              className={
                prefersReducedMotion
                  ? "flex flex-col gap-3"
                  : `testimonial-track testimonial-track--${column.direction} flex flex-col gap-3`
              }
              style={prefersReducedMotion ? undefined : { animationDuration: column.duration }}
            >
              {trackItems.map((tile, itemIndex) => {
                // Only the first pass through the tiles is announced; the repeats exist
                // to make the loop seamless and would otherwise read the same eight
                // descriptions over and over.
                const isRepeat = itemIndex >= items.length;
                return (
                  <div
                    key={itemIndex}
                    className="overflow-hidden rounded-sm"
                    style={{ aspectRatio: tile.aspectRatio.replace(":", " / ") }}
                    {...(isRepeat ? { "aria-hidden": true } : {})}
                  >
                    <Image
                      src={tile.src}
                      alt={isRepeat ? "" : tile.alt}
                      width={900}
                      height={1200}
                      sizes="(min-width: 1024px) 17vw, 45vw"
                      {...(columnIndex === 0 && itemIndex === 0
                        ? { priority: true }
                        : { loading: "lazy" as const })}
                      className="h-full w-full object-cover"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
