"use client";

import { motion } from "../../shared/design/tokens";
import { AboutFrame } from "../components/AboutFrame";
import { Container } from "../components/Container";
import { DrawnRule } from "../components/DrawnRule";
import { RevealHeading } from "../components/RevealHeading";
import { Section } from "../components/Section";
import { SectionHeader } from "../components/SectionHeader";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";
import type { DirectionBlockView } from "../lib/viewModels";

interface WhereWereGoingProps {
  readonly direction: DirectionBlockView;
}

/**
 * Ambition and current position, in that order, in one block — never separated and the
 * second never dropped. The client's ambition sentence on its own reads as a description
 * of the studio today; followed by the client's own "starting deliberately" line it reads
 * as what it is, a statement of intent from a business that says where it stands.
 *
 * OFFSET COLUMNS, where it used to be two equal columns of grey text. The ambition is set
 * at display size on the left with the image under it; the present sits in a panel on the
 * right, dropped well below the ambition's first line, so the eye reads the intent, then
 * drops to the correction. The two labels name the halves so the pairing is visible
 * rather than inferred, and the panel takes the locked card treatment so it reads as a
 * thing set beside the ambition, not a caption to it.
 */
export function WhereWereGoing({ direction }: WhereWereGoingProps) {
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
    <Section ariaLabel={direction.heading}>
      <Container>
        <SectionHeader eyebrow={direction.eyebrow} heading={direction.heading} className="" />
        <DrawnRule className="mt-10" />
        <div ref={ref} className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-7">
            <div style={enterStyle(0)}>
              <p className="label text-accent">{direction.ambitionLabel}</p>
            </div>
            <RevealHeading as="p" className="text-display-m mt-4 max-w-[26ch] font-medium text-ink">
              {direction.ambition}
            </RevealHeading>
            <div className="mt-12 lg:max-w-[72%]" style={enterStyle(2)}>
              <AboutFrame
                media={direction.media}
                hasArrived={hasArrived}
                sizes="(min-width: 1024px) 36vw, 100vw"
              />
            </div>
          </div>

          <div className="lg:col-span-5 lg:col-start-8 lg:mt-36" style={enterStyle(1)}>
            <div className="card-surface p-8 lg:p-10">
              <p className="label text-ink-70">{direction.presentLabel}</p>
              <DrawnRule className="mt-4" isVisible={hasArrived} delayMs={motion.duration.base} />
              <p className="text-lead mt-6 text-ink">{direction.present}</p>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
