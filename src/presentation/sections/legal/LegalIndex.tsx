"use client";

import { useEffect, useState } from "react";
import { useActiveAnchor } from "../../hooks/useActiveAnchor";

/** One entry: the section's number, heading, and the anchor the article renders it with. */
export interface LegalIndexEntry {
  readonly number: string;
  readonly heading: string;
  readonly id: string;
}

interface LegalIndexProps {
  readonly label: string;
  /** Ids are computed by the server component, because a function cannot cross into a client one. */
  readonly entries: ReadonlyArray<LegalIndexEntry>;
}

/** Where the reading line sits, as a fraction of the viewport's height. */
const READING_LINE = 0.5;

/**
 * THE DOCUMENT'S INDEX, WITH THE CURRENT CLAUSE MARKED.
 *
 * famysys.com's index is plain links; the client asked for the entry of the clause the
 * reader is in to be highlighted, keyed on the clause reaching the MIDDLE of the screen.
 * So the reading line is half the viewport rather than the line just under the bar the
 * FAQ index measures from: a clause becomes current when its heading crosses the middle,
 * which is where the eye is. `useActiveAnchor` does the measuring — the last section
 * whose top has passed the line, so exactly one entry is current at every position.
 *
 * The line is re-measured on resize because it is a fraction of the viewport, and the
 * hook itself re-runs when the value changes.
 */
export function LegalIndex({ label, entries }: LegalIndexProps) {
  const [readingLinePx, setReadingLinePx] = useState(0);

  useEffect(() => {
    const measure = () => setReadingLinePx(Math.round(window.innerHeight * READING_LINE));
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const active = useActiveAnchor(
    entries.map((entry) => entry.id),
    readingLinePx,
  );

  return (
    <nav className="legal-index" aria-label={label}>
      <p className="label legal-index-label">{label}</p>
      <ol className="legal-index-list">
        {entries.map((entry) => {
          const isCurrent = active === entry.id;
          return (
            <li key={entry.number} data-current={isCurrent ? "true" : undefined}>
              <span className="label legal-index-number" aria-hidden="true">
                {entry.number}
              </span>
              <a
                href={`#${entry.id}`}
                className="text-small legal-index-link"
                aria-current={isCurrent ? "location" : undefined}
              >
                {entry.heading}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
