"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

/**
 * THE HERO'S ONE ANIMATION LOOP.
 *
 * Everything the hero moves per frame is driven from here: the level meter painted into
 * the canvas, the copy column's lift, which accordion band is open, and the two magnetic
 * buttons. One `requestAnimationFrame` and one 2d context for the whole section — the
 * hero this replaced ran its own loop for the mosaic drift, and adding a background loop
 * beside it would have meant two schedulers competing for the same frame.
 *
 * NOTHING HERE READS LAYOUT PER FRAME. Geometry is measured on load, on resize, once the
 * fonts settle and whenever the section's own box changes; every per-frame write is a
 * transform, a class toggle or a fill into the canvas. The pointer arrives in viewport
 * coordinates from the event and is used as-is.
 *
 * The loop is stopped while the hero is off screen. The hero is one viewport tall at the
 * top of a nine-section page, so for most of a reader's time on the page there is nothing
 * for it to paint.
 *
 * Under `prefers-reduced-motion` the loop never starts. The meter is painted once, warmed
 * to a settled state so it reads as a level meter at rest rather than as 64 bars at their
 * seed height, and no listeners are attached. The accordion opens on its first band and
 * scrolling does not change it.
 */

/** Bars in the meter. */
const BAR_COUNT = 64;
/** Fraction of a bar's width left empty between one bar and the next. */
const BAR_GAP_RATIO = 0.22;
/** How the wave is scaled into the canvas height before the ceiling is applied. */
const BAR_SCALE = 0.86;
/**
 * THE CEILING. The bars used to be free to reach 0.86 of the hero — about 126px from the
 * top of a 900px viewport, with the fixed bar occupying the first 80 — so on a fast scroll
 * with the pointer high the tallest of them ran into the navigation, which reads as the
 * background hitting the furniture rather than as a meter.
 *
 * The ceiling is measured, not guessed: the tallest bar stops level with the TOP EDGE OF
 * THE FIRST BAND of the accordion on the right, which is the highest thing in the hero
 * that is not the bar itself and sits comfortably below it. Measured on the same schedule
 * as everything else here — load, resize, fonts, and the section's own box — never per
 * frame.
 *
 * It is a CLAMP, not a scale. The wave, the bulge under the pointer and the scroll lift
 * are all computed exactly as before and only the RESULT is cut, so a bar below the
 * ceiling still answers the cursor and the scroll with its full range; what changes is
 * that the ones that would have gone over now sit level at the line, which is what a meter
 * hitting its limit does anyway.
 */
const BAR_CEILING_FALLBACK = 0.86;
/**
 * How low the measured ceiling may go, as a fraction of the canvas height. Below 900px the
 * accordion moves UNDER the copy and lies along the bottom of the hero, so its first band's
 * top edge is a quarter of the way up and would flatten the meter to a strip. The bars pass
 * behind the accordion at that width — it is painted over them — so the floor is what keeps
 * the field reading as a level meter on a phone. There is no navigation to run into down
 * there: half the hero's height clears the bar several times over.
 */
const BAR_CEILING_FLOOR = 0.5;
/** How fast a bar chases its target height, per frame — this is what reads as inertia. */
const BAR_EASE = 0.1;
/** Height of the accent cap sitting on each bar, in CSS pixels. */
const BAR_CAP_PX = 2;
/** How far from the pointer, in CSS pixels, a bar still feels the bulge. */
const BULGE_REACH_PX = 360;
/** Peak height the bulge adds to a bar directly under the pointer. */
const BULGE_GAIN = 0.62;
/** Half-width of the playhead's glow, in CSS pixels. */
const PLAYHEAD_REACH_PX = 90;

/** Scroll pixels per frame that count as full speed for the meter's lift. */
const SCROLL_SPEED_FULL = 30;
/** How much lift is always present, before any scrolling. */
const LIFT_FLOOR = 0.16;
/** How much more the lift adds at full scroll speed. */
const LIFT_RANGE = 0.42;

/** Smoothing on the scroll velocity, per frame. */
const SCROLL_EASE = 0.22;
/** Smoothing on a magnetic button's travel, per frame. */
const MAGNET_EASE = 0.16;
/** How far a magnetic button follows the pointer, as a fraction of the offset. */
const MAGNET_PULL_X = 0.3;
const MAGNET_PULL_Y = 0.4;
/** Below this the button is at rest and its transform stops being rewritten. */
const MAGNET_REST_PX = 0.05;

/** Peak lift of the copy column as the hero crosses the viewport centre, in pixels. */
const BODY_LIFT_PX = 40;

/**
 * The meter is a wash, not an image, and at two or three device pixels per CSS pixel it
 * costs three to nine times the fill for a difference nobody can see on a soft field of
 * flat rectangles. Capped at 1.
 */
