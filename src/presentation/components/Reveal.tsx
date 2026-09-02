"use client";

import type { ReactNode } from "react";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { revealStyle, staggerDelay } from "../motion/variants";

interface RevealProps {
  readonly children: ReactNode;
  readonly index?: number;
  readonly staggerStepMs?: number;
  readonly className?: string;
}

/**
 * Standard scroll reveal: opacity 0→1, translateY(24px→0), triggers at 15% visibility,
 * fires once.
 *
 * The stagger is dropped under reduced motion, not just shortened. The global
 * `prefers-reduced-motion` rule in globals.css collapses every transition DURATION with
 * `!important`, but a transition-delay is not a duration and was surviving it — so a
 * staggered group still arrived one item at a time, over as long as the stagger took.
 * A sequence is motion whether or not each step of it moves.
 */
export function Reveal({ children, index = 0, staggerStepMs = 60, className = "" }: RevealProps) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.15, once: true });
  const prefersReducedMotion = useReducedMotion();
  const style = revealStyle(isInView, prefersReducedMotion);
  const delayMs = prefersReducedMotion ? 0 : staggerDelay(index, staggerStepMs);

  return (
    <div ref={ref} className={className} style={{ ...style, transitionDelay: `${delayMs}ms` }}>
      {children}
    </div>
  );
}
