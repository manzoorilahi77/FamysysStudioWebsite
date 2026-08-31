"use client";

import { useEffect, useState } from "react";
import { motion } from "../../shared/design/tokens";
import { ClipNumber } from "./ClipNumber";
import { useActiveAnchor } from "../hooks/useActiveAnchor";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface ProcessOverviewProps {
  readonly label: string;
  readonly steps: ReadonlyArray<{ readonly slug: string; readonly title: string }>;
}

/** Fallback until the header is measured — the header's own height at the desktop step. */
const ASSUMED_HEADER_PX = 83;

/** Each segment gets an equal share of the 900ms draw, so the rule arrives a step at a time. */
function segmentDelayMs(index: number, stepCount: number): number {
  return (index * motion.duration.draw) / stepCount;
}

/**
 * The five steps as one compact horizontal sequence: numerals on a hairline with the step
 * names beside them, exactly the treatment §4 of the homepage uses at full size. It is
 * both the page's summary and its jump-link index, which is why it is one bar rather than
 * a summary section plus a separate nav.
 *
 * From `md` up it sticks under the header; below that it is a horizontally scrolling strip,
 * because five step names cannot wrap into anything readable on a phone and a sticky second
 * bar would eat a third of a 390px viewport.
 *
 * The offsets are measured from the rendered header rather than written down as a number —
 * the header changes height at `xl`, and a stale constant shows up as an anchor jump landing
 * with the heading hidden behind the bar. The measured total is published as a custom
 * property so `scroll-margin-top` on the step blocks uses the same number.
 */
export function ProcessOverview({ label, steps }: ProcessOverviewProps) {
  const [headerHeight, setHeaderHeight] = useState(ASSUMED_HEADER_PX);
  const [overviewHeight, setOverviewHeight] = useState(0);
  const [drawRef, hasEntered] = useInView<HTMLOListElement>({ threshold: 0.2, once: true });
  const prefersReducedMotion = useReducedMotion();
  const activeSlug = useActiveAnchor(
    steps.map((step) => step.slug),
    headerHeight + overviewHeight,
  );

  useEffect(() => {
    const header = document.querySelector("header");
    const overview = document.getElementById("process-overview");
    if (!header || !overview) {
      return;
    }

    function measure(): void {
      const nextHeader = header?.offsetHeight ?? ASSUMED_HEADER_PX;
      const nextOverview = overview?.offsetHeight ?? 0;
      setHeaderHeight(nextHeader);
      setOverviewHeight(nextOverview);
      document.documentElement.style.setProperty(
        "--process-anchor-offset",
        `${nextHeader + nextOverview}px`,
      );
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    observer.observe(overview);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--process-anchor-offset");
    };
  }, []);

  const isDrawn = prefersReducedMotion || hasEntered;

  return (
    <nav
      id="process-overview"
      aria-label={label}
      className="process-overview bg-canvas border-b border-ink-8 md:sticky md:z-30"
      style={{ top: `${headerHeight}px` }}
    >
      <ol ref={drawRef} className="process-overview-list">
        {steps.map((step, index) => (
          <li key={step.slug} className="process-overview-item" data-drawn={isDrawn}>
            <a
              href={`#${step.slug}`}
              className="process-overview-link"
              data-active={step.slug === activeSlug}
              aria-current={step.slug === activeSlug ? "true" : undefined}
            >
              {/* Decorative: the ordinal is already carried by the <ol>, and the step
                  block below repeats it at display size. A screen reader announcing
                  "zero one" before "Understand" would be reading the list back to
                  itself. Generated content rather than a text node — see
                  `.decorative-numeral` in globals.css for why that has to be the
                  mechanism rather than `aria-hidden` alone. */}
              <span aria-hidden="true">
                <ClipNumber
                  value={String(index + 1).padStart(2, "0")}
                  className="process-overview-numeral"
                  isVisible={isDrawn}
                  delayMs={index * motion.stagger.numeralStepMs}
                  isDecorative
                />
              </span>
              <span className="process-overview-name">{step.title}</span>
            </a>
            <span
              className="process-overview-rule"
              aria-hidden="true"
              style={{
                transitionDelay: prefersReducedMotion
                  ? "0ms"
                  : `${segmentDelayMs(index, steps.length)}ms`,
              }}
            />
          </li>
        ))}
      </ol>
    </nav>
  );
}