const MAX_PIXEL_RATIO = 1;

/** Frames stepped before the still frame is shown, so the bars are settled, not seeded. */
const STILL_WARMUP_FRAMES = 46;
/** Milliseconds between those warm-up frames — roughly a 60fps run-up. */
const STILL_WARMUP_STEP_MS = 16;
/** Where in the wave the still frame is taken. Chosen for a legible spread of heights. */
const STILL_START_MS = 5200;
/** Scroll lift baked into the still frame, so it does not read as a flat-lined meter. */
const STILL_LIFT = 0.24;

type Rgb = readonly [number, number, number];

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/**
 * A `--color-*` custom property, as three channels. The generated stylesheet writes every
 * palette value as a lowercase six-digit hex, so this reads the token system rather than
 * naming a colour: change colors.ts and the meter moves with the rest of the site. The
 * fallbacks exist only for the frame before the stylesheet has applied.
 */
function readColor(element: Element, property: string, fallback: Rgb): Rgb {
  const raw = getComputedStyle(element).getPropertyValue(property).trim();
  if (!/^#[0-9a-f]{6}$/i.test(raw)) {
    return fallback;
  }
  const parsed = Number.parseInt(raw.slice(1), 16);
  return [(parsed >> 16) & 255, (parsed >> 8) & 255, parsed & 255];
}

function rgba(color: Rgb, alpha: number): string {
  return `rgba(${color[0]},${color[1]},${color[2]},${alpha})`;
}

interface MeterFrame {
  /** Milliseconds, straight from the frame callback. Drives the three sine terms. */
  readonly time: number;
  /** Pointer X in CSS pixels, or null while the pointer has never been over the page. */
  readonly pointerX: number | null;
  /** Scroll speed, 0 at rest and 1 at `SCROLL_SPEED_FULL`. */
  readonly scrollSpeed: number;
}

interface Meter {
  readonly step: (frame: MeterFrame) => void;
  readonly resize: () => void;
  /** The tallest a bar may draw, in CSS pixels. See `BAR_CEILING_FALLBACK`. */
  readonly setCeiling: (cssPixels: number) => void;
}

/**
 * SIXTY-FOUR BARS, three sines and a bulge under the pointer, so the ground reads as a
 * level meter responding to the reader rather than as decoration playing to itself.
 * Scroll speed raises the whole field; the pointer also drags a playhead, because a meter
 * has one and it is the thing the cursor is holding.
 */
function createMeter(canvas: HTMLCanvasElement, bars: Rgb, accent: Rgb, pixelRatio: number): Meter {
  const context = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let barWidth = 1;
  let heights: number[] = [];
  let ceiling = Number.POSITIVE_INFINITY;

  function resize(): void {
    const nextWidth = Math.max(1, Math.round(canvas.clientWidth * pixelRatio));
    const nextHeight = Math.max(1, Math.round(canvas.clientHeight * pixelRatio));
    if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
      canvas.width = nextWidth;
      canvas.height = nextHeight;
    }
    width = canvas.width;
    height = canvas.height;
    barWidth = width / BAR_COUNT;
    heights = new Array<number>(BAR_COUNT).fill(0);
  }

  function step(frame: MeterFrame): void {
    if (!context) {
      return;
    }
    context.clearRect(0, 0, width, height);

    const phase = frame.time * 0.0009;
    const pointer =
      frame.pointerX === null ? Number.NEGATIVE_INFINITY : frame.pointerX * pixelRatio;
    const lift = LIFT_FLOOR + frame.scrollSpeed * LIFT_RANGE;
    const gap = barWidth * BAR_GAP_RATIO;
    const reach = BULGE_REACH_PX * pixelRatio;

    context.fillStyle = rgba(bars, 0.62);
    for (let index = 0; index < BAR_COUNT; index += 1) {
      const x = index * barWidth;
      let level =
        0.5 +
        0.24 * Math.sin(index * 0.31 + phase * 1.9) +
        0.16 * Math.sin(index * 0.11 - phase * 1.3) +
        0.12 * Math.sin(index * 0.72 + phase * 2.7);
      const distance = Math.abs(x + barWidth * 0.5 - pointer);
      if (distance < reach) {
        level += (1 - distance / reach) * BULGE_GAIN;
      }
      level = (level - 0.32) * (0.9 + lift);
      const target = Math.min(clamp(level, 0.02, 1.2) * height * BAR_SCALE, ceiling);
      const current = heights[index] ?? 0;
      const next = current + (target - current) * BAR_EASE;
      heights[index] = next;
      context.fillRect(x + gap * 0.5, height - next, barWidth - gap, next);
    }

    // The cap is what turns a column into a reading on a meter.
    context.fillStyle = rgba(accent, 0.72);
    for (let index = 0; index < BAR_COUNT; index += 1) {
      const barHeight = heights[index] ?? 0;
      context.fillRect(
        index * barWidth + gap * 0.5,
        height - barHeight - BAR_CAP_PX * pixelRatio,
        barWidth - gap,
        BAR_CAP_PX * pixelRatio,
      );
    }

    // Every other bar carries a faint accent wash up its lower half, so the field has a
    // grain rather than reading as one flat block of the alternate ground.
    context.fillStyle = rgba(accent, 0.09);
    for (let index = 0; index < BAR_COUNT; index += 2) {
      const barHeight = heights[index] ?? 0;
      context.fillRect(
        index * barWidth + gap * 0.5,
        height - barHeight,
        barWidth - gap,
        barHeight * 0.5,
      );
    }

    if (frame.pointerX !== null) {
      const glow = PLAYHEAD_REACH_PX * pixelRatio;
      const gradient = context.createLinearGradient(pointer - glow, 0, pointer + glow, 0);
      gradient.addColorStop(0, rgba(accent, 0));
      gradient.addColorStop(0.5, rgba(accent, 0.16));
      gradient.addColorStop(1, rgba(accent, 0));
      context.fillStyle = gradient;
      context.fillRect(pointer - glow, 0, glow * 2, height);
      context.fillStyle = rgba(accent, 0.5);
      context.fillRect(pointer - pixelRatio, 0, 2 * pixelRatio, height);
    }
  }

  function setCeiling(cssPixels: number): void {
    ceiling = cssPixels * pixelRatio;
  }

  resize();
  return { step, resize, setCeiling };
}

