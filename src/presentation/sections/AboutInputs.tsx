"use client";

import type { InputsBlock } from "../../domain/about/entities/AboutPage";
import { motion } from "../../shared/design/tokens";
import { Container } from "../components/Container";
import { DrawnRule } from "../components/DrawnRule";
import { Section } from "../components/Section";
import { SectionHeader } from "../components/SectionHeader";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface AboutInputsProps {
  readonly inputs: InputsBlock;
}

/**
 * The direction each panel arrives from, by position in the row: the outer two slide in
 * from their own side and the middle one rises. Three panels sliding up together would
 * be a row fading in; three arriving from three directions and meeting is the section's
 * one device, and it is why the whole row fires from ONE observer rather than each panel
 * from its own — the device only reads if they move together.
 */
const DIRECTIONS = ["left", "up", "right"] as const;

/**
 * The page's substance: the three inputs, and for each what it contributes and where it
 * stops. The second half is the honest one, and it is set at full ink where the first is
 * muted — on this page the limit is the claim.
 *
 * The panels take the locked card treatment — accent border and a 6px lift on hover, no
 * shadow — on an inner element, so the hover's transform and the entry's transform are
 * never on the same box fighting over one property.
 */
export function AboutInputs({ inputs }: AboutInputsProps) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.2, once: true });
  const prefersReducedMotion = useReducedMotion();
  const hasArrived = prefersReducedMotion || isInView;

  return (
    <Section ariaLabel={inputs.heading}>
      <Container>
        <SectionHeader split eyebrow={inputs.eyebrow} heading={inputs.heading} body={inputs.body} />
        <DrawnRule className="mt-12 lg:mt-16" />
        <div ref={ref} className="mt-10 grid gap-4 md:grid-cols-3 lg:mt-12 lg:gap-6">
          {inputs.inputs.map((input, index) => (
            <div
              key={input.name}
              className="about-input-entry"
              data-direction={DIRECTIONS[index % DIRECTIONS.length]}
              data-visible={hasArrived}
              style={{
                transitionDelay: prefersReducedMotion
                  ? "0ms"
                  : `${index * motion.stagger.splitStepMs}ms`,
              }}
            >
              <article className="card-surface flex h-full flex-col p-6 lg:p-8">
                <h3 className="text-display-s font-medium text-ink">{input.name}</h3>

                <p className="label mt-8 text-accent">{input.contributesLabel}</p>
                <p className="text-body mt-3 text-ink-70">{input.contributes}</p>

                <DrawnRule
                  className="mt-8"
                  isVisible={hasArrived}
                  delayMs={motion.duration.base + index * motion.stagger.splitStepMs}
                />

                <p className="label mt-8 text-ink-70">{input.stopsLabel}</p>
                <p className="text-body mt-3 text-ink">{input.stops}</p>
              </article>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
