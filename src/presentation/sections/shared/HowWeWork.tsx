"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useState } from "react";
import type { ProcessBlock } from "../../../domain/marketing/entities/ProcessBlock";
import { motion } from "../../../shared/design/tokens";
import { ClipNumber } from "../../components/ClipNumber";
import { Container } from "../../components/Container";
import { Section } from "../../components/Section";
import { SectionHeader } from "../../components/SectionHeader";
import { useInView } from "../../hooks/useInView";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useScrollSequence } from "../../hooks/useScrollSequence";
import type { CtaView } from "../../lib/viewModels";

interface HowWeWorkProps {
  readonly process: ProcessBlock;
  /** Both optional and both unused on the homepage, where this section IS the process. */
  readonly eyebrow?: string | undefined;
  readonly cta?: CtaView | undefined;
}

/**
 * How much scroll each step is given while the section is pinned, as a share of the
 * viewport. Five steps at 46vh is a little over two screens of travel — long enough that
 * each arrival is a separate beat, short enough that nobody wonders whether the page has
 * stopped working. The last band is spent with all five up, which is the pause that lets
 * the sequence be read as a whole before the section releases.
 */
const PIN_PER_STEP_VH = 46;

/** Each segment gets an equal share of the 900ms draw, so the line arrives at one step at a time. */
function segmentDelayMs(index: number, stepCount: number): number {
  return (index * motion.duration.draw) / stepCount;
}

/**
 * A process, laid out as one, and told one step at a time.
 *
 * From `lg` up the section pins: the stage holds still at the top of the viewport while a
 * track several screens tall scrolls past it, and the five steps arrive in order as it
 * does. Scrolling is never intercepted — see `useScrollSequence` for why that distinction
 * matters and what it costs to get wrong. Below `lg`, and under `prefers-reduced-motion`,
 * there is no pin at all: the five steps are simply there, and the rule draws itself on
 * entry the way it always did.
 *
 * Five steps run left to right along a single hairline with the numerals sitting on it and
 * the copy beneath; below `lg` the same rule runs down the left instead. Cards would have
 * said "five things"; the rule says "in this order".
 *
 * Four things move, and they say different things:
 *
 * - A step *arrives* — numeral clipping up from its own baseline, copy rising behind it.
 *   That is the sequence advancing.
 * - The rule *draws itself* from each step to the next, so the line is always exactly as
 *   long as the story told so far. That is the reader's position, made visible without a
 *   progress bar bolted on beside it.
 * - One step is *active*: the newest one. Its numeral goes accent and an accent tick wipes
 *   in over its title.
 * - Hover *overrides* the active step, but only among the ones that have arrived — pointing
 *   at step two cannot summon step five.
 *
 * The section is light. Its numerals go from `ink-20` to `accent`, and accent is 2.458:1 on
 * ink — it only reads as an active-state signal on canvas. §3 takes the dark beat instead.
 */
