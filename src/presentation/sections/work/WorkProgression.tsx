"use client";

import type { ReactElement } from "react";
import type { ProgressionBlock } from "../../../domain/portfolio/entities/SelectedWorkPage";
import { motion } from "../../../shared/design/tokens";
import { ClipNumber } from "../../components/ClipNumber";
import { Container } from "../../components/Container";
import { Reveal } from "../../components/Reveal";
import { Section } from "../../components/Section";
import { SectionHeader } from "../../components/SectionHeader";
import { useInView } from "../../hooks/useInView";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import type { CaseStudyDetailView } from "../../lib/viewModels";

interface WorkProgressionProps {
  readonly progression: ProgressionBlock;
  readonly pieces: ReadonlyArray<CaseStudyDetailView>;
}

/** Each card takes an equal share of the 900ms draw, so the rule arrives at one at a time. */
function segmentDelayMs(index: number, cardCount: number): number {
  return (index * motion.duration.draw) / cardCount;
}

/**
 * One mark per stage, drawn rather than borrowed: no icon library, no emoji, and nothing
 * decorative. Each encodes its own step and nothing else.
 *
 * 0 — viewfinder brackets closing on a single subject: the studio framing itself.
 * 1 — three different inputs resolving into one finish, which is what "range" means here.
 * 2 — one shape repeated on a step, which is a system rather than a second piece.
 *
 * `currentColor`, so the card sets the colour once and the mark cannot drift off the
 * accent-on-dark value the rest of the block is measured at.
 */
function StageMark({ index }: { readonly index: number }): ReactElement | null {
  const shared = {
    width: 26,
    height: 26,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
  };

  if (index === 0) {
    return (
      <svg {...shared}>
        <path d="M3 8.5V5a2 2 0 0 1 2-2h3.5" />
        <path d="M15.5 3H19a2 2 0 0 1 2 2v3.5" />
        <path d="M21 15.5V19a2 2 0 0 1-2 2h-3.5" />
        <path d="M8.5 21H5a2 2 0 0 1-2-2v-3.5" />
        <circle cx="12" cy="12" r="2.75" />
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg {...shared}>
        <path d="M2.5 5.5h5" />
        <path d="M2.5 12h5" />
        <path d="M2.5 18.5h5" />
        <path d="M7.5 5.5 13 12" />
        <path d="M7.5 12H13" />
        <path d="M7.5 18.5 13 12" />
        <circle cx="16.5" cy="12" r="3" />
      </svg>
    );
  }
  if (index === 2) {
    return (
      <svg {...shared}>
        <rect x="2.5" y="2.5" width="9" height="9" rx="1.25" />
        <rect x="7.5" y="7.5" width="9" height="9" rx="1.25" />
        <rect x="12.5" y="12.5" width="9" height="9" rx="1.25" />
      </svg>
    );
  }
  return null;
}

/**
 * The arc the eight pieces describe, made visible.
 *
 * The stages reference pieces by slug and the titles are resolved here, so the approved
 * names appear once in the content file and once on the page — never restated inside a
 * stage's own prose, where they could drift into a paraphrase.
 *
 * Three cards, not three rows of text. Rows carried the argument in prose alone, which
 * on the weakest section of a page with no work to show is the least it could do. Each
 * card now carries four things that are not sentences — a numeral, a drawn mark, the
 * stage title and the pieces themselves as links — so the sentence under the title is
 * free to be one sentence.
 *
 * Dark, and it DROPS the entry fade. The numerals and the marks are accent-on-dark,
 * which is derived against full ink at 5.015:1 and falls to 3.79:1 against the fade's
 * start value (ink-90 over canvas). The locked rule is that a dark section carrying any
 * accent stops fading rather than working the colour around, so `fade={false}`.
 *
 * The rule beneath the row draws left to right as the section enters, a segment per
 * card, and each numeral clips in as the line reaches it — the same mechanism as the
 * process rail on /how-we-work, which is the point: this is the same kind of claim,
 * made about work instead of about method.
 */
export function WorkProgression({ progression, pieces }: WorkProgressionProps) {
  const [ref, isInView] = useInView<HTMLOListElement>({ threshold: 0.15, once: true });
  const prefersReducedMotion = useReducedMotion();
  const hasArrived = prefersReducedMotion || isInView;
  const cardCount = progression.stages.length;

  const titleOf = (slug: string): string =>
    pieces.find((piece) => piece.slug === slug)?.title ?? slug;

  return (
    <Section dark fade={false} ariaLabel={progression.heading}>
      <Container>
        <SectionHeader
          eyebrow={progression.eyebrow}
          heading={progression.heading}
          body={progression.body}
          dark
        />
        <ol ref={ref} className="progression-row mt-14" data-drawn={hasArrived}>
          {progression.stages.map((stage, index) => (
            <li key={stage.title} className="progression-card-item">
              <Reveal index={index} staggerStepMs={motion.stagger.rowStepMs}>
                <div className="progression-card">
                  <div className="progression-card-head">
                    {/* Decorative: the ordinal is already carried by the <ol> this sits
                        in, and the digits are generated content rather than a text node
                        so that stays true in CSS as well as in the accessibility tree. */}
                    <span aria-hidden="true">
                      <ClipNumber
                        value={String(index + 1).padStart(2, "0")}
                        className="progression-numeral text-display-m font-medium"
                        isVisible={hasArrived}
                        delayMs={prefersReducedMotion ? 0 : segmentDelayMs(index, cardCount)}
                        isDecorative
                      />
                    </span>
                    <span className="progression-mark">
                      <StageMark index={index} />
                    </span>
                  </div>
                  <h3 className="text-display-s mt-6 font-medium text-canvas">{stage.title}</h3>
                  <p className="text-body mt-3 text-canvas-80">{stage.body}</p>
                  <ul className="progression-pieces mt-6">
                    {stage.pieceSlugs.map((slug) => (
                      <li key={slug}>
                        <a href={`#${slug}`} className="progression-piece-chip text-small">
                          {titleOf(slug)}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
              <span
                className="progression-rule"
                aria-hidden="true"
                style={{
                  transitionDelay: prefersReducedMotion
                    ? "0ms"
                    : `${segmentDelayMs(index, cardCount)}ms`,
                }}
              />
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
