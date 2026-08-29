"use client";

import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface ClipNumberProps {
  readonly value: string;
  readonly className?: string;
}

/**
 * A step numeral that clips up from its own baseline as the step enters view, rather
 * than arriving with the rest of the card. It carries its own observer so each number
 * fires on its own step, not on the group.
 */
export function ClipNumber({ value, className = "" }: ClipNumberProps) {
  const [ref, isInView] = useInView<HTMLSpanElement>({ threshold: 0.4, once: true });
  const prefersReducedMotion = useReducedMotion();

  return (
    <span
      ref={ref}
      className={`inline-block overflow-hidden align-bottom ${className}`}
      style={{ paddingBottom: "0.14em", marginBottom: "-0.14em" }}
    >
      <span
        className="tabular inline-block"
        style={{
          transform: prefersReducedMotion || isInView ? "translateY(0)" : "translateY(110%)",
          opacity: isInView ? 1 : 0,
          transitionProperty: "transform, opacity",
          transitionDuration: prefersReducedMotion ? "120ms" : "560ms",
          transitionTimingFunction: "var(--ease-base)",
        }}
      >
        {value}
      </span>
    </span>
  );
}
