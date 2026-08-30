"use client";

import { useEffect, useState } from "react";

/** How far below the sticky index a section's top must sit before it counts as current. */
const ACTIVATION_OFFSET_PX = 24;

/**
 * Which of a set of anchored sections the reader is currently in.
 *
 * An `IntersectionObserver` per section is the obvious approach and the wrong one here:
 * these sections are taller than the viewport, so the entry that "is intersecting" can be
 * two at once during a transition, and none at all is impossible to express. Instead the
 * active section is the last one whose top has passed the reading line — a single ordered
 * comparison that always yields exactly one answer.
 *
 * The reading line sits just under the sticky index, so a section becomes current when its
 * heading clears the bar rather than when its first pixel enters the viewport.
 *
 * Reads are batched into an animation frame, so a scroll burst measures once per paint.
 */
export function useActiveAnchor(
  ids: ReadonlyArray<string>,
  offsetPx: number,
): string | undefined {
  const [activeId, setActiveId] = useState<string | undefined>(ids[0]);
  // Depending on the array identity would re-subscribe on every render, since the caller
  // builds it inline from its own props.
  const key = ids.join("|");

  useEffect(() => {
    const sectionIds = key.split("|").filter((id) => id.length > 0);
    if (sectionIds.length === 0) {
      return;
    }

    let frame = 0;

    function measure(): void {
      frame = 0;
      const line = offsetPx + ACTIVATION_OFFSET_PX;
      let current = sectionIds[0];
      for (const id of sectionIds) {
        const node = document.getElementById(id);
        if (node && node.getBoundingClientRect().top <= line) {
          current = id;
        }
      }
      setActiveId(current);
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
  }, [key, offsetPx]);

  return activeId;
}
