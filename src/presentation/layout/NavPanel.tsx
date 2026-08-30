"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import type { NavPanelView } from "../lib/viewModels";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { staggerDelay } from "../motion/variants";

const OPEN_MS = 220;
const COLUMN_STAGGER_MS = 40;
const SLIDE_PX = 8;

interface NavPanelProps {
  readonly panel: NavPanelView;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly panelId: string;
  readonly triggerId: string;
}

/**
 * A light panel hanging off the dark header. `.surface-light` is what puts the focus
 * ring back to the raw accent inside it — over the hero the header is `.surface-dark`,
 * and the lightened ring colour would be wrong against canvas.
 *
 * The panel is not a focus trap. It is a disclosure, not a dialog: Tab should walk out
 * of it into the rest of the header, and the header closes it when focus leaves.
 */
export function NavPanel({ panel, isOpen, onClose, panelId, triggerId }: NavPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const transitionMs = prefersReducedMotion ? 120 : OPEN_MS;

  // Arrow keys walk the panel's own links; Home/End jump to its ends.
  useEffect(() => {
    const node = panelRef.current;
    if (!isOpen || !node) {
      return;
    }
    function handleKeyDown(event: KeyboardEvent): void {
      const links = [...(node?.querySelectorAll<HTMLAnchorElement>("a[href]") ?? [])];
      const current = links.indexOf(document.activeElement as HTMLAnchorElement);
      if (current === -1) {
        return;
      }
      const moves: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      const step = moves[event.key];
      if (step !== undefined) {
        event.preventDefault();
        links[(current + step + links.length) % links.length]?.focus();
        return;
      }
      if (event.key === "Home") {
        event.preventDefault();
        links[0]?.focus();
      }
      if (event.key === "End") {
        event.preventDefault();
        links[links.length - 1]?.focus();
      }
    }
    node.addEventListener("keydown", handleKeyDown);
    return () => node.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const revealStyle = (index: number) => ({
    transitionProperty: "opacity, transform",
    transitionDuration: `${transitionMs}ms`,
    transitionDelay: isOpen ? `${staggerDelay(index, COLUMN_STAGGER_MS)}ms` : "0ms",
    opacity: isOpen ? 1 : 0,
    transform:
      prefersReducedMotion || isOpen ? "translateY(0)" : `translateY(-${SLIDE_PX}px)`,
  });

  return (
    <div
      ref={panelRef}
      id={panelId}
      role="region"
      aria-labelledby={triggerId}
      className="surface-light transition-base absolute inset-x-0 top-full border-b border-ink-8 bg-canvas shadow-none"
      style={{
        opacity: isOpen ? 1 : 0,
        transform: prefersReducedMotion || isOpen ? "translateY(0)" : `translateY(-${SLIDE_PX}px)`,
        transitionDuration: `${transitionMs}ms`,
        visibility: isOpen ? "visible" : "hidden",
        pointerEvents: isOpen ? "auto" : "none",
      }}
    >
      <div className="mx-auto w-full max-w-7xl px-6 py-10">
        {panel.columns.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {panel.columns.map((column, columnIndex) => (
              <div key={column.title || columnIndex} style={revealStyle(columnIndex)}>
                {column.title ? <p className="label text-ink-70">{column.title}</p> : null}
                <ul className={`space-y-4 ${column.title ? "mt-4" : ""}`}>
                  {column.items.map((item) => (
                    <li key={`${item.href}-${item.label}`}>
                      <Link href={item.href} className="nav-panel-link block" onClick={onClose}>
                        <span className="text-body block font-medium text-ink">{item.label}</span>
                        <span className="text-small mt-1 block text-ink-70">{item.description}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}

        {panel.features.length > 0 ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {panel.features.map((feature, featureIndex) => (
              <li key={feature.href} style={revealStyle(featureIndex)}>
                <Link href={feature.href} className="nav-panel-link block" onClick={onClose}>
                  <span className="media-tile block" style={{ aspectRatio: "4 / 3" }}>
                    <Image
                      src={feature.media.src}
                      alt=""
                      width={400}
                      height={300}
                      sizes="240px"
                      loading="lazy"
                      className="media-tile-media h-full w-full object-cover"
                    />
                  </span>
                  <span className="text-small mt-3 block font-medium text-ink">{feature.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        {panel.footerHref && panel.footerLabel ? (
          <div className="mt-8 border-t border-ink-8 pt-6" style={revealStyle(panel.columns.length)}>
            <Link
              href={panel.footerHref}
              className="text-small font-medium text-accent"
              onClick={onClose}
            >
              {panel.footerLabel} &rarr;
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
