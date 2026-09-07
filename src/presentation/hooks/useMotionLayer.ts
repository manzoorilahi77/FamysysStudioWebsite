"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Whether a section may add its motion layer on top of itself.
 *
 * The three imagery-led homepage sections are written the way the approved design is:
 * the stylesheet's base state is the FINAL, readable state — every sentence on the page,
 * every panel open, no picture moving — and the motion layer is only ever added over it,
 * scoped to `[data-motion="on"]`. Nothing has to be unwound for a reader who has asked for
 * reduced motion, and nothing is hidden behind a pointer before the JavaScript has run.
 *
 * Which is why this returns false on the server and for the first client render, and only
 * then turns on: the markup that arrives is the state that needs no script, so a page that
 * never hydrates is complete rather than half-revealed.
 */
export function useMotionLayer(): boolean {
  const prefersReducedMotion = useReducedMotion();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted && !prefersReducedMotion;
}
