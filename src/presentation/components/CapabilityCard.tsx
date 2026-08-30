"use client";

import type { PointerEvent } from "react";
import { useRef } from "react";
import type { ServiceOffering } from "../../domain/services/entities/ServiceOffering";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface CapabilityCardProps {
  readonly capability: ServiceOffering;
  /** Two-digit index, 01–06. Presentational only — see the `aria-hidden` note below. */
  readonly numeral: string;
  /** Diagonal entry delay, computed by the section from the card's row and column. */
  readonly delayMs: number;
}

/**
 * One capability: a structural numeral, the title, the descriptor, and nothing else. The
 * numeral is what gives a text-only tile something to be anchored by — it does the job an
 * icon or a thumbnail would do in a card that had one, without adding either.
 *
 * It carries `aria-hidden` because it is a visual index of an unordered set of six
 * capabilities, not part of the copy: read aloud, "zero one" before "Creative Design" is
 * noise. That also keeps it out of axe's contrast rule, which is the right outcome — at
 * ink-12 it is deliberately far below the text floor, and it is allowed to be, precisely
 * because it carries no meaning a reader would miss.
 */
export function CapabilityCard({ capability, numeral, delayMs }: CapabilityCardProps) {
  const [revealRef, isInView] = useInView<HTMLDivElement>({ threshold: 0.15, once: true });
  const prefersReducedMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);

  /**
   * Written straight to the element rather than held in state: this fires on every
   * pointer move, and a re-render per frame to reposition a background gradient would
   * cost more than the effect is worth.
   */
  function trackCursor(event: PointerEvent<HTMLDivElement>): void {
    const card = cardRef.current;
    if (!card) {
      return;
    }
    const bounds = card.getBoundingClientRect();
    card.style.setProperty("--glow-x", `${event.clientX - bounds.left}px`);
    card.style.setProperty("--glow-y", `${event.clientY - bounds.top}px`);
  }

  return (
    // The observed box and the clipped box have to be different elements. A fully clipped
    // element reports an empty intersection rectangle, so an observer on the clipped box
    // never sees it become visible — it would stay clipped, and unhittable, forever. The
    // outer div is never clipped, so it can watch for the card arriving.
    <div ref={revealRef} className="h-full">
      <div
        className="capability-reveal h-full"
        data-visible={isInView}
        style={{ transitionDelay: prefersReducedMotion ? "0ms" : `${delayMs}ms` }}
      >
        <div
          ref={cardRef}
          className="card-surface capability-card flex h-full flex-col p-8"
          {...(prefersReducedMotion ? {} : { onPointerMove: trackCursor })}
        >
          {prefersReducedMotion ? null : <span className="capability-glow" aria-hidden="true" />}

          <span
            className="capability-numeral decorative-numeral tabular text-display-l font-medium text-ink-12"
            data-numeral={numeral}
            aria-hidden="true"
          />

          <div className="relative mt-auto pt-12">
            <span className="capability-arrow text-accent" aria-hidden="true">
              &rarr;
            </span>
            <p className="text-display-s font-medium text-ink">{capability.title}</p>
            <p className="text-body mt-3 text-ink-70">{capability.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
