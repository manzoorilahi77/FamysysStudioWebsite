"use client";

import type { ProgressionBlock } from "../../domain/portfolio/entities/SelectedWorkPage";
import { motion } from "../../shared/design/tokens";
import { ClipNumber } from "../components/ClipNumber";
import { Container } from "../components/Container";
import { Section } from "../components/Section";
import { SectionHeader } from "../components/SectionHeader";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";
import type { CaseStudyDetailView } from "../lib/viewModels";

interface WorkProgressionProps {
  readonly progression: ProgressionBlock;
  readonly pieces: ReadonlyArray<CaseStudyDetailView>;
}

/**
 * The arc the eight pieces describe, made visible.
 *
 * The stages reference pieces by slug and the titles are resolved here, so the approved
 * names appear once in the content file and once on the page — never restated inside a
 * stage's own prose, where they could drift into a paraphrase.
 *
 * Dark, and it KEEPS the entry fade: every colour in this block is canvas or canvas-80,
 * which hold at 9.616:1 and 8.548:1 against the fade's start value as well as against
 * settled ink. The accent-on-dark that forces `fade={false}` elsewhere is not used here.
 */
export function WorkProgression({ progression, pieces }: WorkProgressionProps) {
  const [ref, isInView] = useInView<HTMLOListElement>({ threshold: 0.15, once: true });
  const prefersReducedMotion = useReducedMotion();
  const hasArrived = prefersReducedMotion || isInView;

  const titleOf = (slug: string): string =>
    pieces.find((piece) => piece.slug === slug)?.title ?? slug;

  return (
    <Section dark ariaLabel={progression.heading}>
      <Container>
        <SectionHeader
          eyebrow={progression.eyebrow}
          heading={progression.heading}
          body={progression.body}
          dark
        />
        <ol ref={ref} className="progression-list mt-14">
          {progression.stages.map((stage, index) => (
            <li key={stage.title} className="progression-stage">
              <div className="progression-stage-mark">
                {/* Decorative: the ordinal is already carried by the <ol> this sits in. */}
                <span aria-hidden="true">
                  <ClipNumber
                    value={String(index + 1).padStart(2, "0")}
                    className="progression-numeral text-display-m font-medium"
                    isVisible={hasArrived}
                    delayMs={prefersReducedMotion ? 0 : index * motion.stagger.numeralStepMs}
                    isDecorative
                  />
                </span>
              </div>
              <div className="progression-stage-body">
                <h3 className="text-display-s font-medium text-canvas">{stage.title}</h3>
                <p className="text-body mt-3 text-canvas-80" style={{ maxWidth: "58ch" }}>
                  {stage.body}
                </p>
                <ul className="progression-pieces mt-5">
                  {stage.pieceSlugs.map((slug) => (
                    <li key={slug}>
                      <a href={`#${slug}`} className="text-small text-canvas-80">
                        {titleOf(slug)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
