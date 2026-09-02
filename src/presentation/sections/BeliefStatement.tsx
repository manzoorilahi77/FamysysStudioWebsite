"use client";

import type { BeliefBlock } from "../../domain/about/entities/AboutPage";
import { motion } from "../../shared/design/tokens";
import { Container } from "../components/Container";
import { RevealHeading } from "../components/RevealHeading";
import { Section } from "../components/Section";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface BeliefStatementProps {
  readonly belief: BeliefBlock;
}

/**
 * The page's thesis, and THE SITE'S THIRD AND LAST CENTRED MOMENT.
 *
 * The homepage has the other two — the thesis line in The Differentiator, and the
 * closing CTA heading. Everything else on every page is flush left. That is what makes a
 * centred line read as emphasis rather than as a default, and it is why nothing else on
 * this page is centred: the statement carries no eyebrow, no rule and no supporting
 * line, because a second centred element beside it would spend the whole budget at once.
 * The section's own name comes from `label`, which is not rendered.
 *
 * `statement` padding gives it the most air any block on the site gets — the same
 * measure the homepage's thesis stands in.
 *
 * The only motion is a slightly longer entry than the copy around it: 520ms against
 * 320ms, the emphasis duration the Custom Partnership block uses. A different effect
 * would have been a new effect; a different duration is emphasis, and this page is
 * meant to feel quieter than the others.
 */
export function BeliefStatement({ belief }: BeliefStatementProps) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.2, once: true });
  const prefersReducedMotion = useReducedMotion();
  const hasArrived = prefersReducedMotion || isInView;

  return (
    <Section statement ariaLabel={belief.label}>
      <Container>
        <div
          ref={ref}
          style={{
            opacity: hasArrived ? 1 : 0,
            transform: hasArrived || prefersReducedMotion ? "translateY(0)" : "translateY(20px)",
            transitionProperty: "opacity, transform",
            transitionDuration: prefersReducedMotion
              ? `${motion.duration.reduced}ms`
              : `${motion.emphasis.entryMs}ms`,
            transitionTimingFunction: "var(--ease-base)",
          }}
        >
          <RevealHeading
            as="p"
            className="text-heading mx-auto max-w-[30ch] text-center font-medium text-balance text-ink"
          >
            {belief.statement}
          </RevealHeading>
        </div>
      </Container>
    </Section>
  );
}
