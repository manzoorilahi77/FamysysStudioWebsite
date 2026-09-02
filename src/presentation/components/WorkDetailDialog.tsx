"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { WorkDetailLabels } from "../../domain/portfolio/entities/SelectedWorkPage";
import { motion } from "../../shared/design/tokens";
import { useReducedMotion } from "../hooks/useReducedMotion";
import type { CaseStudyDetailView } from "../lib/viewModels";

interface WorkDetailDialogProps {
  readonly piece: CaseStudyDetailView;
  readonly labels: WorkDetailLabels;
  readonly statusLabel: string;
  readonly statusExplanation: string;
  /** Called once the exit transition has finished, so the parent can unmount. */
  readonly onClosed: () => void;
}

/**
 * The piece detail, as a modal panel rather than a route.
 *
 * WHY A PANEL AND NOT `/selected-work/[slug]`: eight routes would be eight indexable
 * pages whose entire content is one approved intent line and two drafted paragraphs
 * about work that does not exist. That is the weakest thing a small site can put in a
 * search index, and it hands out eight shareable links that each promise a case study
 * and deliver a placeholder. The panel keeps the detail attached to the page that
 * explains what it is.
 *
 * The usual cost of a panel is that it cannot be linked to, and here that cost is not
 * paid: the panel is bound to the URL fragment. `/selected-work#ugc-transformation`
 * scrolls to the tile and opens its detail — which is exactly what the navigation's work
 * menu has been linking at since before this page existed. When the pieces are produced
 * and there is a real case study to publish, routes become the right answer and these
 * fragments can redirect into them.
 *
 * Native `<dialog>` + `showModal()`, not a hand-built overlay: the focus trap, the inert
 * background, Escape, and focus returned to the trigger on close are all behaviour the
 * platform already has and that hand-rolled modals get wrong. The only addition is the
 * exit transition — `cancel` is intercepted so Escape animates out rather than vanishing.
 */
export function WorkDetailDialog({
  piece,
  labels,
  statusLabel,
  statusExplanation,
  onClosed,
}: WorkDetailDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const exitTimerRef = useRef(0);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const onClosedRef = useRef(onClosed);
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);

  onClosedRef.current = onClosed;
  const transitionMs = prefersReducedMotion ? motion.duration.reduced : motion.duration.base;

  const beginExit = useCallback(() => {
    setIsVisible(false);
    window.clearTimeout(exitTimerRef.current);
    exitTimerRef.current = window.setTimeout(() => onClosedRef.current(), transitionMs);
  }, [transitionMs]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    // <dialog> restores focus on close by itself, but only while the element is still in
    // the document — and this one is unmounted by React in the same tick, so the restore
    // is lost and focus falls to <body>. Keeping the trigger ourselves is the fix: a
    // keyboard user pressing Escape lands back on the tile they opened, not at the top of
    // the page. (On a deep link there is no trigger and this is <body> already, which is
    // the correct place to be.)
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    dialog.showModal();
    // A modal <dialog> makes the page inert but does not stop it scrolling behind.
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    closeRef.current?.focus();
    const frame = window.requestAnimationFrame(() => setIsVisible(true));

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(exitTimerRef.current);
      document.documentElement.style.overflow = previousOverflow;
      if (dialog.open) {
        dialog.close();
      }
      returnFocusRef.current?.focus();
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    function handleCancel(event: Event): void {
      // Escape. Prevented so the panel animates out instead of disappearing.
      event.preventDefault();
      beginExit();
    }
    function handleClick(event: MouseEvent): void {
      // A click that lands on the dialog element itself is a click on the backdrop —
      // everything visible sits inside the panel.
      if (event.target === dialog) {
        beginExit();
      }
    }
    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("click", handleClick);
    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("click", handleClick);
    };
  }, [beginExit]);

  return (
    <dialog
      ref={dialogRef}
      className="work-dialog"
      data-visible={isVisible}
      aria-labelledby="work-dialog-title"
      style={{ ["--work-dialog-ms" as string]: `${transitionMs}ms` }}
    >
      <div className="work-dialog-panel bg-canvas">
        <div className="work-dialog-head">
          <div>
            <p className="work-reference label text-ink-70">{piece.reference}</p>
            <h2 id="work-dialog-title" className="text-display-m mt-2 font-medium text-ink">
              {piece.title}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="work-dialog-close text-small font-medium text-ink"
            onClick={beginExit}
          >
            {labels.closeLabel}
          </button>
        </div>

        <div className="work-dialog-body">
          {/* The slot the finished piece will occupy, at the ratio real footage will be
              delivered in. It carries the same status marker as the tile, and says in
              plain copy that the frame inside it is stock. */}
          <figure className="work-dialog-figure">
            <div className="work-dialog-media">
              <Image
                src={piece.media.src}
                alt={piece.media.alt}
                width={1600}
                height={900}
                sizes="(min-width: 1024px) 52rem, 100vw"
                className="h-full w-full object-cover"
              />
              <span className="media-tile-chip media-tile-chip--wrap">{statusLabel}</span>
            </div>
            <figcaption className="mt-3">
              <span className="label block text-ink-70">{labels.mediaSlotLabel}</span>
              <span className="text-small mt-2 block text-ink-70" style={{ maxWidth: "62ch" }}>
                {statusExplanation}
              </span>
            </figcaption>
          </figure>

          {/* The client's own one-line intent — see WorkTile for why it is marked. */}
          <p className="work-intent text-lead mt-10 text-accent" style={{ maxWidth: "48ch" }}>
            {piece.description}
          </p>

          <p className="label mt-10 text-ink-70">{labels.demonstratesLabel}</p>
          <p className="text-body mt-3 text-ink-70" style={{ maxWidth: "62ch" }}>
            {piece.demonstrates}
          </p>

          <p className="label mt-8 text-ink-70">{labels.whyLabel}</p>
          <p className="text-body mt-3 text-ink-70" style={{ maxWidth: "62ch" }}>
            {piece.whyThisPiece}
          </p>

          <p className="label mt-8 text-ink-70">{labels.capabilitiesLabel}</p>
          <ul className="work-dialog-links mt-3">
            {piece.capabilities.map((capability) => (
              <li key={capability.href}>
                <Link
                  href={capability.href}
                  className="inline-link text-small font-medium text-accent"
                >
                  {capability.title} &rarr;
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </dialog>
  );
}
