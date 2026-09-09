"use client";

import { useEffect } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Traps Tab/Shift+Tab focus inside `containerRef` while `active` — for the mega menu, drawer, and modal player. */
export function useFocusTrap(containerRef: React.RefObject<HTMLElement | null>, active: boolean): void {
  useEffect(() => {
    const container = containerRef.current;
    if (!active || !container) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key !== "Tab" || !container) {
        return;
      }
      // `inert` and `hidden` subtrees still MATCH the selector — they are simply not
      // focusable — so an unfiltered list can name a last element the browser will never
      // put focus on, and the wrap at the end of the cycle then silently does nothing and
      // drops focus onto the body. The drawer has such a subtree in it whenever a nav
      // group is collapsed, which is its resting state.
      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter(
        (element) =>
          !element.closest("[inert]") &&
          !element.hidden &&
          (element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0),
      );
      if (focusable.length === 0) {
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [containerRef, active]);
}
