"use client";

import { useSyncExternalStore } from "react";

/**
 * Column counts for the capability grid, widest first. These mirror the Tailwind
 * breakpoints the grid itself uses (`md:grid-cols-2 lg:grid-cols-3`) — the diagonal
 * stagger is computed from row and column, so JS has to agree with CSS about which
 * column a card is in or the diagonal reads as a random order.
 */
const BREAKPOINTS = [
  { query: "(min-width: 1024px)", columns: 3 },
  { query: "(min-width: 768px)", columns: 2 },
] as const;

const SINGLE_COLUMN = 1;

function subscribe(callback: () => void): () => void {
  const lists = BREAKPOINTS.map(({ query }) => window.matchMedia(query));
  for (const list of lists) {
    list.addEventListener("change", callback);
  }
  return () => {
    for (const list of lists) {
      list.removeEventListener("change", callback);
    }
  };
}

function getSnapshot(): number {
  const matched = BREAKPOINTS.find(({ query }) => window.matchMedia(query).matches);
  return matched ? matched.columns : SINGLE_COLUMN;
}

/**
 * The widest layout, because that is the one the diagonal was designed for. React renders
 * once with this value and re-renders with the real one straight after hydration, the same
 * contract `useReducedMotion` relies on — no markup mismatch, just a second pass.
 */
function getServerSnapshot(): number {
  return BREAKPOINTS[0].columns;
}

/** How many columns the capability grid is currently showing. */
export function useGridColumns(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
