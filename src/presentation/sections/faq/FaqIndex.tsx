"use client";

import { useEffect, useState } from "react";
import { useActiveAnchor } from "../../hooks/useActiveAnchor";

interface FaqIndexProps {
  readonly label: string;
  readonly groups: ReadonlyArray<{ readonly id: string; readonly title: string; readonly count: number }>;
}

/** Where the sticky index rests below the fixed header, and the reading line it measures from. */
const INDEX_TOP_GAP_PX = 40;

/**
 * THE CATEGORY INDEX, IN TWO FORMS FROM ONE MARKUP.
 *
 * From lg it is a column down the left that stays put while the groups scroll past, and
 * the entry for the group the reader is in is marked — `useActiveAnchor` decides which,
 * by the last group whose heading has passed the reading line, so exactly one is current
 * at any scroll position. Below lg it is a row of jump links at the top of the page,
 * horizontally scrollable if the titles overrun, and NOT sticky: a bar pinned to the top
 * of a 390px screen for the length of four groups is a third of the viewport spent on
 * navigation. The group headings themselves are sticky on a phone instead — see
 * `.faqp-group-head` — so the reader always knows which group they are in.
 *
 * The count beside each title is the number of questions in the group. On a page whose
 * point is that nothing has to be opened to be read, the count is what tells a reader
 * how long each part is before they jump to it.
 */
export function FaqIndex({ label, groups }: FaqIndexProps) {
  const [headerHeight, setHeaderHeight] = useState(80);
  const active = useActiveAnchor(
    groups.map((group) => group.id),
    headerHeight + INDEX_TOP_GAP_PX,
  );

  // The header publishes its own measured height; read it once mounted so the reading
  // line tracks the real bar rather than the stylesheet's fallback.
  useEffect(() => {
    const published = getComputedStyle(document.documentElement).getPropertyValue("--header-height");
    const parsed = Number.parseFloat(published);
    if (Number.isFinite(parsed) && parsed > 0) {
      setHeaderHeight(parsed);
    }
  }, []);

  return (
    <nav className="faqp-index" aria-label={label}>
      <p className="label text-ink-70">{label}</p>
      <ol className="faqp-index-list">
        {groups.map((group, position) => (
          <li key={group.id}>
            <a
              href={`#${group.id}`}
              className="faqp-index-link text-small"
              aria-current={active === group.id ? "location" : undefined}
            >
              <span className="faqp-index-ordinal label" aria-hidden="true">
                {String(position + 1).padStart(2, "0")}
              </span>
              <span className="faqp-index-title">{group.title}</span>
              <span className="faqp-index-count tabular" aria-hidden="true">
                {group.count}
              </span>
              <span className="sr-only">
                , {group.count} {group.count === 1 ? "question" : "questions"}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