/**
 * The tallest a bar may draw in this layout, in CSS pixels: the distance from the bottom
 * of the hero up to the top edge of the accordion's first band. Falls back to the flat
 * fraction if the accordion is not in the DOM — which it is not on the frame before the
 * bands mount, and would not be at all if the hero were ever rendered without them.
 *
 * Read from the DOM by class, the same way the two magnetic buttons are found. The bands
 * are laid out by CSS at four different sizes across two breakpoints, so measuring the one
 * that is actually on screen is the only thing that stays true at every width.
 */
function measureCeiling(section: HTMLElement): number {
  const sectionRect = section.getBoundingClientRect();
  const band = section.querySelector<HTMLElement>(".hero-final-band");
  const floor = sectionRect.height * BAR_CEILING_FLOOR;
  if (!band) {
    return sectionRect.height * BAR_CEILING_FALLBACK;
  }
  const available = sectionRect.bottom - band.getBoundingClientRect().top;
  return clamp(available, floor, sectionRect.height * BAR_CEILING_FALLBACK);
}

export interface HeroMotion {
  readonly sectionRef: React.RefObject<HTMLElement | null>;
  readonly canvasRef: React.RefObject<HTMLCanvasElement | null>;
  readonly bodyRef: React.RefObject<HTMLDivElement | null>;
  /** Which band is open. Scroll steps it; pointing at a band takes it over. */
  readonly activeBand: number;
  readonly onBandEnter: (index: number) => void;
  readonly onBandLeave: () => void;
}