export function HowWeWork({ process, eyebrow, cta }: HowWeWorkProps) {
  const stepCount = process.steps.length;
  const { ref: trackRef, revealedCount, isPinned } = useScrollSequence<HTMLDivElement>(stepCount);
  const [drawRef, hasEntered] = useInView<HTMLDivElement>({ threshold: 0.2, once: true });
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Hover only reaches steps that have arrived, so the highlight can never run ahead of
  // the sequence. Without the pin the newest step is the last one, which is why the
  // unpinned section rests with step five lit rather than step one.
  const newestStep = revealedCount - 1;
  const activeStep = hoveredStep !== null && hoveredStep < revealedCount ? hoveredStep : newestStep;

  return (
    <Section cmsSection="process-pointer" ariaLabel={process.heading}>
      {/* The track is what the sticky stage travels inside, and its height is the whole
          budget for the pin. It is set as a variable rather than as a height so the media
          query owns whether it applies: below lg this element is an ordinary div. */}
      <div
        ref={trackRef}
        className="process-track"
        data-pinned={isPinned}
        style={
          { "--process-track-height": `${100 + stepCount * PIN_PER_STEP_VH}vh` } as CSSProperties
        }
      >
        <div className="process-stage">
          <Container className="relative">
            {/* The step, once more, as a watermark. It sits in the empty half beside the
                heading — the pinned stage is a full viewport tall and the heading is one
                line of it, so without this the right of the frame is nothing at all for
                two screens of scroll. Same device §2 uses for its capability cells, same
                colour, and it never overlaps type: ink-70 body over this tint measures
                4.32:1, under the floor, so the numeral is placed where no copy reaches
                rather than tucked behind it at a lower opacity.

                All five are rendered and cross-faded rather than one element re-keyed on
                the active step: remounting would restart the transition from scratch every
                time and drop the outgoing digit instantly instead of trading places. */}
            <span className="process-watermark" aria-hidden="true">
              {process.steps.map((step, index) => (
                <span
                  key={step.title}
                  className="process-watermark-digit decorative-numeral tabular text-metric font-medium"
                  data-numeral={String(index + 1).padStart(2, "0")}
                  data-current={index === activeStep}
                />
              ))}
            </span>
            <SectionHeader eyebrow={eyebrow} heading={process.heading} />
            <div ref={drawRef}>
              <ol className="mt-14 grid list-none gap-0 lg:grid-cols-5 lg:gap-6">
                {process.steps.map((step, index) => {
                  // Pinned, a step is revealed by the sequence. Unpinned, all five are
                  // revealed from the start and the rule draws on entry instead, which is
                  // the behaviour this section had before it learned to pin.
                  const isRevealed = isPinned ? index < revealedCount : true;
                  const isDrawn = prefersReducedMotion || (isPinned ? isRevealed : hasEntered);
                  // A step's rule reaches the NEXT step, so it belongs to that step's
                  // arrival, not to its own. The last one trails off the end of the row and
                  // has no successor, so it goes with the step it hangs off.
                  const isLinked =
                    prefersReducedMotion ||
                    (isPinned
                      ? index + 1 < revealedCount || (index === stepCount - 1 && isRevealed)
                      : hasEntered);

                  return (
                    <li
                      key={step.title}
                      className="process-step"
                      data-active={prefersReducedMotion || index === activeStep}
                      data-revealed={isRevealed}
                      data-drawn={isLinked}
                      onMouseEnter={() => setHoveredStep(index)}
                      onMouseLeave={() => setHoveredStep(null)}
                    >
                      <div className="process-rail">
                        {/* Decorative: the ordinal is already carried by the <ol>, so a
                            screen reader announcing "zero one" before "Understand" would be
                            repeating the list back to itself. Hiding it is also what lets
                            the numeral sit at ink-20 — it is a structural mark, not text
                            anyone has to read. */}
                        <span aria-hidden="true">
                          <ClipNumber
                            value={String(index + 1).padStart(2, "0")}
                            className="process-numeral text-display-l font-medium"
                            isVisible={isDrawn}
                            delayMs={isPinned ? 0 : index * motion.stagger.numeralStepMs}
                            isDecorative
                          />
                        </span>
                        <span className="process-dot" aria-hidden="true" />
                        <span
                          className="process-rule"
                          aria-hidden="true"
                          style={{
                            // Pinned, each rule is triggered by its own step arriving, so a
                            // stagger would only delay a line that is already on cue. The
                            // entry draw still needs one: there, all five fire at once.
                            transitionDelay:
                              prefersReducedMotion || isPinned
                                ? "0ms"
                                : `${segmentDelayMs(index, stepCount)}ms`,
                          }}
                        />
                      </div>
                      <div className="process-content">
                        <p className="text-display-s font-medium text-ink">{step.title}</p>
                        <p className="text-body mt-2 text-ink-90">{step.description}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
            {cta ? (
              <Link
                href={cta.href}
                className="inline-link text-small mt-12 font-medium text-accent"
              >
                {cta.label} &rarr;
              </Link>
            ) : null}
          </Container>
        </div>
      </div>
    </Section>
  );
}
