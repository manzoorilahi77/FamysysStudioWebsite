"use client";

import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface DrawnRuleProps {
  /**
   * Drives the draw from a parent's observer, so a group of rules can be sequenced from
   * one trigger. Left undefined, the rule watches for itself.
   */
  readonly isVisible?: boolean | undefined;
  readonly delayMs?: number;
  readonly dark?: boolean;
  readonly className?: string;
}

/**
 * A hairline that draws itself left to right as it enters — the gesture the homepage's
 * process rail and reason rows already make, as a component so /about can put it on the
 * edge of every section rather than hand-rolling a pseudo-element eight times.
 *
 * Purely decorative, and out of the accessibility tree. It is a scaleX on the element
 * itself rather than a growing width, so it animates on the compositor, and under reduced
 * motion the stylesheet holds it at full length from the first paint.
 */
export function DrawnRule({
  isVisible,
  delayMs = 0,
  dark = false,
  className = "",
}: DrawnRuleProps) {
  const [ref, isSelfInView] = useInView<HTMLDivElement>({ threshold: 0.5, once: true });
  const prefersReducedMotion = useReducedMotion();
  const hasDrawn = prefersReducedMotion || (isVisible ?? isSelfInView);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`drawn-rule ${dark ? "drawn-rule--dark" : ""} ${className}`}
      data-visible={hasDrawn}
      style={{ transitionDelay: prefersReducedMotion ? "0ms" : `${delayMs}ms` }}
    />
  );
}
