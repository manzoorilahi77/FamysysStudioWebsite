"use client";

import { useMediaQuery } from "./useMediaQuery";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Whether a section may add its motion layer on top of itself.
 *
 * The imagery-led sections are written the way the approved design is: the stylesheet's
 * base state is the FINAL, readable state — every sentence on the page, every panel open,
 * no picture moving — and the motion layer is only ever added over it, scoped to
 * `[data-motion="on"]`. Nothing has to be unwound for a reader who has asked for reduced
 * motion, and nothing is hidden behind a pointer before the JavaScript has run.
 *
 * Which is why this returns false on the server and for the first client render, and only
 * then turns on: the markup that arrives is the state that needs no script, so a page that
 * never hydrates is complete rather than half-revealed.
 *
 * THE SAME SWITCH IS WHAT ANSWERS A PHONE, and that is the whole of the mobile treatment
 * for four sections. Each of those motion layers is a mechanic that needs room the phone
 * does not have — a sticky stage beside a travelling list, five frames each taking a
 * screen, a row wider than the viewport drawn sideways, a panel sliding over the lower
 * 84% of an 80vh picture. Shrinking any of them produces a worse version of the same
 * idea. Standing them down produces the base state, which is a stack of cards with every
 * picture and every sentence in place — which is what the design would have been if it
 * had been drawn for a phone first.
 *
 * So `minWidth` is not a tuning knob. A caller that passes it is saying: below this, the
 * readable stack IS the mobile design, and the reader loses nothing but the mechanic.
 */
export interface MotionLayerOptions {
  /**
   * The narrowest viewport this section's motion layer is allowed to run at, in CSS
   * pixels. Below it the section renders its base state and registers no frame task.
   * Omitted means the layer runs at every width.
   */
  readonly minWidth?: number;
}

export function useMotionLayer(options: MotionLayerOptions = {}): boolean {
  const prefersReducedMotion = useReducedMotion();
  // `all` matches everywhere, so a caller with no floor gets the old behaviour: on as soon
  // as the client has rendered. The hook is called unconditionally either way.
  const isWideEnough = useMediaQuery(
    options.minWidth === undefined ? "all" : `(min-width: ${options.minWidth}px)`,
  );
  return isWideEnough && !prefersReducedMotion;
}
