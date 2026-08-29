import { motion as motionTokens } from "../../shared/design/tokens";

export const easing = {
  base: motionTokens.easing.base,
} as const;

export const duration = {
  reduced: motionTokens.duration.reduced,
  fast: motionTokens.duration.fast,
  base: motionTokens.duration.base,
} as const;

export interface RevealStyle {
  readonly opacity: number;
  readonly transform: string;
  readonly transition: string;
}

/** Standard scroll reveal: opacity 0→1, translateY(24px→0). Collapses to opacity-only under reduced motion. */
export function revealStyle(isVisible: boolean, prefersReducedMotion: boolean): RevealStyle {
  if (prefersReducedMotion) {
    return {
      opacity: isVisible ? 1 : 0,
      transform: "none",
      transition: `opacity ${duration.reduced}ms ${easing.base}`,
    };
  }
  return {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translateY(0)" : "translateY(24px)",
    transition: `opacity ${duration.base}ms ${easing.base}, transform ${duration.base}ms ${easing.base}`,
  };
}

/** Stagger delay in ms for the nth item (0-indexed) of a revealing group. */
export function staggerDelay(index: number, stepMs = 60): number {
  return index * stepMs;
}
