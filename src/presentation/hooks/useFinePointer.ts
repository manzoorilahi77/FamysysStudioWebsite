"use client";

import { useMediaQuery } from "./useMediaQuery";

/**
 * Whether the PRIMARY pointer can hover and point precisely — a mouse or a trackpad.
 *
 * A width breakpoint is the wrong question for this and gets the wrong answer twice: a
 * 1440px touchscreen laptop has no hover, and a phone plugged into a mouse has one. So
 * anything whose whole idea is "the reader is holding a cursor" — a bulge under the
 * pointer, a playhead, a magnetic button — asks this instead, and anything that is about
 * how much ROOM there is asks the width.
 *
 * `(hover: hover) and (pointer: fine)` rather than either alone: `hover` on its own is
 * true for a stylus that can hover, and `pointer: fine` on its own is true for one that
 * cannot. Both have to hold for a cursor to be a safe assumption.
 *
 * False on the server and for the first client render, so the markup that hydrates is the
 * one that assumes nothing about the reader's input. See `useMediaQuery`.
 */
export function useFinePointer(): boolean {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}
