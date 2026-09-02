"use client";

import Link from "next/link";
import { useState } from "react";
import type { FooterContentView, MegaMenuColumnView, NavEntryView } from "../lib/viewModels";
import { shellStyle } from "../components/Container";
import { Wordmark } from "../components/Wordmark";
import { useInView } from "../hooks/useInView";

interface FooterProps {
  readonly entries: ReadonlyArray<NavEntryView>;
  readonly footer: FooterContentView;
}

/**
 * The footer's columns are the navigation's own panels, re-titled with the nav item they
 * hang off. Deriving them here rather than storing a second copy is what stops the footer
 * drifting away from the menu — there is only one source for both.
 */
function footerColumns(entries: ReadonlyArray<NavEntryView>): ReadonlyArray<MegaMenuColumnView> {
  return entries
    .filter((entry) => entry.panel.columns.length > 0 || entry.panel.features.length > 0)
    .map((entry) => ({
      title: entry.label,
      items: [
        ...entry.panel.columns.flatMap((column) => column.items),
        ...entry.panel.features.map((feature) => ({ ...feature, description: "" })),
      ],
    }));
}

interface FooterColumnProps {
  readonly column: MegaMenuColumnView;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
}

function FooterColumn({ column, isOpen, onToggle }: FooterColumnProps) {
  const panelId = `footer-panel-${column.title.toLowerCase().replace(/\s+/g, "-")}`;
  const triggerId = `${panelId}-trigger`;

  return (
    <div className="border-b border-canvas-10 py-4 md:border-0 md:py-0">
      {/* Full canvas, where this was canvas-80 and the links under it were canvas-80 too —
          a heading and its list at one value is a paragraph, not a column. */}
      <button
        id={triggerId}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        className="label w-full text-left text-canvas md:pointer-events-none"
      >
        {column.title}
      </button>
      <ul id={panelId} data-open={isOpen} className="footer-accordion-panel mt-5 space-y-3">
        {/* Keyed on href AND label, because an href alone is not unique here. The Ways to
            Work panel is four tiers that all live on one page, so its four items share
            `/ways-to-work-with-us` — and this column is derived from that panel. Keying on
            href alone gave React four children with the same key, on every page, since the
            footer is on all of them. NavPanel and MobileDrawer already key this way. */}
        {column.items.map((item) => (
          <li key={`${item.href}-${item.label}`}>
            <Link href={item.href} className="footer-link text-small">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * THE SEAM. Every page hands the footer a dark section — FinalCta on six routes,
 * ContactFormSection on the seventh — and the footer is ink as well, so the two used to
 * meet at nothing. The hairline, the accent segment drawn across it and the tonal lift
 * below are what make this a boundary; see `.site-footer` in globals.css for why it takes
 * three cues rather than one border.
 *
 * The observer sits on the divider rather than on the footer, so the wipe fires as the
 * seam itself arrives rather than whenever the footer happens to be 15% visible — which,
 * on a footer this tall, would be most of a screen too early.
 */
function FooterSeam() {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.9, once: true });

  return (
    <div ref={ref} className="footer-divider" data-drawn={isInView}>
      <div className="mx-auto w-full" style={shellStyle}>
        <span className="footer-divider-accent" aria-hidden="true" />
      </div>
    </div>
  );
}

export function Footer({ entries, footer }: FooterProps) {
  const [openColumn, setOpenColumn] = useState<string | null>(null);
  const columns = footerColumns(entries);
  const hasBottomLinks = footer.legalLinks.length > 0 || footer.socialLinks.length > 0;

  return (
    <footer className="site-footer surface-dark bg-ink">
      <FooterSeam />

      <div className="mx-auto w-full" style={shellStyle}>
        {/* Twelve tracks, brand on four and the columns on the remaining seven with one
            left as the channel between them. The brand block was one fifth of a five-track
            grid before, which left the tagline breaking every four words against columns
            that had room to spare. */}
        <div className="grid gap-10 py-20 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Wordmark alt="Famysys Studio" dark className="h-8" />
            <p className="text-small mt-5 max-w-[34ch] text-canvas-60">{footer.tagline}</p>
            <a href={`mailto:${footer.contactEmail}`} className="footer-email text-small mt-6">
              {footer.contactEmail}
            </a>
          </div>

          <div className="grid gap-6 md:grid-cols-3 md:gap-8 lg:col-span-7 lg:col-start-6">
            {columns.map((column) => (
              <FooterColumn
                key={column.title}
                column={column}
                isOpen={openColumn === column.title}
                onToggle={() =>
                  setOpenColumn((current) => (current === column.title ? null : column.title))
                }
              />
            ))}
          </div>
        </div>

        {/* The legal and social rows are both empty by design — no documents exist yet and
            the brief supplies no handles, both recorded in marketing.content.ts. So this
            bar is a copyright line on its own, and it is laid out as one rather than as a
            three-up row with two holes in it: `justify-between` across an absent middle
            and right is what makes an intentional absence look like a broken grid. */}
        <div
          className={`border-t border-canvas-10 py-8 ${
            hasBottomLinks
              ? "flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
              : ""
          }`}
        >
          <p className="text-small text-canvas-60">
            &copy; {new Date().getFullYear()} Famysys Studio.
          </p>
          {footer.legalLinks.length > 0 ? (
            <div className="flex flex-wrap gap-6">
              {footer.legalLinks.map((link) => (
                <Link key={link.href} href={link.href} className="footer-link text-small">
                  {link.label}
                </Link>
              ))}
            </div>
          ) : null}
          {footer.socialLinks.length > 0 ? (
            <div className="flex flex-wrap gap-6">
              {footer.socialLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link text-small"
                >
                  {link.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
