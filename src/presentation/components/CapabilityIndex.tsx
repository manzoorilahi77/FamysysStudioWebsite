"use client";

import { useEffect, useState } from "react";
import { useActiveAnchor } from "../hooks/useActiveAnchor";

interface CapabilityIndexProps {
  readonly label: string;
  readonly items: ReadonlyArray<{ readonly slug: string; readonly title: string }>;
}

/** Fallback until the header is measured — the header's own height at the desktop step. */
const ASSUMED_HEADER_PX = 83;

/**
 * A compact anchor list of the six capabilities, sticky under the header from `md` up and
 * a horizontally scrolling strip below it. The active link is the section the reader is
 * currently in, not the one they last clicked, so it stays right when they scroll away.
 *
 * The offsets are measured from the rendered header rather than written down as a number.
 * The header's height changes at `xl` (the button pair appears) and would change again
 * with any nav edit, and a stale constant here shows up as an anchor jump that lands with
 * the heading hidden behind the bar — a bug nobody attributes to this file. The measured
 * total is published as a custom property so `scroll-margin-top` on the sections can use
 * the same number without duplicating the measurement.
 */
export function CapabilityIndex({ label, items }: CapabilityIndexProps) {
  const [headerHeight, setHeaderHeight] = useState(ASSUMED_HEADER_PX);
  const [indexHeight, setIndexHeight] = useState(0);
  const activeSlug = useActiveAnchor(
    items.map((item) => item.slug),
    headerHeight + indexHeight,
  );

  useEffect(() => {
    const header = document.querySelector("header");
    const index = document.getElementById("capability-index");
    if (!header || !index) {
      return;
    }

    function measure(): void {
      const nextHeader = header?.offsetHeight ?? ASSUMED_HEADER_PX;
      const nextIndex = index?.offsetHeight ?? 0;
      setHeaderHeight(nextHeader);
      setIndexHeight(nextIndex);
      document.documentElement.style.setProperty(
        "--services-anchor-offset",
        `${nextHeader + nextIndex}px`,
      );
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    observer.observe(index);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--services-anchor-offset");
    };
  }, []);

  return (
    <nav
      id="capability-index"
      data-cms-section="capability-index"
      aria-label={label}
      className="capability-index bg-canvas border-b border-ink-8 md:sticky md:z-30"
      style={{ top: `${headerHeight}px` }}
    >
      <ul className="capability-index-list">
        {items.map((item) => (
          <li key={item.slug}>
            <a
              href={`#${item.slug}`}
              className="capability-index-link"
              data-active={item.slug === activeSlug}
              aria-current={item.slug === activeSlug ? "true" : undefined}
            >
              {item.title}
              <span className="capability-index-rule" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
