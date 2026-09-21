"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import type { CtaView, NavEntryView } from "../lib/viewModels";
import { Button } from "../components/Button";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { useScrollLock } from "../hooks/useScrollLock";
import { staggerDelay } from "../motion/variants";

interface MobileDrawerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly entries: ReadonlyArray<NavEntryView>;
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
      // The drawer never unmounts — it's shown/hidden with CSS — so without this a group
      // expanded in a previous visit is still expanded the next time the drawer opens.
      setOpenGroup(null);
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
      <div className="flex justify-end px-4 py-3">
        {/* 44px square, matching the bar's own trigger — an icon pair (hamburger to open,
            X to close) reads as one control rather than two differently-styled ones.
            `-mr-2` pulls the box back onto the 24px gutter the rest of the drawer sits on. */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="-mr-2 inline-flex min-h-11 min-w-11 items-center justify-center text-ink-70"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
            <path
              d="M4 4L16 16M16 4L4 16"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      {/* The two panels collapse into accordion groups here — same content, same
          disclosure ARIA, one open at a time. Items without a panel stay plain links.

          HOW WE WORK IS A TOP-LEVEL ROW HERE, not a block inside the Ways to Work group
          the way it is on the bar. What demoted it on the bar was width — five page names
          either side of a centred wordmark do not fit on one line — and the drawer has no
          width problem: it is a column, and a row costs it nothing but 3rem of scroll. So
          the page keeps a one-tap route on a phone rather than becoming something a reader
          has to expand another item to find. It is rendered from the SAME aside the panel
          renders, immediately after the entry that carries it, so the two surfaces cannot
          disagree about where it lives. */}
      <nav aria-label="Mobile" className="flex flex-col gap-1 px-6">
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

          const aside =
            entry.panel.asideHref && entry.panel.asideLabel
              ? { href: entry.panel.asideHref, label: entry.panel.asideLabel }
              : null;

          return (
            <Fragment key={entry.href}>
              <div className="border-b border-ink-8 py-3">
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
                        className="text-display-s flex min-h-11 items-center font-medium text-ink"
                      >
                        {entry.label}
                      </Link>
                      {/* The chevron is the one control on this row that is NOT the page,
                          so it has to be separable by a thumb: 44x44 with the negative
                          margin putting its right edge back on the gutter. Without the
                          width it was a 20px glyph inside 8px of padding, sitting 36px
                          from a link that goes somewhere else entirely. */}
                      <button
                        id={groupTriggerId}
                        type="button"
                        className="-mr-2 flex min-h-11 min-w-11 shrink-0 items-center justify-center text-ink-70"
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
                        {/* EVERY ROW IS 44px TALL, and the list's own gap comes off to pay
                            for it. These were 24px links 8px apart, which for a thumb is
                            one target with three names in it — the failure the brief calls
                            "two links 8px apart are one target". `flex` on the anchor is
                            what makes the height real: an inline box is only as tall as its
                            glyphs. */}
                        <ul className="mt-1 pb-2 pl-2">
                          {panelLinks(entry).map((item) => (
                            <li key={`${item.href}-${item.label}`}>
                              <Link
                                href={item.href}
                                className="text-body flex min-h-11 items-center text-ink"
                                onClick={onClose}
                              >
                                {item.label}
                              </Link>
                            </li>
                          ))}
                          {entry.panel.footerHref && entry.panel.footerLabel ? (
                            <li>
                              <Link
                                href={entry.panel.footerHref}
                                className="inline-link text-small min-h-11 font-medium text-accent"
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
                    className="text-display-s flex min-h-11 items-center font-medium text-ink"
                    style={revealStyle}
                  >
                    {entry.label}
                  </Link>
                )}
              </div>
              {aside ? (
                <div className="border-b border-ink-8 py-3">
                  <Link
                    href={aside.href}
                    onClick={onClose}
                    className="text-display-s flex min-h-11 items-center font-medium text-ink"
                    style={revealStyle}
                  >
                    {aside.label}
                  </Link>
                </div>
              ) : null}
            </Fragment>
          );
        })}
      </nav>
      <div className="mt-6 flex flex-col gap-3 px-6 pb-10">
        <Button cta={primaryCta} variant="primary" />
      </div>
    </div>
  );
}
