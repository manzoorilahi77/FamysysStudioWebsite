"use client";

import { useEffect, useRef, useState } from "react";

/** The sequence pins from `lg` up, where the five steps sit on one row. */
const PIN_QUERY = "(min-width: 1024px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

interface ScrollSequence<T> {
  /** Goes on the TRACK — the tall element the sticky stage travels inside. */
  readonly ref: React.RefObject<T | null>;
  /** How many steps have arrived, 1-based. Equals `stepCount` whenever the pin is off. */
  readonly revealedCount: number;
  /** Whether the pin is running, so the section can drop it out of the markup when not. */
  readonly isPinned: boolean;
}

/**
 * A section that holds still while its steps arrive one at a time, then releases.
 *
 * NOTHING HERE HIJACKS SCROLLING. The stage is `position: sticky` inside a track several
 * viewports tall, so the page keeps scrolling at exactly the rate the reader asks for —
 * the stage simply stays put while the track passes it, which is what makes the section
 * look pinned. Wheel and touch events are never cancelled, the scrollbar stays honest, and
 * Home/End/PageDown/space and find-in-page all behave normally. A section that swallowed
 * scroll events would fail all of that, and would trap anyone driving by keyboard.
 *
 * `revealedCount` is the track's progress cut into equal bands: the first step is showing
 * the moment the stage locks, and the last band is spent with all of them up, so the
 * sequence finishes reading before the section lets go.
 *
 * The pin is off below `lg` — five steps stacked vertically cannot fit one viewport, so
 * pinning them would produce a stage that scrolls inside a section that does not — and off
 * under `prefers-reduced-motion`, where the whole point of the effect is the motion. In
 * both cases every step is revealed and the section is an ordinary block. It also starts in
 * that state on the server and before the first measurement, so the section renders
 * complete without JavaScript rather than as one step and four blanks.
 */
export function useScrollSequence<T extends HTMLElement>(stepCount: number): ScrollSequence<T> {
  const ref = useRef<T>(null);
  const [isPinned, setIsPinned] = useState(false);
  const [revealedCount, setRevealedCount] = useState(stepCount);

  useEffect(() => {
    if (stepCount <= 0) {
      return;
    }

    const wideEnough = window.matchMedia(PIN_QUERY);
    const prefersReducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
    let pinned = false;
    let frame = 0;

    function measure(): void {
      frame = 0;
      const node = ref.current;
      if (!node || !pinned) {
        return;
      }
      const rect = node.getBoundingClientRect();
      // How far the stage can travel inside the track. Zero or less means the track is not
      // taller than the viewport — nothing to pin against, so show the whole sequence.
      const travel = rect.height - window.innerHeight;
      if (travel <= 0) {
        setRevealedCount(stepCount);
        return;
      }
      const progress = Math.min(Math.max(-rect.top / travel, 0), 1);
      setRevealedCount(Math.min(stepCount, 1 + Math.floor(progress * stepCount)));
    }

    function schedule(): void {
      if (frame === 0) {
        frame = window.requestAnimationFrame(measure);
      }
    }

    function apply(): void {
      pinned = wideEnough.matches && !prefersReducedMotion.matches;
      setIsPinned(pinned);
      if (!pinned) {
        setRevealedCount(stepCount);
        return;
      }
      schedule();
    }

    // Turning the pin on is what gives the track its height, and that height does not exist
    // until React has committed the attribute and the browser has re-laid-out. Measuring on
    // the next frame alone was a race — it read the collapsed track often enough to open the
    // section with all five steps up instead of one. The observer removes the guesswork: the
    // track's own height change is the signal, so the first real measurement happens when
    // there is something to measure, and every later reflow re-measures for free.
    const trackResize = new ResizeObserver(schedule);

    apply();
    if (ref.current) {
      trackResize.observe(ref.current);
    }
    wideEnough.addEventListener("change", apply);
    prefersReducedMotion.addEventListener("change", apply);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      wideEnough.removeEventListener("change", apply);
      prefersReducedMotion.removeEventListener("change", apply);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      trackResize.disconnect();
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [stepCount]);

  return { ref, revealedCount, isPinned };
}
