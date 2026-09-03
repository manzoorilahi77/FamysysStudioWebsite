"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { MediaView } from "../lib/viewModels";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { MosaicLightbox } from "./MosaicLightbox";

/**
 * Three columns. Four made every tile small enough that the photography turned into
 * texture; three gives each still room to read. Eight tiles split 3 / 3 / 2.
 *
 * Base drift is slow on purpose — roughly half what it was — so it reads as a drift
 * rather than a scroll. The outer columns run up and the middle runs down; scrolling
 * flips all three, eased rather than snapped, and briefly accelerates them in
 * proportion to scroll velocity.
 */
const COLUMNS = [
  { size: 3, offsetRem: 0, speed: 22, baseDirection: -1 },
  { size: 3, offsetRem: 3, speed: 30, baseDirection: 1 },
  { size: 2, offsetRem: -2, speed: 26, baseDirection: -1 },
] as const;

/** Tiles a single loop copy must contain before it is tall enough to fill the column. */
const MIN_TILES_PER_COPY = 5;
/** Seconds for the reversal to settle — the ease that stops it snapping. */
const DIRECTION_TAU_S = 0.45;
/** Seconds for a scroll burst to decay back to base speed. */
const BOOST_TAU_S = 0.6;
/** Scroll pixels needed to reach the ceiling; the boost is capped so it stays a drift. */
const BOOST_PER_PIXEL = 0.035;
const BOOST_MAX = 6;
/** Scrolling while the cursor is over the mosaic rushes the columns much harder. */
const HOVER_BOOST_PER_PIXEL = 0.12;
const HOVER_BOOST_MAX = 14;

interface HeroMosaicProps {
  readonly tiles: ReadonlyArray<MediaView>;
}

