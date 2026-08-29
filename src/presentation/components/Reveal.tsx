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

/** Standard scroll reveal: opacity 0→1, translateY(24px→0), triggers at 15% visibility, fires once. */
export function Reveal({ children, index = 0, staggerStepMs = 60, className = "" }: RevealProps) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.15, once: true });
  const prefersReducedMotion = useReducedMotion();
  const style = revealStyle(isInView, prefersReducedMotion);

  return (
    <div
      ref={ref}
      className={className}
      style={{ ...style, transitionDelay: `${staggerDelay(index, staggerStepMs)}ms` }}
    >
      {children}
    </div>
  );
}
