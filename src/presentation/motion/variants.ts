import { motion as motionTokens } from "../../shared/design/tokens";

export const easing = {
  base: motionTokens.easing.base,
} as const;

export const duration = {
  reduced: motionTokens.duration.reduced,
  fast: motionTokens.duration.fast,
  base: motionTokens.duration.base,
} as const;

/**
 * LONGHAND, not the `transition` shorthand, and that is the whole point of the shape.
 *
 * Every caller spreads this and then adds its own `transitionDelay` — the stagger. React
 * refuses to mix a shorthand and a longhand for the same property in one style object and
 * logs "Updating a style property during rerender when a conflicting property is set can
 * lead to styling bugs" on every re-render that touches the delay. It was doing exactly
 * that: six times on the homepage, three on /about, three on /how-we-work. The warning is
 * not cosmetic — which of the two wins is not guaranteed, so the stagger was one React
 * scheduling decision away from being silently dropped.
 */
export interface RevealStyle {
  readonly opacity: number;
  readonly transform: string;
  readonly transitionProperty: string;
  readonly transitionDuration: string;
  readonly transitionTimingFunction: string;
}

/** Standard scroll reveal: opacity 0→1, translateY(24px→0). Collapses to opacity-only under reduced motion. */
export function revealStyle(isVisible: boolean, prefersReducedMotion: boolean): RevealStyle {
  if (prefersReducedMotion) {
    return {
      opacity: isVisible ? 1 : 0,
      transform: "none",
      transitionProperty: "opacity",
      transitionDuration: `${duration.reduced}ms`,
      transitionTimingFunction: easing.base,
    };
  }
  return {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translateY(0)" : "translateY(24px)",
    transitionProperty: "opacity, transform",
    transitionDuration: `${duration.base}ms`,
    transitionTimingFunction: easing.base,
  };
}

/** Stagger delay in ms for the nth item (0-indexed) of a revealing group. */
export function staggerDelay(index: number, stepMs = 60): number {
  return index * stepMs;
}
