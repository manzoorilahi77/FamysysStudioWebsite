"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CtaView, NavEntryView } from "../lib/viewModels";
import { Button } from "../components/Button";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { useScrollLock } from "../hooks/useScrollLock";
import { staggerDelay } from "../motion/variants";

interface MobileDrawerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly entries: ReadonlyArray<NavEntryView>;
  readonly signIn: CtaView;
  readonly primaryCta: CtaView;
  readonly panelId: string;
  readonly triggerId: string;
  readonly triggerRef: React.RefObject<HTMLElement | null>;
}

function hasPanel(entry: NavEntryView): boolean {
  return entry.panel.columns.length > 0 || entry.panel.features.length > 0;
}

/** Every panel item, flattened — the drawer lists them, it does not lay them out. */
function panelLinks(entry: NavEntryView): ReadonlyArray<CtaView> {
  return [...entry.panel.columns.flatMap((column) => column.items), ...entry.panel.features];
}

export function MobileDrawer({
  isOpen,
  onClose,
  entries,
  signIn,
  primaryCta,
  panelId,
  triggerId,
  triggerRef,
}: MobileDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const hasOpenedRef = useRef(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  useScrollLock(isOpen);
  useFocusTrap(panelRef, isOpen);

  useEffect(() => {
    if (isOpen) {
      hasOpenedRef.current = true;
      panelRef.current?.focus();
    } else if (hasOpenedRef.current) {
      triggerRef.current?.focus();
    }
  }, [isOpen, triggerRef]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div
      ref={panelRef}
      id={panelId}
      role="dialog"
      aria-modal="true"
      aria-labelledby={triggerId}
      tabIndex={-1}
      className="surface-light transition-base fixed inset-0 z-50 overflow-y-auto bg-canvas"
      style={{
        opacity: isOpen ? 1 : 0,
        visibility: isOpen ? "visible" : "hidden",
        pointerEvents: isOpen ? "auto" : "none",
        transitionDuration: "220ms",
      }}
    >
      <div className="flex justify-end px-6 py-6">
        <button type="button" onClick={onClose} className="label text-ink-70">
          Close
        </button>
      </div>
      {/* The three panels collapse into accordion groups here — same content, same
          disclosure ARIA, one open at a time. Items without a panel stay plain links. */}
      <nav aria-label="Mobile" className="flex flex-col gap-2 px-6">
        {entries.map((entry, index) => {
          const isGroupOpen = openGroup === entry.href;
          const groupTriggerId = `drawer-trigger-${index}`;
          const groupPanelId = `drawer-panel-${index}`;
          const revealStyle = {
            transitionProperty: "opacity, transform",
            transitionDuration: "220ms",
            transitionDelay: isOpen ? `${staggerDelay(index, 30)}ms` : "0ms",
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? "translateY(0)" : "translateY(8px)",
          };

          return (
            <div key={entry.href} className="border-b border-ink-8 py-3">
              {hasPanel(entry) ? (
                <>
                  {/* Split row: the name goes to the page, the chevron opens the group.
                      One control cannot do both — tapping "Creative Services" has to reach
                      Creative Services, and the group still has to expand. The chevron
                      carries the disclosure ARIA and its own name, because on its own it
                      would announce as an unlabelled button. */}
                  <div className="flex items-center justify-between gap-4" style={revealStyle}>
                    <Link
                      href={entry.href}
                      onClick={onClose}
                      className="text-display-s font-medium text-ink"
                    >
                      {entry.label}
                    </Link>
                    <button
                      id={groupTriggerId}
                      type="button"
                      className="shrink-0 p-2 text-ink-70"
                      aria-expanded={isGroupOpen}
                      aria-controls={groupPanelId}
                      aria-label={`Show ${entry.label} links`}
                      onClick={() => setOpenGroup(isGroupOpen ? null : entry.href)}
                    >
                      <svg
                        className="faq-chevron"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M5 7.5L10 12.5L15 7.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                  <div
                    id={groupPanelId}
                    role="region"
                    aria-labelledby={groupTriggerId}
                    data-open={isGroupOpen}
                    inert={!isGroupOpen}
                    className="faq-panel"
                  >
                    <div className="faq-panel-inner">
                      <ul className="mt-3 space-y-2 pb-3 pl-2">
                        {panelLinks(entry).map((item) => (
                          <li key={`${item.href}-${item.label}`}>
                            <Link href={item.href} className="text-body text-ink" onClick={onClose}>
                              {item.label}
                            </Link>
                          </li>
                        ))}
                        {entry.panel.footerHref && entry.panel.footerLabel ? (
                          <li>
                            <Link
                              href={entry.panel.footerHref}
                              className="inline-link text-small font-medium text-accent"
                              onClick={onClose}
                            >
                              {entry.panel.footerLabel} &rarr;
                            </Link>
                          </li>
                        ) : null}
                      </ul>
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  href={entry.href}
                  onClick={onClose}
                  className="text-display-s block font-medium text-ink"
                  style={revealStyle}
                >
                  {entry.label}
                </Link>
              )}
            </div>
          );
        })}
      </nav>
      <div className="mt-6 flex flex-col gap-3 px-6 pb-10">
        <Button cta={signIn} variant="ghost" />
        <Button cta={primaryCta} variant="primary" />
      </div>
    </div>
  );
}
