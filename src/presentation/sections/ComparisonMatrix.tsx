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
          {columns.map((column) => (
            <th
              key={column.name}
              scope="col"
              className="text-body p-4 align-bottom font-medium text-ink"
              style={{
                backgroundColor: column.isHighlighted ? "var(--color-ink-4)" : undefined,
                borderTop: column.isHighlighted ? "2px solid var(--color-accent)" : undefined,
              }}
            >
              {column.name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {criteria.map((row) => (
          <tr key={row.label} className="border-t border-ink-8">
            <th scope="row" className="text-small p-4 align-top font-medium text-ink-70">
              {row.label}
            </th>
            {row.valuesByColumn.map((value, columnIndex) => {
              const column = columns[columnIndex];
              return (
                <td
                  key={`${row.label}-${column?.name ?? columnIndex}`}
                  className="text-small p-4 align-top text-ink-70"
                  style={{ backgroundColor: column?.isHighlighted ? "var(--color-ink-4)" : undefined }}
                >
                  {value}
                </td>
              );
            })}
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
                  <dt className="label text-ink-70">{row.label}</dt>
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
        <Eyebrow>{intro.eyebrow}</Eyebrow>
        <h2 className="text-display-l mt-4 font-medium text-ink">{intro.heading}</h2>
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
