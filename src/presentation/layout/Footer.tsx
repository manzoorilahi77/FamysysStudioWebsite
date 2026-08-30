"use client";

import Link from "next/link";
import { useState } from "react";
import type { FooterContentView, MegaMenuColumnView, NavEntryView } from "../lib/viewModels";
import { Wordmark } from "../components/Wordmark";

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
      <button
        id={triggerId}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        className="label w-full text-left text-canvas-80 md:pointer-events-none"
      >
        {column.title}
      </button>
      <ul id={panelId} data-open={isOpen} className="footer-accordion-panel mt-4 space-y-3">
        {column.items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="text-small text-canvas-80">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer({ entries, footer }: FooterProps) {
  const [openColumn, setOpenColumn] = useState<string | null>(null);
  const columns = footerColumns(entries);

  return (
    <footer className="surface-dark bg-ink">
      <div className="mx-auto w-full" style={{ maxWidth: "80rem", paddingInline: "var(--spacing-gutter)" }}>
        <div className="grid gap-8 py-16 md:grid-cols-5">
          <div className="md:col-span-1">
            <Wordmark alt="Famysys Studio" dark className="h-8" />
            <p className="text-small mt-3 text-canvas-80">{footer.tagline}</p>
            <a href={`mailto:${footer.contactEmail}`} className="text-small mt-3 block text-canvas-80">
              {footer.contactEmail}
            </a>
          </div>
          <div className="grid gap-4 md:col-span-4 md:grid-cols-3">
            {columns.map((column) => (
              <FooterColumn
                key={column.title}
                column={column}
                isOpen={openColumn === column.title}
                onToggle={() => setOpenColumn((current) => (current === column.title ? null : column.title))}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-canvas-10 py-8 md:flex-row md:items-center md:justify-between">
          <p className="text-small text-canvas-80">&copy; {new Date().getFullYear()} Famysys Studio.</p>
          <div className="flex flex-wrap gap-6">
            {footer.legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-small text-canvas-80">
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-4">
            {footer.socialLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-small text-canvas-80"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
