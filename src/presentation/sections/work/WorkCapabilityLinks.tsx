"use client";

import Link from "next/link";
import type { CapabilityCrossLink } from "../../../domain/portfolio/entities/SelectedWorkPage";
import { motion } from "../../../shared/design/tokens";
import { Container } from "../../components/Container";
import { Section } from "../../components/Section";
import { SectionHeader } from "../../components/SectionHeader";
import { useInView } from "../../hooks/useInView";
import { useReducedMotion } from "../../hooks/useReducedMotion";

interface WorkCapabilityLinksProps {
  readonly crossLink: CapabilityCrossLink;
}

/** Rows arrive top to bottom. The step is the site's standard list step. */
const ROW_STEP_MS = 60;

/**
 * The path out. A reader who has just worked through eight pieces is one step from
 * asking what the studio actually sells, and this is the only place on the page that
 * answers it — every fragment resolves to a section that already exists on
 * /creative-services, and the test asserts that rather than trusting the string.
 *
 * It is a navigation block and is now built as one: a short heading, no introduction,
 * and six rows. Two sentences explaining that the links lead to the capability pages
 * were doing work the six named rows already do.
 *
 * What replaces the copy is the interaction, which costs no words. A row's background
 * sweeps in from the left as a scaleX on a pseudo-element — compositor work, not a
 * growing box — the name shifts right by 8px and the arrow by 4px into accent, all on
 * the locked 200ms hover step. Focus gets the identical treatment, so the row reads the
 * same way whether it was pointed at or tabbed to.
 *
 * On entry each row's hairline draws left to right first and the text follows one fast
 * step behind it, so the list assembles rule-then-name, rule-then-name down the column
 * rather than appearing as six finished rows. Under reduced motion every delay is zero
 * and every rule starts drawn.
 */
export function WorkCapabilityLinks({ crossLink }: WorkCapabilityLinksProps) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.15, once: true });
  const prefersReducedMotion = useReducedMotion();
  const hasArrived = prefersReducedMotion || isInView;

  const ruleDelay = (index: number): number => (prefersReducedMotion ? 0 : index * ROW_STEP_MS);
  const textDelay = (index: number): number =>
    prefersReducedMotion ? 0 : ruleDelay(index) + motion.duration.fast;

  return (
    <Section cmsSection="capability-links" ariaLabel={crossLink.heading}>
      <Container>
        <SectionHeader eyebrow={crossLink.eyebrow} heading={crossLink.heading} />
        <div ref={ref} className="capability-links mt-12" data-drawn={hasArrived}>
          <ul>
            {crossLink.links.map((link, index) => (
              <li key={link.href} className="capability-row">
                <span
                  className="capability-rule"
                  aria-hidden="true"
                  style={{ transitionDelay: `${ruleDelay(index)}ms` }}
                />
                <Link
                  href={link.href}
                  className="capability-link"
                  data-visible={hasArrived}
                  style={{ transitionDelay: `${textDelay(index)}ms` }}
                >
                  <span className="capability-link-name text-display-s font-medium text-ink">
                    {link.title}
                  </span>
                  <span aria-hidden="true" className="capability-link-arrow text-ink-70">
                    &rarr;
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {/* The rule that closes the list, drawn last. A sibling of the list rather than
              a seventh item in it, so the count a screen reader announces stays six. */}
          <span
            className="capability-rule"
            aria-hidden="true"
            style={{ transitionDelay: `${ruleDelay(crossLink.links.length)}ms` }}
          />
        </div>
      </Container>
    </Section>
  );
}
