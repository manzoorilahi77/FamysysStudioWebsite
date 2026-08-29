"use client";

import Link from "next/link";
import { useState } from "react";
import type { FooterContentView, MegaMenuColumnView } from "../lib/viewModels";

interface FooterProps {
  readonly megaMenu: ReadonlyArray<MegaMenuColumnView>;
  readonly footer: FooterContentView;
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

export function Footer({ megaMenu, footer }: FooterProps) {
  const [openColumn, setOpenColumn] = useState<string | null>(null);

  return (
    <footer className="surface-dark bg-ink">
      <div className="mx-auto w-full" style={{ maxWidth: "80rem", paddingInline: "var(--spacing-gutter)" }}>
        <div className="grid gap-8 py-16 md:grid-cols-5">
          <div className="md:col-span-1">
            <p className="text-display-s font-medium text-canvas">Famysys Studio</p>
            <p className="text-small mt-3 text-canvas-80">{footer.tagline}</p>
            <a href={`mailto:${footer.contactEmail}`} className="text-small mt-3 block text-canvas-80">
              {footer.contactEmail}
            </a>
          </div>
          <div className="grid gap-4 md:col-span-4 md:grid-cols-4">
            {megaMenu.map((column) => (
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
