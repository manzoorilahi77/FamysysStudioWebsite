"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { NavPanelView } from "../lib/viewModels";
import { useReducedMotion } from "../hooks/useReducedMotion";

const OPEN_MS = 220;
const CLOSE_MS = 160;
const COLUMN_STAGGER_MS = 40;
const ITEM_STAGGER_MS = 30;
const SLIDE_PX = 8;

/** The narrow panel's width in px, matching `.nav-panel--narrow`. See `anchorLeft`. */
const NARROW_PANEL_PX = 352;

export type NavPanelVariant = "wide" | "media" | "narrow";

/**
 * A panel is sized by what is in it, not by the container it hangs from.
 *
 * - `wide`   — two or more real columns. It earns the container's full width.
 * - `media`  — a row of covers. Sized to the covers, anchored to the container's right
 *              edge so it cannot run off the viewport from a trigger this far along the bar.
 * - `narrow` — one column of short items. A full-width three-column card holding four
 *              two-word labels was two thirds empty; this one is as wide as its content and
 *              starts under its own trigger.
 */
export function navPanelVariant(panel: NavPanelView): NavPanelVariant {
  if (panel.columns.length > 1) {
    return "wide";
  }
  return panel.features.length > 0 ? "media" : "narrow";
}

interface NavPanelProps {
  readonly panel: NavPanelView;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly panelId: string;
  readonly triggerId: string;
}

/**
 * A light card hanging off the permanently dark header. `.surface-light` is what puts the
 * focus ring back to the raw accent inside it — the header is `.surface-dark`, and the
 * lightened ring colour would be wrong against canvas.
 *
 * The panel is not a focus trap. It is a disclosure, not a dialog: Tab should walk out
 * of it into the rest of the header, and the header closes it when focus leaves.
 *
 * ENTRY IS A SEQUENCE, EXIT IS NOT. Opening runs 220ms with columns 40ms apart and the
 * items inside a column 30ms apart, so the panel assembles rather than appearing. Closing
 * runs 160ms with every delay at zero: a staggered exit means the last item is still on
 * screen a third of a second after the pointer left, which reads as the panel being slow
 * to let go. Under reduced motion both collapse to a 120ms opacity change with no delays.
 */
