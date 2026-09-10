"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { PendingCopy } from "../../domain/marketing/entities/FooterContent";
import { motion } from "../../shared/design/tokens";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface PendingDialogProps {
  /** Distinguishes this dialog's `aria-labelledby`/`describedby` ids from any other's. */
  readonly id: string;
  /** The name of the thing that does not exist yet — it is the dialog's heading. */
  readonly label: string;
  /** A brand mark or glyph beside the eyebrow, where the thing has one. */
  readonly mark?: ReactNode;
  readonly copy: PendingCopy;
  /** Called once the exit transition has finished, so the parent can unmount. */
  readonly onClosed: () => void;
}

/**
 * "THIS IS COMING" — the small dialog behind anything the footer names that does not exist
 * yet: a social network with no account, the capability deck before it is written. It
 * exists so that pressing "Instagram" or "Capability Deck" does something honest: not
 * nothing, not a dead link, but a sentence saying what is true and where the work is
 * meanwhile.
 *
 * IT IS THE SAME DIALOG FOR BOTH, and that is the point of it taking a `label` and a
 * `mark` rather than a network. The two cases differ only in what they are called and
 * whether a brand mark sits beside the eyebrow; everything below — the platform dialog,
 * the trap, the transitions, the thumb-reachable close — is the same problem solved once.
 *
 * NATIVE `<dialog>` + `showModal()`, exactly as WorkDetailDialog does and for the same
 * reason. The focus trap, the inert page behind, Escape, and the return of focus are all
 * things the platform has and that hand-rolled overlays get wrong — two disclosures in
 * this project shipped with broken ARIA, and neither was a <dialog>. What this adds is
 * the exit transition (`cancel` is intercepted so Escape animates out), the scroll lock
 * (a modal dialog makes the page inert but does not stop it scrolling), and the return
 * of focus to the trigger, which the platform does only if the element is still in the
 * document — and React unmounts this one in the same tick.
 *
 * `aria-modal` is explicit even though `showModal()` implies it: the implication is what
 * a browser knows, and the attribute is what a test can see.
 *
 * THE FOCUS TRAP IS EXPLICIT TOO, AND THAT WAS FOUND, NOT ASSUMED. A modal <dialog> makes
 * the page behind it inert, but it does not WRAP sequential focus: in Chromium, Tab from
 * the last focusable control leaves the dialog for the browser's own chrome, and
 * `document.activeElement` becomes <body> — measured on this dialog in a headless run,
 * on every viewport and under reduced motion. `useFocusTrap` is what makes Tab and
 * Shift+Tab cycle inside the panel; the platform still supplies inertness, Escape and
 * the rest. (WorkDetailDialog relies on the platform alone and has the same gap.)
 *
 * ENTRY AND EXIT. The backdrop fades and the panel scales 0.96 → 1 on the site's easing,
 * over the base duration; the exit is the fast duration, so the dialog leaves quicker
 * than it arrived — a close is an instruction, an open is an arrival. Under reduced
 * motion both collapse to the reduced duration and the scale is switched off in the
 * stylesheet, so the panel simply appears.
 */
export function PendingDialog({ id, label, mark, copy, onClosed }: PendingDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const exitTimerRef = useRef(0);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const onClosedRef = useRef(onClosed);
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);

  onClosedRef.current = onClosed;
  useFocusTrap(dialogRef, true);
  const enterMs = prefersReducedMotion ? motion.duration.reduced : motion.duration.base;
  const exitMs = prefersReducedMotion ? motion.duration.reduced : motion.duration.fast;

  const beginExit = useCallback(() => {
    setIsVisible(false);
    window.clearTimeout(exitTimerRef.current);
    exitTimerRef.current = window.setTimeout(() => onClosedRef.current(), exitMs);
  }, [exitMs]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    dialog.showModal();
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

  const titleId = `pending-${id}-title`;
  const bodyId = `pending-${id}-body`;

  return (
    <dialog
      ref={dialogRef}
      className="pending-dialog"
      data-visible={isVisible}
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      style={
        {
          "--pending-dialog-enter-ms": `${enterMs}ms`,
          "--pending-dialog-exit-ms": `${exitMs}ms`,
        } as React.CSSProperties
      }
    >
      <div className="pending-dialog-panel surface-dark bg-ink text-canvas">
        {/* The mark at real size, and the name at display size: this is a small moment and
            the name is the whole of it, so it is given the presence a heading has rather
            than set as a line of body copy with a word in bold. The deck has no mark, so
            the head is the eyebrow alone and the row simply has one child. */}
        <div className="pending-dialog-head">
          {mark}
          <p className="label text-canvas-60">{copy.eyebrow}</p>
        </div>
        <h2 id={titleId} className="text-display-m mt-4 font-medium text-canvas">
          {label}
        </h2>
        <p id={bodyId} className="text-body mt-4 text-canvas-80" style={{ maxWidth: "36ch" }}>
          {copy.body}
        </p>
        {/* Bottom of the panel, full width on a phone: on a 390px screen a modal's close
            is where a thumb already is, which is the bottom edge — not a small × in the
            top-right corner that sits under the notch and above the reach. From sm it
            is a normal button at the panel's end. 44px tall, always. */}
        <button
          ref={closeRef}
          type="button"
          onClick={beginExit}
          className="pending-dialog-close text-small font-medium"
        >
          {copy.closeLabel}
        </button>
      </div>
    </dialog>
  );
}
