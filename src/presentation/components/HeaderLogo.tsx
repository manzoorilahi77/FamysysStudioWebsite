"use client";

import { useEffect, useRef } from "react";
import { Wordmark } from "./Wordmark";
import { useReducedMotion } from "../hooks/useReducedMotion";

/** Scroll range over which the logo travels from the hero to the header slot. */
const TRAVEL_RANGE_PX = 180;
/** Hero size as a multiple of the header size — 32px in the bar, 80px in the hero. */
const HERO_LOGO_SCALE = 2.5;

/**
 * Smoothstep. The travel stays a pure function of scroll offset — this only bends the
 * line so the logo decelerates into the slot instead of stopping dead. Symmetric, so
 * scrolling back up retraces the exact same path.
 */
function easeTravel(progress: number): number {
  return progress * progress * (3 - 2 * progress);
}

/**
 * THE HOMEPAGE'S TRAVELLING WORDMARK. One element, rendered once, positioned fixed and
 * moved with transform alone. At scroll 0 it sits large in the hero copy column, on the
 * top-left corner of `[data-hero-logo-anchor]` (a reserved, empty box in the hero flow —
 * see Hero.tsx); by 180px of scroll it has landed on the header's own slot, where an
 * invisible same-size spacer has been holding its place the whole time. Between the two
 * it interpolates: the start point scrolls away with the page (anchor is a document
 * position), the end point is viewport-fixed, and the eased blend between them is what
 * reads as "travelling up while shrinking".
 *
 * NOT two elements cross-fading — a swap is visible at the handover and does not reverse.
 * Because position derives from scroll offset rather than a threshold, scrolling up runs
 * the same path backwards for free.
 *
 * Reduced motion is handled entirely in CSS (see globals.css): the travelling element is
 * display:none, the spacer becomes the visible header logo, and the hero anchor
 * collapses. The effect below also bails so no listeners are attached.
 */
export function HeaderLogo() {
  const spacerRef = useRef<HTMLSpanElement>(null);
  const travelRef = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }
    const spacer = spacerRef.current;
    const travel = travelRef.current;
    const anchor = document.querySelector("[data-hero-logo-anchor]");
    if (!spacer || !travel || !anchor) {
      return;
    }

    // Header slot in viewport coordinates (the header is fixed, so these are stable at
    // any scroll offset); hero anchor in document coordinates, so its viewport position
    // at any moment is `top - scrollY`.
    let slot = { left: 0, top: 0 };
    let anchorDoc = { left: 0, top: 0 };
    let frame: number | null = null;
    let wasSettled = false;

    function apply(): void {
      if (!travel) {
        return;
      }
      const scrollY = window.scrollY;
      const progress = Math.min(1, Math.max(0, scrollY / TRAVEL_RANGE_PX));
      // Past the range the transform is constant — skip the style write on every
      // further scroll event instead of re-setting an identical string.
      if (progress === 1 && wasSettled) {
        return;
      }
      wasSettled = progress === 1;
      const eased = easeTravel(progress);
      const startLeft = anchorDoc.left;
      const startTop = anchorDoc.top - scrollY;
      const x = startLeft + (slot.left - startLeft) * eased;
      const y = startTop + (slot.top - startTop) * eased;
      const scale = HERO_LOGO_SCALE + (1 - HERO_LOGO_SCALE) * eased;
      travel.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      travel.style.visibility = "visible";
    }

    function measure(): void {
      if (!spacer || !anchor) {
        return;
      }
      const slotRect = spacer.getBoundingClientRect();
      slot = { left: slotRect.left, top: slotRect.top };
      const anchorRect = anchor.getBoundingClientRect();
      anchorDoc = {
        left: anchorRect.left + window.scrollX,
        top: anchorRect.top + window.scrollY,
      };
      wasSettled = false;
      apply();
    }

    function scheduleApply(): void {
      if (frame !== null) {
        return;
      }
      frame = requestAnimationFrame(() => {
        frame = null;
        apply();
      });
    }

    function handleResize(): void {
      if (frame !== null) {
        cancelAnimationFrame(frame);
        frame = null;
      }
      measure();
    }

    measure();
    window.addEventListener("scroll", scheduleApply, { passive: true });
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", scheduleApply);
      window.removeEventListener("resize", handleResize);
      if (frame !== null) {
        cancelAnimationFrame(frame);
      }
    };
  }, [prefersReducedMotion]);

  return (
    <>
      {/* Same-size spacer so the bar's layout never changes: nav, buttons and the Menu
          trigger sit exactly where they do on every other page, and the travelling logo
          has a slot to land on. Visible only under reduced motion (see globals.css). */}
      <span ref={spacerRef} className="header-logo-spacer inline-block">
        <Wordmark alt="" dark priority className="h-8" />
      </span>
      {/* Starts hidden; the first measure positions it and switches it on, so there is
          never a frame of the logo at an unstyled 0,0. */}
      <span ref={travelRef} className="header-logo-travel" aria-hidden="true">
        <Wordmark alt="" dark priority className="h-8" />
      </span>
    </>
  );
}
