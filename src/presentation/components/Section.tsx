"use client";

import type { ReactNode } from "react";
import { spacing } from "../../shared/design/tokens";
import { useInView } from "../hooks/useInView";

interface SectionProps {
  readonly children: ReactNode;
  readonly id?: string;
  readonly dark?: boolean;
  /** Reserved for the page's two standalone centred statements, which get the most air. */
  readonly statement?: boolean;
  readonly ariaLabel?: string;
  readonly className?: string;
  /**
   * Dark sections settle their background from ink-90 to ink as they enter. Opt out where
   * the section carries accent-on-dark text: that colour is derived against full ink
   * (5.015:1) and measures only 3.79:1 against the fade's start value, ink-90 composited
   * over canvas (#22405D). Canvas text survives the start state at 9.616:1, which is why
   * the fade was safe until something other than canvas sat on it. The failure is also
   * intermittent — it depends on how far a section has entered when anything looks — so
   * the fade is switched off rather than the colour worked around.
   */
  readonly fade?: boolean;
}

function paddingFor(dark: boolean, statement: boolean): string {
  if (statement) {
    return spacing.statement;
  }
  return dark ? spacing.sectionDark : spacing.section;
}

/**
 * Vertical rhythm is deliberately uneven — every section sharing one padding value is
 * what made the page read as a list. Dark sections get more air than light ones, and a
 * statement section more again.
 *
 * Dark sections also settle their background as they enter, from ink-90 (#223F5C over
 * canvas) to full ink. The start state still holds canvas text at 9.616:1, so nothing
 * is unreadable part-way through the fade.
 */
export function Section({
  children,
  id,
  dark = false,
  statement = false,
  ariaLabel,
  className = "",
  fade = true,
}: SectionProps) {
  const [ref, isInView] = useInView<HTMLElement>({ threshold: 0.05, once: true });

  return (
    <section
      ref={ref}
      id={id}
      aria-label={ariaLabel}
      className={`${dark ? "surface-dark bg-ink text-canvas" : "bg-canvas text-ink"} ${
        dark && fade ? "section-fade" : ""
      } ${className}`}
      style={{
        paddingBlock: paddingFor(dark, statement),
        ...(dark && fade
          ? { backgroundColor: isInView ? "var(--color-ink)" : "var(--color-ink-90)" }
          : {}),
      }}
    >
      {children}
    </section>
  );
}
