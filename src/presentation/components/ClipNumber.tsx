"use client";

import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface ClipNumberProps {
  readonly value: string;
  readonly className?: string;
  /**
   * Drives the clip from outside instead of from the numeral's own observer. Needed where
   * the numerals belong to a sequence that has to fire in order from one trigger — five
   * numerals on a single row all become visible at the same instant, so left to
   * themselves they would arrive together rather than one after another.
   */
  readonly isVisible?: boolean | undefined;
  readonly delayMs?: number;
  /**
   * Renders the digits as generated content instead of as a text node, for numerals that
   * are presentational rather than content. See `.decorative-numeral` in globals.css for
   * why that distinction has to be made in CSS rather than with `aria-hidden`.
   */
  readonly isDecorative?: boolean;
}

/**
 * A numeral that clips up from its own baseline as it arrives. By default it carries its
 * own observer so each number fires on its own; pass `isVisible` to sequence it from a
 * parent instead.
 */
export function ClipNumber({
  value,
  className = "",
  isVisible,
  delayMs = 0,
  isDecorative = false,
}: ClipNumberProps) {
  const [ref, isSelfInView] = useInView<HTMLSpanElement>({ threshold: 0.4, once: true });
  const prefersReducedMotion = useReducedMotion();
  const hasArrived = isVisible ?? isSelfInView;

  return (
    <span
      ref={ref}
      className={`inline-block overflow-hidden align-bottom ${className}`}
      style={{ paddingBottom: "0.14em", marginBottom: "-0.14em" }}
    >
      <span
        className={`tabular inline-block${isDecorative ? " decorative-numeral" : ""}`}
        {...(isDecorative ? { "data-numeral": value } : {})}
        style={{
          transform: prefersReducedMotion || hasArrived ? "translateY(0)" : "translateY(110%)",
          opacity: prefersReducedMotion || hasArrived ? 1 : 0,
          transitionProperty: "transform, opacity",
          transitionDuration: prefersReducedMotion ? "120ms" : "560ms",
          transitionDelay: prefersReducedMotion ? "0ms" : `${delayMs}ms`,
          transitionTimingFunction: "var(--ease-base)",
        }}
      >
        {isDecorative ? null : value}
      </span>
    </span>
  );
}
