"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CmsInquiry } from "../../../domain/cms/entities/CmsInquiry";
import { motion } from "../../../shared/design/tokens";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { InquiryActions } from "./InquiryActions";

/**
 * ONE ENQUIRY, FULL DETAIL, IN A MODAL — BUILT ON THE SAME MECHANICS `PendingDialog` ALREADY
 * PROVED RATHER THAN REINVENTED: native `<dialog>` + `showModal()`, `useFocusTrap` for
 * Tab/Shift+Tab (the platform makes the page behind inert and answers Escape, but does not
 * wrap sequential focus on its own — see PendingDialog's own note on that gap), the `cancel`
 * event for Escape, and `event.target === dialog` for a backdrop click. Only the surface is
 * different: `.admin-dialog`/`.admin-dialog-panel` in globals.css are the same fade-and-
 * scale pair as `.pending-dialog`, in the panel's own light/hairline language instead of the
 * marketing site's dark one.
 *
 * REPLY IS A `mailto:` LINK. There is no email sending in the admin panel — see
 * InboxScreen's own mail-status notice — so a reply opens whatever mail client the browser
 * has, addressed and subjected, with nothing this panel could get wrong about the actual
 * sending.
 */

function Field({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div>
      <dt className="label text-ink-40">{label}</dt>
      <dd className="text-small mt-1 whitespace-pre-line break-words text-ink">{value}</dd>
    </div>
  );
}

export function InquiryDetailDialog({
  inquiry,
  onClosed,
}: {
  readonly inquiry: CmsInquiry;
  readonly onClosed: () => void;
}) {
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
    if (!dialog) return;
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
      if (dialog.open) dialog.close();
      returnFocusRef.current?.focus();
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    function handleCancel(event: Event): void {
      event.preventDefault();
      beginExit();
    }
    function handleClick(event: MouseEvent): void {
      if (event.target === dialog) beginExit();
    }
    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("click", handleClick);
    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("click", handleClick);
    };
  }, [beginExit]);

  const titleId = `inquiry-${inquiry.id}-title`;

  return (
    <dialog
      ref={dialogRef}
      className="admin-dialog"
      data-visible={isVisible}
      aria-modal="true"
      aria-labelledby={titleId}
      style={
        {
          "--admin-dialog-enter-ms": `${enterMs}ms`,
          "--admin-dialog-exit-ms": `${exitMs}ms`,
        } as React.CSSProperties
      }
    >
      <div className="admin-dialog-panel">
        <div className="flex items-start justify-between gap-4 border-b border-hairline px-6 py-5">
          <div className="min-w-0">
            <h2 id={titleId} className="text-display-s truncate text-ink">
              {inquiry.name}
            </h2>
            <p className="text-small mt-1 text-graphite-70">
              Received {inquiry.receivedAt.toISOString().replace("T", " ").slice(0, 16)} UTC ·{" "}
              {inquiry.sourceForm === "home" ? "Homepage form" : "Contact page"}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={beginExit}
            aria-label="Close"
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-sm text-ink-40 transition-colors duration-[180ms] hover:text-ink"
          >
            <span aria-hidden="true" className="text-display-s">
              ×
            </span>
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-6">
          <dl className="grid gap-6 sm:grid-cols-2">
            <Field label="Email" value={inquiry.email} />
            <Field label="Company" value={inquiry.companyName} />
            <Field label="Company size" value={inquiry.companySize} />
            {inquiry.companyWebsite !== null ? (
              <Field label="Website" value={inquiry.companyWebsite || "Left blank"} />
            ) : null}
            {inquiry.contactRole !== null ? (
              <Field label="Role" value={inquiry.contactRole || "Left blank"} />
            ) : null}
            {inquiry.projectBrief !== null ? (
              <div className="sm:col-span-2">
                <Field label="Project brief" value={inquiry.projectBrief || "Left blank"} />
              </div>
            ) : null}
          </dl>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-hairline px-6 py-5">
          <a
            href={`mailto:${inquiry.email}?subject=${encodeURIComponent(`Re: your enquiry`)}`}
            className="text-small font-medium text-accent underline underline-offset-2 transition-colors duration-[180ms] hover:text-ink"
          >
            Reply by email
          </a>
          <InquiryActions id={inquiry.id} status={inquiry.status} />
        </div>
      </div>
    </dialog>
  );
}
