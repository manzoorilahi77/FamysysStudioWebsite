"use client";

import { useEffect, useRef, useState } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * The read line. Progress starts when the element's top passes 82% of the viewport — a
 * little above the fold, where reading actually begins rather than where the element
 * technically enters — and reaches 1 when its bottom passes the same line.
 */
const READ_LINE = 0.82;

/**
 * How far the reader has travelled through one element, 0 to 1.
 *
 * Scroll-linked rather than threshold-triggered: an observer can say "this arrived", which
 * is what `useInView` is for, but it cannot say "you are two thirds of the way down this
 * list" — and a rail that fills continuously is the only honest way to draw that.
 *
 * Reads are batched into an animation frame, so a scroll burst measures once per paint,
 * and the value is only committed when it moves by a hundredth. Without that floor this
 * sets state on nearly every frame of every scroll, for a line whose length is being
 * rounded to the pixel anyway.
 *
 * Under `prefers-reduced-motion` it is pinned to 1: the rail is drawn, complete, and never
 * moves again. A line that grows as the page scrolls is animation whether or not anything
 * about it eases.
 */
export function useScrollProgress<T extends HTMLElement>(): readonly [
  React.RefObject<T | null>,
  number,
] {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) {
      setProgress(1);
      return;
    }

    let frame = 0;

    function measure(): void {
      frame = 0;
      const node = ref.current;
      if (!node) {
        return;
      }
      const rect = node.getBoundingClientRect();
      if (rect.height <= 0) {
        return;
      }
      const line = window.innerHeight * READ_LINE;
      const next = Math.min(Math.max((line - rect.top) / rect.height, 0), 1);
      setProgress((current) => (Math.abs(current - next) < 0.01 ? current : next));
    }

    function schedule(): void {
      if (frame === 0) {
        frame = window.requestAnimationFrame(measure);
      }
    }

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  return [ref, progress] as const;
}
