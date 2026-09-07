"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import type { NavPanelView } from "../lib/viewModels";
import { useReducedMotion } from "../hooks/useReducedMotion";

const OPEN_MS = 220;
const CLOSE_MS = 160;
const COLUMN_STAGGER_MS = 40;
const ITEM_STAGGER_MS = 30;
/** Cards are bigger than list rows, so they arrive further apart than the rows do. */
const CARD_STAGGER_MS = 55;
const SLIDE_PX = 8;

export type NavPanelVariant = "columns" | "cards";

/**
 * EVERY PANEL IS THE CONTAINER'S WIDTH. The three of them used to be three widths — a
 * full-width card of columns, a 56rem card of covers anchored to the container's right
 * edge, and a 22rem card anchored under its own trigger — so two of the three ended
 * somewhere the page's own edge does not, and the bar looked like three different menus.
 * They now all start and end on the site's single container line, which is the same line
 * the wordmark, every section and the footer sit on.
 *
 * What differs between them is what is INSIDE, which is the thing that was actually
 * different all along:
 *
 * - `columns` — the six services, as three columns of titled rows.
 * - `cards`   — a row of four things that have a picture: the four engagements, and the
 *               four featured pieces of work.
 */
export function navPanelVariant(panel: NavPanelView): NavPanelVariant {
  return panel.features.length > 0 ? "cards" : "columns";
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
 * ENTRY IS A SEQUENCE, EXIT IS NOT. Opening runs 220ms with columns 40ms apart, the rows
 * inside a column 30ms apart and the cards 55ms apart, so the panel assembles rather than
 * appearing. Closing runs 160ms with every delay at zero: a staggered exit means the last
 * item is still on screen a third of a second after the pointer left, which reads as the
 * panel being slow to let go. Under reduced motion both collapse to a 120ms opacity
 * change with no delays and no movement.
 */
export function NavPanel({ panel, isOpen, onClose, panelId, triggerId }: NavPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const transitionMs = prefersReducedMotion ? 120 : isOpen ? OPEN_MS : CLOSE_MS;
  const variant = navPanelVariant(panel);

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
      data-open={isOpen}
      style={{
        opacity: isOpen ? 1 : 0,
        transform: prefersReducedMotion || isOpen ? "translateY(0)" : `translateY(-${SLIDE_PX}px)`,
        transitionProperty: "opacity, transform",
        transitionDuration: `${transitionMs}ms`,
        transitionTimingFunction: "var(--ease-base)",
        visibility: isOpen ? "visible" : "hidden",
        pointerEvents: isOpen ? "auto" : "none",
      }}
    >
      {/* The accent hairline along the panel's top edge, drawn from the left as the card
          opens. It is the one piece of colour the panel carries at rest, and it is what
          ties the card to the accent the rows and cards use on hover. Decorative. */}
      <span className="nav-panel-edge" aria-hidden="true" data-open={isOpen} />

      <div className="px-6 py-8">
        {panel.columns.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
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
                        {/* The accent bar that grows down the row's left edge on hover.
                            Decorative: the row already says where it goes. */}
                        <span className="nav-panel-link-bar" aria-hidden="true" />
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

        {/* Four across, on the container's own width, from lg. Two across below that and
            one on a phone — where this panel is not rendered at all, since the bar
            collapses to the drawer, but the grid should still be honest. */}
        {panel.features.length > 0 ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {panel.features.map((feature, featureIndex) => (
              <li key={feature.href} style={revealStyle(featureIndex * CARD_STAGGER_MS)}>
                <Link href={feature.href} className="nav-panel-card" onClick={onClose}>
                  <span className="nav-panel-card-frame block">
                    <Image
                      src={feature.media.src}
                      alt=""
                      width={640}
                      height={480}
                      sizes="(min-width: 1024px) 300px, 50vw"
                      loading="lazy"
                      className="nav-panel-card-image h-full w-full object-cover"
                    />
                    {/* The accent wash that lifts over the picture on hover, and the arrow
                        that rides in with it. Both decorative — the card's own name and
                        line carry everything a reader needs. */}
                    <span className="nav-panel-card-wash" aria-hidden="true" />
                    <span className="nav-panel-card-arrow" aria-hidden="true">
                      &rarr;
                    </span>
                  </span>
                  <span className="nav-panel-card-name text-body mt-3 block font-medium text-ink">
                    {feature.label}
                  </span>
                  <span className="text-small mt-1 block text-graphite-70">
                    {feature.description}
                  </span>
                  <span className="nav-panel-card-rule" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        {/* THE ASIDE. One panel carries one: How We Work, under the four engagements.

            It is a block rather than a link because it replaced a top-level bar item, and
            a page demoted to a line of link text at the bottom of someone else's menu is a
            page on its way to being forgotten. So it names itself, says what the sequence
            is for, and lists the five steps — the same five the homepage renders, read
            from the same constant — before it offers the link.

            The steps are an ordered list and the numerals are drawn by CSS from the list's
            own counter, so the order a reader sees is the order the markup has rather than
            five hand-written numbers that can disagree with it. */}
        {panel.asideHref && panel.asideLabel ? (
          <div
            className="nav-panel-aside mt-6 px-3 pt-5"
            style={revealStyle((panel.columns.length + panel.features.length) * COLUMN_STAGGER_MS)}
          >
            <div className="nav-panel-aside-intro">
              <p className="label nav-panel-aside-label">{panel.asideLabel}</p>
              <p className="nav-panel-aside-summary text-body font-medium text-ink">
                {panel.asideSummary}
              </p>
            </div>
            <ol className="nav-panel-aside-steps text-small">
              {(panel.asideSteps ?? []).map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <Link
              href={panel.asideHref}
              className="nav-panel-aside-link nav-panel-footer-link text-small font-medium text-accent"
              onClick={onClose}
            >
              {panel.asideLinkLabel}
              <span className="nav-panel-footer-arrow" aria-hidden="true">
                {" "}
                &rarr;
              </span>
            </Link>
          </div>
        ) : null}

        {panel.footerHref && panel.footerLabel ? (
          <div
            className="nav-panel-footer mt-6 px-3 pt-5"
            style={revealStyle(
              (panel.columns.length + panel.features.length + 1) * COLUMN_STAGGER_MS,
            )}
          >
            <Link
              href={panel.footerHref}
              className="nav-panel-footer-link text-small font-medium text-accent"
              onClick={onClose}
            >
              {panel.footerLabel}
              <span className="nav-panel-footer-arrow" aria-hidden="true">
                {" "}
                &rarr;
              </span>
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
