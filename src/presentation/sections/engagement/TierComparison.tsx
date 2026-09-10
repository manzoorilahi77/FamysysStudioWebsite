"use client";

import { useEffect, useRef, useState } from "react";
import type {
  ComparisonRowLabels,
  TierComparison as TierComparisonContent,
} from "../../../domain/engagement/entities/WaysToWorkPage";
import { motion } from "../../../shared/design/tokens";
import { Container } from "../../components/Container";
import { Section } from "../../components/Section";
import { SectionHeader } from "../../components/SectionHeader";
import { useInView } from "../../hooks/useInView";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import type { EngagementTierDetailView } from "../../lib/viewModels";

/** Below this the table becomes a swipe of column cards. Matches the `lg` breakpoint. */
const DESKTOP_QUERY = "(min-width: 1024px)";

interface TierComparisonProps {
  readonly comparison: TierComparisonContent;
  readonly tiers: ReadonlyArray<EngagementTierDetailView>;
}

interface Row {
  readonly label: string;
  readonly valueOf: (tier: EngagementTierDetailView) => string;
  readonly itemsOf?: (tier: EngagementTierDetailView) => ReadonlyArray<string>;
}

/**
 * Rows in the brief's own order: the two facts it supplies first, then the two this page
 * drafted. `itemsOf` is present only where the approved value is a list sentence, so the
 * cell can render it as a list without a second copy of the string existing anywhere.
 */
function rowsFor(labels: ComparisonRowLabels): ReadonlyArray<Row> {
  return [
    {
      label: labels.idealFor,
      valueOf: (tier) => tier.idealFor,
      itemsOf: (tier) => tier.idealForItems,
    },
    {
      label: labels.typicalWork,
      valueOf: (tier) => tier.typicalWork,
      itemsOf: (tier) => tier.typicalWorkItems,
    },
    { label: labels.bestWhen, valueOf: (tier) => tier.bestWhen },
    { label: labels.engagementShape, valueOf: (tier) => tier.engagementShape },
  ];
}

function CellValue({ row, tier }: { readonly row: Row; readonly tier: EngagementTierDetailView }) {
  const items = row.itemsOf?.(tier);
  if (!items) {
    return <span className="text-small text-ink-70">{row.valueOf(tier)}</span>;
  }
  // The marker is a hanging hairline dash drawn in CSS, not a bullet glyph: a list of
  // audiences is not a checklist, and a disc would put a second dot shape on a page whose
  // only other dots are the swipe indicator. Inside the live column the dashes take the
  // accent, which is the one place the interaction reaches down into the detail.
  return (
    <ul className="text-small text-ink-70">
      {items.map((item) => (
        <li key={item} className="comparison-item">
          {item}
        </li>
      ))}
    </ul>
  );
}