function ExpandCursorBadge() {
  return (
    <span className="hero-mosaic-cursor-badge">
      Expand
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path
          d="M6 1v10M1 6h10"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function HeroMosaic({ tiles }: HeroMosaicProps) {
  const prefersReducedMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const trackRefs = useRef<Array<HTMLDivElement | null>>([]);
  const tileRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const lastFocusedIndex = useRef<number | null>(null);
  // Read by the drift loop each scroll event; a ref so hovering never restarts the effect.
  const isHoveringRef = useRef(false);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const [isCursorActive, setCursorActive] = useState(false);
  // The cursor portals to <body>; gate it until mount so SSR never touches `document`.
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Position is written straight to the node — routing every mousemove through state
  // would re-render the whole mosaic per frame. The active flag IS state, but React
  // bails out when the value has not changed, so it only re-renders on the boundary
  // between a tile and a gap: the disc shows over the photographs, the native arrow
  // stays over the gaps between them.
  const moveCursor = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") {
      return;
    }
    const node = cursorRef.current;
    if (node) {
      node.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    }
    const target = event.target instanceof Element ? event.target : null;
    setCursorActive(Boolean(target?.closest(".hero-mosaic-tile")));
  }, []);

  let cursor = 0;
  const columns = COLUMNS.map((column) => {
    const items = tiles.slice(cursor, cursor + column.size);
    const startIndex = cursor;
    cursor += column.size;
    return { column, items, startIndex };
  });

  // The drift loop translates a track by exactly half its height, so one copy has to be
  // at least as tall as the column or a gap scrolls into view at the bottom.
  const buildTrack = (items: ReadonlyArray<MediaView>): ReadonlyArray<MediaView> => {
    const repeats = Math.max(1, Math.ceil(MIN_TILES_PER_COPY / Math.max(1, items.length)));
    const copy = Array.from({ length: repeats }, () => items).flat();
    return [...copy, ...copy];
  };

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }
    const tracks = trackRefs.current.filter((node): node is HTMLDivElement => node !== null);
    if (tracks.length === 0) {
      return;
    }

    const positions = tracks.map(() => 0);
    // +1 keeps each column's own base direction, -1 reverses all of them together.
    let directionTarget = 1;
    let direction = 1;
    let boost = 1;
    let lastScrollY = window.scrollY;
    let lastFrame = performance.now();
    let frame = 0;

    function handleScroll(): void {
      const delta = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      if (delta === 0) {
        return;
      }
      directionTarget = delta > 0 ? -1 : 1;
      const perPixel = isHoveringRef.current ? HOVER_BOOST_PER_PIXEL : BOOST_PER_PIXEL;
      const max = isHoveringRef.current ? HOVER_BOOST_MAX : BOOST_MAX;
      boost = Math.min(max, boost + Math.abs(delta) * perPixel);
    }

    function step(now: number): void {
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;

      // Exponential approach — frame-rate independent, and it eases rather than snaps.
      direction += (directionTarget - direction) * (1 - Math.exp(-dt / DIRECTION_TAU_S));
      boost += (1 - boost) * (1 - Math.exp(-dt / BOOST_TAU_S));

      tracks.forEach((track, index) => {
        const config = COLUMNS[index];
        if (!config) {
          return;
        }
        const period = track.scrollHeight / 2;
        if (period <= 0) {
          return;
        }
        const next =
          (positions[index] ?? 0) + config.speed * config.baseDirection * direction * boost * dt;
        // Wrap into (-period, 0] so the duplicated copy always covers the seam.
        positions[index] = ((next % period) - period) % period;
        track.style.transform = `translate3d(0, ${positions[index]}px, 0)`;
      });

      frame = requestAnimationFrame(step);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    frame = requestAnimationFrame(step);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(frame);
    };
  }, [prefersReducedMotion]);

  const closeLightbox = useCallback(() => {
    setOpenIndex(null);
    const index = lastFocusedIndex.current;
    if (index !== null) {
      tileRefs.current[index]?.focus();
    }
  }, []);

  return (
    <>
      {/* role="group", because `aria-label` is prohibited on a plain <div> — it has no
          role for a name to attach to, and axe reports the attribute as having no effect.
          The element is not decoration: it holds eight buttons that each open the same
          lightbox, which is what `group` is for. The label names that set. */}
      <div
        className="hero-mosaic"
        role="group"
        aria-label="Studio production stills"
        onPointerEnter={(event) => {
          isHoveringRef.current = true;
          moveCursor(event);
        }}
        onPointerMove={moveCursor}
        onPointerLeave={() => {
          isHoveringRef.current = false;
          setCursorActive(false);
        }}
      >
        {columns.map(({ column, items, startIndex }, columnIndex) => {
          const trackItems = prefersReducedMotion ? items : buildTrack(items);
          return (
            <div
              key={columnIndex}
              className={`hero-mosaic-column ${columnIndex === 2 ? "hidden lg:block" : ""}`}
              style={{ marginTop: `${column.offsetRem}rem` }}
            >
              <div
                ref={(node) => {
                  trackRefs.current[columnIndex] = node;
                }}
                className="hero-mosaic-track"
              >
                {trackItems.map((tile, itemIndex) => {
                  // Only the first pass through the tiles is announced or focusable;
                  // the repeats exist to make the loop seamless.
                  const isRepeat = itemIndex >= items.length;
                  const tileIndex = startIndex + itemIndex;
                  return (
                    <button
                      key={itemIndex}
                      type="button"
                      ref={(node) => {
                        if (!isRepeat) {
                          tileRefs.current[tileIndex] = node;
                        }
                      }}
                      className="hero-mosaic-tile"
                      style={{ aspectRatio: tile.aspectRatio.replace(":", " / ") }}
                      tabIndex={isRepeat ? -1 : 0}
                      aria-hidden={isRepeat ? true : undefined}
                      onClick={() => {
                        lastFocusedIndex.current = tileIndex;
                        setOpenIndex(tileIndex);
                      }}
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
                        className="hero-mosaic-media h-full w-full object-cover"
                      />
                      <span className="hero-mosaic-scrim" aria-hidden="true" />
                      <span className="sr-only">{isRepeat ? "" : `Enlarge: ${tile.alt}`}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {/* The custom cursor, portalled to <body>. It cannot live inside the mosaic frame:
          the frame's mask-image would clip it, and the `.enter-scale` ancestor keeps a
          transform after its entrance, which turns that element into the containing block
          for `position: fixed` — the disc would anchor to the frame, not the viewport.
          Position is written directly in moveCursor; the class only toggles the scale. */}
      {isMounted
        ? createPortal(
            <div
              ref={cursorRef}
              className={`hero-mosaic-cursor${isCursorActive ? " is-active" : ""}`}
              aria-hidden="true"
            >
              <ExpandCursorBadge />
            </div>,
            document.body,
          )
        : null}
      <MosaicLightbox
        tiles={tiles}
        openIndex={openIndex}
        onClose={closeLightbox}
        onNavigate={setOpenIndex}
      />
    </>
  );
}
