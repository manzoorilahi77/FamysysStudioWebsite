"use client";

import { motion } from "../../../shared/design/tokens";
import { AboutFrame } from "../../components/AboutFrame";
import { Container } from "../../components/Container";
import { DrawnRule } from "../../components/DrawnRule";
import { RevealHeading } from "../../components/RevealHeading";
import { Section } from "../../components/Section";
import { SectionHeader } from "../../components/SectionHeader";
import { useInView } from "../../hooks/useInView";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import type { ApproachBlockView, ApproachClaimView } from "../../lib/viewModels";

interface AboutApproachProps {
  readonly approach: ApproachBlockView;
}

interface ClaimBlockProps {
  readonly claim: ApproachClaimView;
  readonly index: number;
  readonly practiceLabel: string;
}

/**
 * One claim, as the asymmetric split the capability and step blocks use — five columns
 * of image against six of copy with a column of gap, the image dropped a step — and the
 * image side alternating with the index. Four things arrive in order, 100ms apart: the
 * image, the claim's title, the claim, and what it means in practice. The rule above
 * the block draws first, so the section reads as a ledger being ruled and filled.
 */
function ClaimBlock({ claim, index, practiceLabel }: ClaimBlockProps) {
  const isImageFirst = index % 2 === 0;
  const [ref, isInView] = useInView<HTMLLIElement>({ threshold: 0.15, once: true });
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
    <li ref={ref}>
      <DrawnRule dark isVisible={hasArrived} />
      {/* `items-center`, not `items-start`. The image is the taller half of every one of
          these rows — it is a 4:3 frame across five columns against three short paragraphs
          — so top-aligning the two left the copy finishing a third of the way down the row
          and the rest of the column empty. Centred, the leftover height is split above and
          below the words and reads as air rather than as a gap. The image keeps its drop,
          which is what makes the split asymmetric in the first place. */}
      <div className="grid gap-8 pt-10 lg:grid-cols-12 lg:items-center lg:gap-6 lg:pt-14">
        <div
          className={`lg:col-span-5 lg:mt-8 ${isImageFirst ? "lg:col-start-1" : "lg:order-2 lg:col-start-8"}`}
          style={enterStyle(0)}
        >
          <AboutFrame
            media={claim.media}
            hasArrived={hasArrived}
            sizes="(min-width: 1024px) 42vw, 100vw"
          />
        </div>

        <div
          className={`lg:col-span-6 ${isImageFirst ? "lg:col-start-7" : "lg:order-1 lg:col-start-1"}`}
        >
          <div style={enterStyle(1)}>
            <RevealHeading as="h3" className="text-display-s font-medium text-canvas">
              {claim.title}
            </RevealHeading>
          </div>
          <div style={enterStyle(2)}>
            <p className="text-body mt-5 text-canvas-80" style={{ maxWidth: "58ch" }}>
              {claim.claim}
            </p>
          </div>
          <div style={enterStyle(3)}>
            <p className="label mt-8 text-canvas">{practiceLabel}</p>
            <p className="text-body mt-3 text-canvas" style={{ maxWidth: "58ch" }}>
              {claim.practice}
            </p>
          </div>
        </div>
      </div>
    </li>
  );
}

/**
 * What the studio does and why, as three claims rather than one block. Each pairs a
 * position with the observable consequence a client could hold the studio to — the
 * second half is what stops the first from being a slogan.
 *
 * Dark, and it KEEPS the entry fade: every colour here is canvas or canvas-80, which hold
 * against the fade's start value as well as against the settled ground — measured by
 * `npm run check-colours` under "dark ground, entering" and "alternate ground, entering".
 * Nothing derived against ink is used, so nothing here is wrong for the first 900ms.
 */
export function AboutApproach({ approach }: AboutApproachProps) {
  return (
    <Section cmsSection="approach" dark ariaLabel={approach.heading}>
      <Container>
        <SectionHeader
          split
          dark
          eyebrow={approach.eyebrow}
          heading={approach.heading}
          body={approach.intro}
        />
        <ol className="mt-16 space-y-16 lg:mt-24 lg:space-y-24">
          {approach.claims.map((claim, index) => (
            <ClaimBlock
              key={claim.title}
              claim={claim}
              index={index}
              practiceLabel={approach.practiceLabel}
            />
          ))}
        </ol>
      </Container>
    </Section>
  );
}