export function NavPanel({ panel, isOpen, onClose, panelId, triggerId }: NavPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const transitionMs = prefersReducedMotion ? 120 : isOpen ? OPEN_MS : CLOSE_MS;
  const variant = navPanelVariant(panel);
  const [anchorLeft, setAnchorLeft] = useState<number | null>(null);

  /**
   * Where a narrow panel starts: under its own trigger.
   *
   * The panel's containing block is the header's inner container — the trigger's
   * `offsetParent` is that same box, because nothing between them is positioned — so the
   * trigger's `offsetLeft` IS the inset the panel needs, with no geometry reconstructed
   * from viewport units. It is clamped to the container's own gutters, which is what stops
   * a trigger far along the bar from pushing the card off the right edge at a narrow
   * desktop width.
   */
  useEffect(() => {
    if (variant !== "narrow") {
      return;
    }
    function measure(): void {
      const trigger = document.getElementById(triggerId);
      const parent = trigger?.offsetParent;
      if (!trigger || !(parent instanceof HTMLElement)) {
        setAnchorLeft(null);
        return;
      }
      // The shell's own padding IS the gutter, read off the element rather than kept as a
      // second copy of the token here. It is a clamp(), so the number changes with the
      // viewport; a constant was only ever right at the narrow end of the range.
      const gutter = parseFloat(getComputedStyle(parent).paddingLeft) || 0;
      const rightmost = parent.clientWidth - gutter - NARROW_PANEL_PX;
      setAnchorLeft(Math.max(gutter, Math.min(trigger.offsetLeft, rightmost)));
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [variant, triggerId]);

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
      const moves: Record<string, number> = {
        ArrowDown: 1,
        ArrowRight: 1,
        ArrowUp: -1,
        ArrowLeft: -1,
      };
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

  /** Delay in ms for something arriving `steps` into the sequence. Zero on the way out. */
  const revealStyle = (delayMs: number) => ({
    transitionProperty: "opacity, transform",
    transitionDuration: `${transitionMs}ms`,
    transitionTimingFunction: "var(--ease-base)",
    transitionDelay: isOpen && !prefersReducedMotion ? `${delayMs}ms` : "0ms",
    opacity: isOpen ? 1 : 0,
    transform: prefersReducedMotion || isOpen ? "translateY(0)" : `translateY(-${SLIDE_PX}px)`,
  });

  return (
    <div
      ref={panelRef}
      id={panelId}
      role="region"
      aria-labelledby={triggerId}
      className={`surface-light nav-panel nav-panel--${variant}`}
      style={{
        ...(variant === "narrow" && anchorLeft !== null
          ? { left: `${anchorLeft}px`, right: "auto" }
          : {}),
        opacity: isOpen ? 1 : 0,
        transform: prefersReducedMotion || isOpen ? "translateY(0)" : `translateY(-${SLIDE_PX}px)`,
        transitionProperty: "opacity, transform",
        transitionDuration: `${transitionMs}ms`,
        transitionTimingFunction: "var(--ease-base)",
        visibility: isOpen ? "visible" : "hidden",
        pointerEvents: isOpen ? "auto" : "none",
      }}
    >
      <div className={variant === "narrow" ? "px-4 py-5" : "px-6 py-8"}>
        {panel.columns.length > 0 ? (
          <div
            className={variant === "narrow" ? "grid" : "grid gap-8 md:grid-cols-2 lg:grid-cols-3"}
          >
            {panel.columns.map((column, columnIndex) => (
              <div key={column.title || columnIndex}>
                {/* Rendered even when the column has no name, because the label's line has
                    to be reserved either way or the first item of an untitled column sits
                    a line higher than its neighbours and the row of columns reads as
                    misaligned. Nothing is invented to fill it: the panel's columns are a
                    layout split, not six named groups, and the brief defines no service
                    taxonomy — see navigation.content.ts. `.nav-panel-column-label` holds
                    the height. */}
                <p
                  className="label nav-panel-column-label px-3"
                  style={revealStyle(columnIndex * COLUMN_STAGGER_MS)}
                >
                  {column.title}
                </p>
                <ul className="mt-3">
                  {column.items.map((item, itemIndex) => (
                    <li
                      key={`${item.href}-${item.label}`}
                      style={revealStyle(
                        columnIndex * COLUMN_STAGGER_MS + itemIndex * ITEM_STAGGER_MS,
                      )}
                    >
                      <Link href={item.href} className="nav-panel-link" onClick={onClose}>
                        <span className="nav-panel-link-body">
                          <span className="nav-panel-link-title text-body block font-medium text-ink">
                            {item.label}
                          </span>
                          <span className="text-small mt-1 block text-graphite-70">
                            {item.description}
                          </span>
                        </span>
                        <span className="nav-panel-link-arrow text-small" aria-hidden="true">
                          &rarr;
                        </span>
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
              <li key={feature.href} style={revealStyle(featureIndex * ITEM_STAGGER_MS)}>
                <Link href={feature.href} className="nav-panel-feature block" onClick={onClose}>
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
                  <span className="text-small mt-3 block font-medium text-ink">
                    {feature.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        {panel.footerHref && panel.footerLabel ? (
          <div
            className={`border-t border-ink-8 px-3 ${variant === "narrow" ? "mt-3 pt-3" : "mt-6 pt-5"}`}
            style={revealStyle((panel.columns.length + panel.features.length) * COLUMN_STAGGER_MS)}
          >
            <Link
              href={panel.footerHref}
              className="inline-link text-small font-medium text-accent"
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
