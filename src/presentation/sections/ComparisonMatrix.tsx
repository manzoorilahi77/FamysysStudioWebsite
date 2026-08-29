"use client";

import { useEffect, useRef, useState } from "react";
import type { AlternativeColumn } from "../../domain/comparison/entities/AlternativeColumn";
import type { SectionIntro } from "../../domain/marketing/entities/SectionIntro";
import type { ComparisonCriterionView } from "../lib/viewModels";
import { Container } from "../components/Container";
import { Eyebrow } from "../components/Eyebrow";
import { Section } from "../components/Section";

const DESKTOP_QUERY = "(min-width: 1024px)";

interface ComparisonMatrixProps {
  readonly intro: SectionIntro;
  readonly columns: ReadonlyArray<AlternativeColumn>;
  readonly criteria: ReadonlyArray<ComparisonCriterionView>;
}

/** Filled accent check for the highlighted brand row, a neutral outline dot everywhere else —
    the source copy is comparative prose, not a pass/fail claim about competitors, so only the
    brand row (uniformly framed as advantageous by design) earns the "check" treatment. */
function StatusIcon({ isBrand }: { readonly isBrand: boolean }) {
  if (isBrand) {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="shrink-0">
        <circle cx="9" cy="9" r="9" fill="var(--color-accent)" />
        <path d="M5 9.2l2.4 2.4L13 6" stroke="var(--color-canvas)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="shrink-0">
      <circle cx="9" cy="9" r="8" fill="none" stroke="var(--color-ink-20)" strokeWidth="1.4" />
    </svg>
  );
}

function DesktopTable({
  columns,
  criteria,
}: {
  columns: ReadonlyArray<AlternativeColumn>;
  criteria: ReadonlyArray<ComparisonCriterionView>;
}) {
  return (
    <table className="w-full border-collapse text-left">
      <caption className="sr-only">Comparison of Famysys Studio against alternative ways to produce video</caption>
      <thead>
        <tr>
          <th scope="col" className="p-4 align-bottom text-small text-ink-70">
            &nbsp;
          </th>
          {criteria.map((row) => (
            <th key={row.label} scope="col" className="text-small w-40 p-4 align-bottom font-medium text-ink">
              {row.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {columns.map((column, columnIndex) => (
          <tr
            key={column.name}
            className="border-t border-ink-8"
            style={{
              backgroundColor: column.isHighlighted ? "var(--color-accent-8)" : undefined,
              borderTop: column.isHighlighted ? "2px solid var(--color-accent)" : undefined,
              borderBottom: column.isHighlighted ? "2px solid var(--color-accent)" : undefined,
            }}
          >
            <th
              scope="row"
              className="text-body p-4 align-top font-medium"
              style={{ color: column.isHighlighted ? "var(--color-accent)" : "var(--color-ink)" }}
            >
              {column.name}
            </th>
            {criteria.map((row) => (
              <td key={`${column.name}-${row.label}`} className="p-4 align-top">
                <div className="flex items-start gap-2">
                  <StatusIcon isBrand={column.isHighlighted} />
                  <span className="text-small text-ink-70">{row.valuesByColumn[columnIndex]}</span>
                </div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MobileSwipe({
  columns,
  criteria,
}: {
  columns: ReadonlyArray<AlternativeColumn>;
  criteria: ReadonlyArray<ComparisonCriterionView>;
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
      const itemWidth = track.scrollWidth / columns.length;
      setActiveIndex(Math.round(track.scrollLeft / itemWidth));
    }
    track.addEventListener("scroll", handleScroll, { passive: true });
    return () => track.removeEventListener("scroll", handleScroll);
  }, [columns.length]);

  return (
    <div>
      <div className="comparison-swipe" ref={trackRef}>
        {columns.map((column) => (
          <div
            key={column.name}
            className="comparison-swipe-item rounded-sm p-6"
            style={{
              backgroundColor: column.isHighlighted ? "var(--color-ink-4)" : "var(--color-canvas)",
              border: "1px solid var(--color-ink-8)",
              borderTop: column.isHighlighted ? "2px solid var(--color-accent)" : undefined,
            }}
          >
            <p className="text-display-s font-medium text-ink">{column.name}</p>
            <dl className="mt-4 space-y-4">
              {criteria.map((row, rowIndex) => (
                <div key={row.label}>
                  <dt className="flex items-center gap-2 label text-ink-70">
                    <StatusIcon isBrand={column.isHighlighted} />
                    {row.label}
                  </dt>
                  <dd className="text-small mt-1 text-ink-70">{row.valuesByColumn[rowIndex]}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-center" role="group" aria-label="Comparison columns">
        {columns.map((column, index) => (
          <button
            key={column.name}
            type="button"
            aria-current={index === activeIndex ? "true" : undefined}
            aria-label={column.name}
            onClick={() => {
              const track = trackRef.current;
              const item = track?.children[index];
              item?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
            }}
            className="flex items-center justify-center"
            style={{ width: "44px", height: "44px" }}
          >
            <span
              aria-hidden="true"
              className="block h-2 w-2 rounded-full"
              style={{ backgroundColor: index === activeIndex ? "var(--color-accent)" : "var(--color-ink-20)" }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ComparisonMatrix({ intro, columns, criteria }: ComparisonMatrixProps) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_QUERY);
    setIsDesktop(mediaQuery.matches);
    const handleChange = (event: MediaQueryListEvent): void => setIsDesktop(event.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <Section ariaLabel={intro.heading}>
      <Container>
        <div className="mx-auto max-w-[42ch] text-center">
          <Eyebrow>{intro.eyebrow}</Eyebrow>
          <h2 className="text-display-l mt-4 font-medium text-ink">{intro.heading}</h2>
        </div>
        <div className="mt-12" style={{ overflowX: isDesktop ? "auto" : undefined }}>
          {isDesktop ? (
            <DesktopTable columns={columns} criteria={criteria} />
          ) : (
            <MobileSwipe columns={columns} criteria={criteria} />
          )}
        </div>
      </Container>
    </Section>
  );
}