export function useHeroMotion(bandCount: number): HeroMotion {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  // A ref, not state: the loop reads it every frame and a hover must not re-run the
  // effect that owns the loop.
  const hoveredBand = useRef(-1);
  const [activeBand, setActiveBand] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const onBandEnter = useCallback((index: number) => {
    hoveredBand.current = index;
  }, []);

  const onBandLeave = useCallback(() => {
    hoveredBand.current = -1;
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) {
      return;
    }

    const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
    const meter = createMeter(
      canvas,
      readColor(section, "--color-section-alt", [30, 58, 49]),
      readColor(section, "--color-accent-on-dark", [241, 235, 221]),
      pixelRatio,
    );

    if (prefersReducedMotion) {
      // One settled frame, then nothing. No listeners, no loop, no scroll response — but
      // the ceiling still applies: a still meter running into the navigation is the same
      // defect held permanently.
      meter.setCeiling(measureCeiling(section));
      for (let index = 0; index < STILL_WARMUP_FRAMES; index += 1) {
        meter.step({
          time: STILL_START_MS + index * STILL_WARMUP_STEP_MS,
          pointerX: null,
          scrollSpeed: STILL_LIFT,
        });
      }
      return;
    }

    // The two CTAs, found by their place in the hero rather than by a prop threaded
    // through `Button`. The transform has to land on the anchor itself — that is the
    // element with the pill shape and the rolling label — and `Button` deliberately does
    // not forward arbitrary attributes onto it.
    const magnets = Array.from(
      section.querySelectorAll<HTMLElement>(".hero-final-cta a"),
    ).map((element) => ({
      element,
      centreX: 0,
      centreY: 0,
      targetX: 0,
      targetY: 0,
      x: 0,
      y: 0,
      live: false,
    }));

    // Everything measured outside the loop. `top` and `height` are the hero's own box in
    // document coordinates; `viewportHeight` scales the scroll-derived values.
    let top = 0;
    let height = 0;
    let viewportHeight = window.innerHeight;
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;
    let pointerX: number | null = null;
    let frame = 0;
    let currentBand = -1;

    function measure(): void {
      const element = sectionRef.current;
      if (!element) {
        return;
      }
      const rect = element.getBoundingClientRect();
      viewportHeight = window.innerHeight;
      top = rect.top + window.scrollY;
      height = rect.height;
      meter.resize();
      meter.setCeiling(measureCeiling(element));
    }

    function handlePointerMove(event: PointerEvent): void {
      pointerX = event.clientX;
      for (const magnet of magnets) {
        if (!magnet.live) {
          continue;
        }
        magnet.targetX = (event.clientX - magnet.centreX) * MAGNET_PULL_X;
        magnet.targetY = (event.clientY - magnet.centreY) * MAGNET_PULL_Y;
      }
    }

    const magnetCleanups = magnets.map((magnet) => {
      function enter(): void {
        const rect = magnet.element.getBoundingClientRect();
        magnet.centreX = rect.left + rect.width / 2;
        magnet.centreY = rect.top + rect.height / 2;
        magnet.live = true;
      }
      function leave(): void {
        magnet.live = false;
        magnet.targetX = 0;
        magnet.targetY = 0;
      }
      magnet.element.addEventListener("pointerenter", enter);
      magnet.element.addEventListener("pointerleave", leave);
      // Written at rest too, so the inline transform always wins over `.button-motion`'s
      // hover scale rather than the two swapping on the first frame of a hover.
      magnet.element.style.transform = "translate3d(0px,0px,0)";
      return () => {
        magnet.element.removeEventListener("pointerenter", enter);
        magnet.element.removeEventListener("pointerleave", leave);
      };
    });

    function step(now: number): void {
      const scrollY = window.scrollY;
      scrollVelocity += (scrollY - lastScrollY - scrollVelocity) * SCROLL_EASE;
      lastScrollY = scrollY;

      // How far the hero has travelled out of the top of the viewport, 0 to 1, and how
      // far its centre sits from the viewport's. Every other scroll-driven value here is
      // derived from one of those two.
      const out = clamp((scrollY - top) / viewportHeight, 0, 1);
      const centreOffset = (scrollY + viewportHeight / 2 - (top + height / 2)) / viewportHeight;

      const body = bodyRef.current;
      if (body) {
        body.style.transform = `translate3d(0,${(centreOffset * -BODY_LIFT_PX).toFixed(2)}px,0)`;
      }

      const stepped = clamp(Math.floor(clamp(out, 0, 0.999) * bandCount), 0, bandCount - 1);
      const band = hoveredBand.current >= 0 ? hoveredBand.current : stepped;
      if (band !== currentBand) {
        currentBand = band;
        setActiveBand(band);
      }

      meter.step({
        time: now,
        pointerX,
        scrollSpeed: clamp(Math.abs(scrollVelocity) / SCROLL_SPEED_FULL, 0, 1),
      });

      for (const magnet of magnets) {
        magnet.x += (magnet.targetX - magnet.x) * MAGNET_EASE;
        magnet.y += (magnet.targetY - magnet.y) * MAGNET_EASE;
        if (
          magnet.live ||
          Math.abs(magnet.x) > MAGNET_REST_PX ||
          Math.abs(magnet.y) > MAGNET_REST_PX
        ) {
          magnet.element.style.transform = `translate3d(${magnet.x.toFixed(2)}px,${magnet.y.toFixed(2)}px,0)`;
        }
      }

      frame = window.requestAnimationFrame(step);
    }

    function start(): void {
      if (frame === 0) {
        lastScrollY = window.scrollY;
        frame = window.requestAnimationFrame(step);
      }
    }

    function stop(): void {
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    }

    // The hero is one viewport tall at the top of a nine-section page. Once it has
    // scrolled away there is nothing to paint, so the loop is not left running.
    const visibility = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting ?? true) {
          start();
        } else {
          stop();
        }
      },
      { threshold: 0 },
    );
    visibility.observe(section);

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(section);

    measure();
    window.addEventListener("resize", measure, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("load", measure);
    if (document.fonts?.ready) {
      void document.fonts.ready.then(measure);
    }

    return () => {
      stop();
      visibility.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("load", measure);
      for (const cleanup of magnetCleanups) {
        cleanup();
      }
    };
  }, [bandCount, prefersReducedMotion]);

  return { sectionRef, canvasRef, bodyRef, activeBand, onBandEnter, onBandLeave };
}
