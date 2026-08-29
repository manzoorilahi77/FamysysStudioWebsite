"use client";

import { useEffect } from "react";

/** Locks body scroll while `active` is true — used by the mobile drawer, mega menu, and modal player. */
export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) {
      return;
    }
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [active]);
}
