"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Which step of a sequence the reader is currently on, derived from how far the section
 * has travelled through the viewport rather than from each step's own visibility. An
 * observer per step would light several at once on a wide screen, where all five sit on
 * one row and enter together; dividing the section's scrolled extent into equal bands
 * gives exactly one active step at a time, which is what the sequence is for.
 *
 * Reads are batched into an animation frame, so a scroll burst measures once per paint.
 */
export function useActiveStep<T extends HTMLElement>(
  stepCount: number,
): readonly [React.RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (stepCount <= 0) {
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
      const progress = (window.innerHeight / 2 - rect.top) / rect.height;
      // Clamped just below 1 so the final step wins the last band rather than
      // `floor` rolling over into a step that does not exist.
      const clamped = Math.min(Math.max(progress, 0), 0.9999);
      setActiveIndex(Math.floor(clamped * stepCount));
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
  }, [stepCount]);

  return [ref, activeIndex] as const;
}