function DesktopTable({
  comparison,
  tiers,
  rows,
  isVisible,
  prefersReducedMotion,
}: {
  readonly comparison: TierComparisonContent;
  readonly tiers: ReadonlyArray<EngagementTierDetailView>;
  readonly rows: ReadonlyArray<Row>;
  readonly isVisible: boolean;
  readonly prefersReducedMotion: boolean;
}) {
  // THE LIVE COLUMN. Pointing at or tabbing into any cell raises the whole column it
  // belongs to — the fill steps up, the tier name takes the accent and an accent edge
  // draws across the top of the head. The section's entire job is "which of these three
  // is me", so the one interaction it carries is choosing a column: the reader's own
  // gesture, answered. Held in state rather than done in CSS because :hover on a cell
  // cannot reach the other cells of its column, and the effect is worth nothing a cell
  // at a time.
  const [liveColumn, setLiveColumn] = useState<number | null>(null);

  // Focus bubbles in React, so the handler on the cell catches the link inside it too,
  // and the keyboard reader gets the same column raised that the pointer would.
  const columnProps = (index: number) => ({
    "data-active": liveColumn === index ? "true" : "false",
    onMouseEnter: () => setLiveColumn(index),
    onFocus: () => setLiveColumn(index),
  });

  return (
    <table
      className="comparison-table"
      onMouseLeave={() => setLiveColumn(null)}
      onBlur={() => setLiveColumn(null)}
    >
      <caption className="sr-only">{comparison.caption}</caption>
      <thead>
        <tr>
          {/* The corner cell labels nothing, so it is an empty <td>, not a <th>: a
              header cell with no content is announced as an empty column header. */}
          <td className="comparison-corner" />
          {tiers.map((tier, index) => (
            <th key={tier.slug} scope="col" className="comparison-head" {...columnProps(index)}>
              <span className="comparison-tier-name text-display-s block font-medium text-ink">
                {tier.name}
              </span>
              <span className="text-small mt-1 block font-normal text-accent">
                {tier.descriptor}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr
            key={row.label}
            className="comparison-row"
            data-visible={prefersReducedMotion || isVisible}
            style={{
              transitionDelay: prefersReducedMotion
                ? "0ms"
                : `${index * motion.stagger.diagonalStepMs}ms`,
            }}
          >
            <th scope="row" className="comparison-label label text-ink-70">
              {row.label}
            </th>
            {tiers.map((tier, column) => (
              <td
                key={`${row.label}-${tier.slug}`}
                className="comparison-cell"
                {...columnProps(column)}
              >
                <CellValue row={row} tier={tier} />
              </td>
            ))}
          </tr>
        ))}
        {/* The way out of each column, and an empty label cell on the corner cell's own
            reasoning: nothing is being labelled here, and each link names its own tier,
            so the row reads in both axes without a row header. The tier name in the head
            used to be the only link out of the table, which nothing announced as one. */}
        <tr
          className="comparison-row"
          data-visible={prefersReducedMotion || isVisible}
          style={{
            transitionDelay: prefersReducedMotion
              ? "0ms"
              : `${rows.length * motion.stagger.diagonalStepMs}ms`,
          }}
        >
          <td className="comparison-label" />
          {tiers.map((tier, column) => (
            <td key={`read-${tier.slug}`} className="comparison-cell" {...columnProps(column)}>
              <a href={`#${tier.slug}`} className="inline-link text-small font-medium text-accent">
                {tier.name} in detail &rarr;
              </a>
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

function MobileSwipe({
  tiers,
  rows,
}: {
  readonly tiers: ReadonlyArray<EngagementTierDetailView>;
  readonly rows: ReadonlyArray<Row>;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    function handleScroll(): void {
      if (!track) {
        return;
      }
      const itemWidth = track.scrollWidth / tiers.length;
      setActiveIndex(Math.round(track.scrollLeft / itemWidth));
    }
    track.addEventListener("scroll", handleScroll, { passive: true });
    return () => track.removeEventListener("scroll", handleScroll);
  }, [tiers.length]);

  return (
    <div>
      <div className="comparison-swipe" ref={trackRef}>
        {tiers.map((tier) => (
          <div key={tier.slug} className="comparison-swipe-item card-surface p-6">
            <p className="text-display-s font-medium text-ink">{tier.name}</p>
            <p className="text-small mt-1 text-accent">{tier.descriptor}</p>
            <dl className="mt-6 space-y-5">
              {rows.map((row) => (
                <div key={row.label}>
                  <dt className="label text-ink-70">{row.label}</dt>
                  <dd className="mt-2">
                    <CellValue row={row} tier={tier} />
                  </dd>
                </div>
              ))}
            </dl>
            {/* The same way out the desktop table gained, so the swipe is not the one
                rendering a reader can leave only by scrolling back up. */}
            <a
              href={`#${tier.slug}`}
              className="inline-link text-small mt-6 inline-block font-medium text-accent"
            >
              {tier.name} in detail &rarr;
            </a>
          </div>
        ))}
      </div>
      <div className="comparison-dots" role="group" aria-label="Engagement tiers">
        {tiers.map((tier, index) => (
          <button
            key={tier.slug}
            type="button"
            aria-current={index === activeIndex ? "true" : undefined}
            aria-label={tier.name}
            className="comparison-dot"
            onClick={() => {
              const item = trackRef.current?.children[index];
              item?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
            }}
          >
            <span aria-hidden="true" className="comparison-dot-mark" />
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * The three named tiers side by side. A fit-finder rather than a pricing table: every
 * cell says what a tier IS, none says what it lacks, and there are no ticks or crosses.
 * A feature-gated grid implies a cost ladder even with no figures on it, and the brief
 * forbids public pricing.
 *
 * THREE PANELS, NOT FOUR COLUMNS OF GREY TEXT. The rows used to be hairlines across an
 * open grid: nothing held a column together, and a tier could only be read across, never
 * down. Each tier is now a filled panel a hairline from its neighbours, with the row
 * labels on a rail outside the panels, so the table reads in both directions. The three
 * fills are identical at rest on purpose — tinting the middle column is how a comparison
 * says "recommended", and the brief names no recommended tier.
 *
 * Real table semantics at desktop — `<table>`, `<caption>`, `<th scope>` on both axes —
 * because a reader on a screen reader navigating a comparison needs the row and column
 * headers announced with each cell, and a grid of divs cannot supply that. The tier heads
 * stay put while their rows scroll under them, since a cell four rows down means nothing
 * without the name above it. Below `lg` that becomes a horizontal swipe of column cards
 * with scroll-snap and a dot indicator, since four rows across three columns cannot be
 * read on a 390px screen.
 *
 * ONE source, ONE tree: the breakpoint is a `matchMedia` gate driving a conditional
 * render, not two markup trees hidden from each other with CSS. Two trees would put
 * every cell in the accessibility tree twice and double the page's content for a
 * screen reader. `rowsFor` is the single definition both renderings read.
 */
export function TierComparison({ comparison, tiers }: TierComparisonProps) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.15, once: true });
  const prefersReducedMotion = useReducedMotion();
  const rows = rowsFor(comparison.rowLabels);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_QUERY);
    setIsDesktop(mediaQuery.matches);
    const handleChange = (event: MediaQueryListEvent): void => setIsDesktop(event.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <Section cmsSection="tier-comparison" ariaLabel={comparison.heading}>
      <Container>
        {/* Split, like every other header on the site that has a supporting line: stacked,
            it left the whole right half of the section empty above a full-width table. */}
        <SectionHeader
          split
          eyebrow={comparison.eyebrow}
          heading={comparison.heading}
          body={comparison.body}
        />
        <div ref={ref} className="mt-14">
          {isDesktop ? (
            <DesktopTable
              comparison={comparison}
              tiers={tiers}
              rows={rows}
              isVisible={isInView}
              prefersReducedMotion={prefersReducedMotion}
            />
          ) : (
            <MobileSwipe tiers={tiers} rows={rows} />
          )}
        </div>
      </Container>
    </Section>
  );
}
