"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { MegaMenuColumnView } from "../lib/viewModels";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { staggerDelay } from "../motion/variants";

interface MegaMenuProps {
  readonly columns: ReadonlyArray<MegaMenuColumnView>;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly panelId: string;
  readonly triggerId: string;
}

export function MegaMenu({ columns, isOpen, onClose, panelId, triggerId }: MegaMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  useFocusTrap(panelRef, isOpen);

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

  const transitionMs = prefersReducedMotion ? 120 : 220;

  return (
    <div
      ref={panelRef}
      id={panelId}
      role="region"
      aria-labelledby={triggerId}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          onClose();
        }
      }}
      className="transition-base absolute inset-x-0 top-full border-b border-ink-8 bg-canvas shadow-none"
      style={{
        opacity: isOpen ? 1 : 0,
        transform: prefersReducedMotion || isOpen ? "translateY(0)" : "translateY(-8px)",
        transitionDuration: `${transitionMs}ms`,
        visibility: isOpen ? "visible" : "hidden",
        pointerEvents: isOpen ? "auto" : "none",
      }}
    >
      <div className="mx-auto grid w-full max-w-5xl grid-cols-4 gap-8 px-6 py-10">
        {columns.map((column, columnIndex) => (
          <div
            key={column.title}
            style={{
              transitionProperty: "opacity, transform",
              transitionDuration: `${transitionMs}ms`,
              transitionDelay: isOpen ? `${staggerDelay(columnIndex, 40)}ms` : "0ms",
              opacity: isOpen ? 1 : 0,
              transform: prefersReducedMotion || isOpen ? "translateY(0)" : "translateY(-8px)",
            }}
          >
            <p className="label text-ink-70">{column.title}</p>
            <ul className="mt-4 space-y-3">
              {column.items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="block" onClick={onClose}>
                    <span className="text-body block text-ink">{item.label}</span>
                    <span className="text-small block text-ink-70">{item.description}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
