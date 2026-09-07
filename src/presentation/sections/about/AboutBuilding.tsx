"use client";

import type { BuildingBlock } from "../../../domain/about/entities/AboutPage";
import { motion } from "../../../shared/design/tokens";
import { ClipNumber } from "../../components/ClipNumber";
import { Container } from "../../components/Container";
import { DrawnRule } from "../../components/DrawnRule";
import { Section } from "../../components/Section";
import { SectionHeader } from "../../components/SectionHeader";
import { useInView } from "../../hooks/useInView";
import { useReducedMotion } from "../../hooks/useReducedMotion";

interface AboutBuildingProps {
  readonly building: BuildingBlock;
}

/**
 * What "starting deliberately" means in practice: three stages in the order they are
 * being built, each with the studio's own word for where it stands, and under them the
 * sentence that says what a client should not expect yet.
 *
 * A ledger, not a row of cards: the header holds the left third and stays put while the
 * stages run down the right, each ruled off by a hairline that draws as it arrives. The
 * numerals are the one colour moment — warm, as the process numerals on /how-we-work
 * are — and decorative in the WCAG sense: the ordinal is carried by list position, so the
 * digits are generated content rather than a text node.
 *
 * `fade={false}`, by the project's rule: the numerals are accent-warm, which is measured
 * against full ink and is not guaranteed for the first 900ms of a fading section. Every
 * other colour here is canvas or canvas-80.
 */
export function AboutBuilding({ building }: AboutBuildingProps) {
  const [ref, isInView] = useInView<HTMLOListElement>({ threshold: 0.15, once: true });
  const prefersReducedMotion = useReducedMotion();
  const hasArrived = prefersReducedMotion || isInView;

  const enterStyle = (order: number) => ({
    opacity: hasArrived ? 1 : 0,
    transform: hasArrived || prefersReducedMotion ? "translateY(0)" : "translateY(24px)",
    transitionProperty: "opacity, transform",
    transitionDuration: prefersReducedMotion
      ? `${motion.duration.reduced}ms`
      : `${motion.duration.base}ms`,
    transitionDelay: prefersReducedMotion ? "0ms" : `${order * motion.stagger.blockStepMs}ms`,
    transitionTimingFunction: "var(--ease-base)",
  });

  return (
    <Section dark fade={false} ariaLabel={building.heading}>
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-4 lg:sticky lg:top-32 lg:self-start">
            <SectionHeader
              dark
              eyebrow={building.eyebrow}
              heading={building.heading}
              body={building.body}
              className=""
            />
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <ol ref={ref}>
              {building.stages.map((stage, index) => (
                <li key={stage.title} className="about-stage" style={enterStyle(index)}>
                  <DrawnRule
                    dark
                    isVisible={hasArrived}
                    delayMs={index * motion.stagger.blockStepMs}
                  />
                  <div className="grid gap-4 py-8 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-8 lg:py-10">
                    <span aria-hidden="true" className="about-stage-numeral-slot">
                      <ClipNumber
                        value={String(index + 1).padStart(2, "0")}
                        className="about-stage-numeral text-display-m font-medium"
                        isVisible={hasArrived}
                        delayMs={index * motion.stagger.blockStepMs + 120}
                        isDecorative
                      />
                    </span>
                    <div>
                      <p className="about-status label text-canvas">{stage.status}</p>
                      <h3 className="text-display-s mt-4 font-medium text-canvas">{stage.title}</h3>
                      <p className="text-body mt-4 text-canvas-80" style={{ maxWidth: "56ch" }}>
                        {stage.body}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            {/* The caveat is a separate field so it cannot be dropped from the list, and a
                separate panel so it cannot be read as a fourth stage. Same dark card the
                closing form sits on; the hover lift marks it as a thing in its own right. */}
            <div style={enterStyle(building.stages.length)}>
              <DrawnRule dark isVisible={hasArrived} delayMs={building.stages.length * 100} />
              <div className="card-surface-dark mt-10 p-6 lg:p-8">
                <p className="text-body text-canvas" style={{ maxWidth: "60ch" }}>
                  {building.caveat}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
