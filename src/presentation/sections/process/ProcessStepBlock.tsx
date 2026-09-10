"use client";

import { Media } from "../../components/Media";
import { motion } from "../../../shared/design/tokens";
import { ClipNumber } from "../../components/ClipNumber";
import { Container } from "../../components/Container";
import { DeliverableList } from "../../components/DeliverableList";
import { RevealHeading } from "../../components/RevealHeading";
import { Section } from "../../components/Section";
import { useInView } from "../../hooks/useInView";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import type { ProcessStepDetailView } from "../../lib/viewModels";

interface ProcessStepBlockProps {
  readonly step: ProcessStepDetailView;
  readonly index: number;
  readonly whatWeNeedLabel: string;
  readonly whatYouGetLabel: string;
}

/**
 * One step, as the same asymmetric split the Creative Services capability blocks use:
 * five columns of image against six of copy with a column of gap, the image dropped a
 * step. The side alternates down the page, and so does the surface — the left/right flip
 * alone would still leave five panels of one tone.
 *
 * The numeral is the structural anchor: it is what makes a block read as the third of
 * five rather than as another section. It is decorative in the WCAG 1.4.3 sense — the
 * ordinal is carried by the overview bar and by the step's position — so it is rendered
 * as generated content at `ink-12` / `canvas-16`, the same arrangement as §2 and §4 on
 * the homepage.
 *
 * Three things arrive in order, 100ms apart: the numeral, then the heading, then
 * everything under it. The two lists then run their own rows at 50ms from their own
 * observers.
 */
export function ProcessStepBlock({
  step,
  index,
  whatWeNeedLabel,
  whatYouGetLabel,
}: ProcessStepBlockProps) {
  const isDark = index % 2 === 1;
  const isImageFirst = index % 2 === 0;
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.15, once: true });
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
    // fade={false}: the approved description is accent-on-dark, which is derived against
    // full ink and measures 3.79:1 against the fade's lighter start value. See Section.
    <Section
      cmsSection="process-steps"
      id={step.slug}
      dark={isDark}
      fade={false}
      ariaLabel={step.title}
      className="process-anchor"
    >
      <Container>
        <div ref={ref} className="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-6">
          <div
            className={`lg:col-span-5 lg:mt-24 ${isImageFirst ? "lg:col-start-1" : "lg:order-2 lg:col-start-8"}`}
            style={enterStyle(2)}
          >
            {/* The scale settles on entry and stops there — it is the image arriving, not
                an idle loop. Under reduced motion it renders at its final size. */}
            <div className="step-media" data-settled={hasArrived}>
              <Media
                media={step.media}
                width={1600}
                height={1200}
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div
            className={`lg:col-span-6 ${isImageFirst ? "lg:col-start-7" : "lg:order-1 lg:col-start-1"}`}
          >
            <div style={enterStyle(0)}>
              {/* Decorative: the ordinal is already in the overview above and in this
                  block's position. Generated content rather than a text node — see
                  `.decorative-numeral` in globals.css. */}
              <span aria-hidden="true">
                <ClipNumber
                  value={String(index + 1).padStart(2, "0")}
                  className="step-numeral text-display-xl font-medium"
                  isVisible={hasArrived}
                  isDecorative
                />
              </span>
            </div>

            <div style={enterStyle(1)}>
              <RevealHeading
                className={`text-display-m mt-2 font-medium ${isDark ? "text-canvas" : "text-ink"}`}
              >
                {step.title}
              </RevealHeading>
              {/* The approved one-line description, directly under the name it belongs to. */}
              <p className={`text-lead mt-3 ${isDark ? "text-accent-on-dark" : "text-accent"}`}>
                {step.description}
              </p>
            </div>

            <div style={enterStyle(2)}>
              <p
                className={`text-body mt-6 ${isDark ? "text-canvas-80" : "text-ink-70"}`}
                style={{ maxWidth: "62ch" }}
              >
                {step.expandedCopy}
              </p>

              <div className="mt-10 grid gap-8 sm:grid-cols-2 sm:gap-6">
                <DeliverableList
                  label={whatWeNeedLabel}
                  items={step.whatWeNeed}
                  dark={isDark}
                  className=""
                />
                <DeliverableList
                  label={whatYouGetLabel}
                  items={step.whatYouGet}
                  dark={isDark}
                  className=""
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
