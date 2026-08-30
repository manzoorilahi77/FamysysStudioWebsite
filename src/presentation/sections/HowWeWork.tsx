"use client";

import { useState } from "react";
import type { ProcessBlock } from "../../domain/marketing/entities/ProcessBlock";
import { motion } from "../../shared/design/tokens";
import { ClipNumber } from "../components/ClipNumber";
import { Container } from "../components/Container";
import { Section } from "../components/Section";
import { SectionHeader } from "../components/SectionHeader";
import { useActiveStep } from "../hooks/useActiveStep";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface HowWeWorkProps {
  readonly process: ProcessBlock;
}

/** Each segment gets an equal share of the 900ms draw, so the line arrives at one step at a time. */
function segmentDelayMs(index: number, stepCount: number): number {
  return (index * motion.duration.draw) / stepCount;
}

/**
 * A process, laid out as one. Five steps run left to right along a single hairline with the
 * numerals sitting on it and the copy beneath; below `lg` the same rule runs down the left
 * instead. Cards would have said "five things"; the rule says "in this order".
 *
 * Three things move, and they say different things:
 *
 * - The rule *draws itself* as the section enters, a segment at a time, and each numeral
 *   clips in as the line reaches it. That is the section introducing its own shape.
 * - One step is *active* at a time thereafter, chosen by how far the section has scrolled
 *   rather than by what is on screen — on a wide viewport all five are on screen at once,
 *   so visibility cannot distinguish them. That is the reader's position in the sequence.
 * - Hover *overrides* the scroll-driven step, so pointing at a step reads it directly.
 *
 * The section is light. Its numerals go from `ink-20` to `accent`, and accent is 2.458:1 on
 * ink — it only reads as an active-state signal on canvas. §3 takes the dark beat instead.
 */
export function HowWeWork({ process }: HowWeWorkProps) {
  const stepCount = process.steps.length;
  const [scrollRef, scrolledStep] = useActiveStep<HTMLOListElement>(stepCount);
  const [drawRef, hasEntered] = useInView<HTMLDivElement>({ threshold: 0.2, once: true });
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const activeStep = hoveredStep ?? scrolledStep;

  return (
    <Section ariaLabel={process.heading}>
      <Container>
        <SectionHeader heading={process.heading} />
        <div ref={drawRef}>
          <ol ref={scrollRef} className="mt-14 grid list-none gap-0 lg:grid-cols-5 lg:gap-6">
            {process.steps.map((step, index) => {
              const isActive = prefersReducedMotion || index === activeStep;
              const isDrawn = prefersReducedMotion || hasEntered;

              return (
                <li
                  key={step.title}
                  className="process-step"
                  data-active={isActive}
                  data-drawn={isDrawn}
                  onMouseEnter={() => setHoveredStep(index)}
                  onMouseLeave={() => setHoveredStep(null)}
                >
                  <div className="process-rail">
                    {/* Decorative: the ordinal is already carried by the <ol>, so a screen
                        reader announcing "zero one" before "Understand" would be repeating
                        the list back to itself. Hiding it is also what lets the numeral sit
                        at ink-20 — it is a structural mark, not text anyone has to read. */}
                    <span aria-hidden="true">
                      <ClipNumber
                        value={String(index + 1).padStart(2, "0")}
                        className="process-numeral text-display-l font-medium"
                        isVisible={isDrawn}
                        delayMs={index * motion.stagger.numeralStepMs}
                        isDecorative
                      />
                    </span>
                    <span className="process-dot" aria-hidden="true" />
                    <span
                      className="process-rule"
                      aria-hidden="true"
                      style={{
                        transitionDelay: prefersReducedMotion
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
      </Container>
    </Section>
  );
}
