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
  /**
   * Pins which of the two dark grounds this section takes, instead of letting THE SECTION
   * SEAM count preceding dark sections and alternate them.
   *
   * The seam's counting is right for a page whose dark sections are occasional. The
   * homepage's are not: from What We Do down it alternates light and dark on every
   * section, and left to count, the darks came out ink, alt, ink, alt — four sections
   * carrying two different greens where the design calls for one. Naming it here is the
   * only way to say "these three are the same colour" without unpicking the seam for
   * every other page, and an inline variable is what beats a seven-deep sibling chain.
   *
   * The hero and the closing CTA pass nothing and keep the base navy the seam gives them.
   */
  readonly ground?: "base" | "alt";
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
  ground,
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
        ...(ground
          ? {
              "--section-ground":
                ground === "alt" ? "var(--color-section-alt)" : "var(--color-ink)",
              "--section-ground-entering":
                ground === "alt"
                  ? "var(--color-section-alt-entering)"
                  : "var(--color-ink-90)",
              "--color-hairline-on-dark":
                ground === "alt"
                  ? "var(--color-hairline-on-section-alt)"
                  : "var(--color-canvas-10)",
            }
          : {}),
        // Both ends of the fade come from the section-ground variables rather than from
        // `ink` directly, so a dark section that the seam rules have moved onto the
        // alternate navy fades from its OWN 90% step to its own ground. Naming ink here
        // would make every alternate section flash the base navy before settling.
        // The fallbacks are what a dark section outside a run resolves to.
        ...(dark && fade
          ? {
              backgroundColor: isInView
                ? "var(--section-ground, var(--color-ink))"
                : "var(--section-ground-entering, var(--color-ink-90))",
            }
          : {}),
      } as React.CSSProperties}
    >
      {children}
    </section>
  );
}
