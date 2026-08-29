"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CtaView, MegaMenuColumnView } from "../lib/viewModels";
import { Button } from "../components/Button";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { useScrollLock } from "../hooks/useScrollLock";
import { staggerDelay } from "../motion/variants";

interface MobileDrawerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly primaryLinks: ReadonlyArray<CtaView>;
  readonly megaMenuColumns: ReadonlyArray<MegaMenuColumnView>;
  readonly signIn: CtaView;
  readonly primaryCta: CtaView;
  readonly panelId: string;
  readonly triggerId: string;
  readonly triggerRef: React.RefObject<HTMLElement | null>;
}

export function MobileDrawer({
  isOpen,
  onClose,
  primaryLinks,
  megaMenuColumns,
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

  const [servicesLink, ...restLinks] = primaryLinks;
  const staggerItems = [servicesLink, ...restLinks].filter((link): link is CtaView => Boolean(link));

  return (
    <div
      ref={panelRef}
      id={panelId}
      role="dialog"
      aria-modal="true"
      aria-labelledby={triggerId}
      tabIndex={-1}
      className="transition-base fixed inset-0 z-50 bg-canvas"
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
      <nav aria-label="Mobile" className="flex flex-col gap-2 px-6">
        {staggerItems.map((link, index) => {
          const isServices = index === 0;
          const isGroupOpen = openGroup === link.label;
          return (
            <div key={link.href} className="border-b border-ink-8 py-3">
              {isServices ? (
                <>
                  <button
                    type="button"
                    className="text-display-s w-full text-left font-medium text-ink"
                    aria-expanded={isGroupOpen}
                    onClick={() => setOpenGroup(isGroupOpen ? null : link.label)}
                    style={{
                      transitionProperty: "opacity, transform",
                      transitionDuration: "220ms",
                      transitionDelay: isOpen ? `${staggerDelay(index, 30)}ms` : "0ms",
                      opacity: isOpen ? 1 : 0,
                      transform: isOpen ? "translateY(0)" : "translateY(8px)",
                    }}
                  >
                    {link.label}
                  </button>
                  {isGroupOpen ? (
                    <div className="mt-3 space-y-4 pl-2">
                      {megaMenuColumns.map((column) => (
                        <div key={column.title}>
                          <p className="label text-ink-70">{column.title}</p>
                          <ul className="mt-2 space-y-2">
                            {column.items.map((item) => (
                              <li key={item.href}>
                                <Link href={item.href} className="text-body text-ink" onClick={onClose}>
                                  {item.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : (
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="text-display-s block font-medium text-ink"
                  style={{
                    transitionProperty: "opacity, transform",
                    transitionDuration: "220ms",
                    transitionDelay: isOpen ? `${staggerDelay(index, 30)}ms` : "0ms",
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? "translateY(0)" : "translateY(8px)",
                  }}
                >
                  {link.label}
                </Link>
              )}
            </div>
          );
        })}
      </nav>
      <div className="mt-6 flex flex-col gap-3 px-6">
        <Button cta={signIn} variant="ghost" />
        <Button cta={primaryCta} variant="primary" />
      </div>
    </div>
  );
}
