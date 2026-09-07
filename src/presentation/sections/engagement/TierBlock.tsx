"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "../../../shared/design/tokens";
import { Container } from "../../components/Container";
import { DeliverableList } from "../../components/DeliverableList";
import { Eyebrow } from "../../components/Eyebrow";
import { RevealHeading } from "../../components/RevealHeading";
import { Section } from "../../components/Section";
import { useInView } from "../../hooks/useInView";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import type { EngagementTierDetailView } from "../../lib/viewModels";

interface TierBlockProps {
  readonly tier: EngagementTierDetailView;
  readonly index: number;
  readonly idealForLabel: string;
  readonly typicalWorkLabel: string;
}

/**
 * One named tier, as the same asymmetric split the Creative Services capability blocks
 * and the How We Work step blocks use: five columns of image against six of copy with a
 * column of gap, the image dropped a step. The side alternates down the page, and so
 * does the surface.
 *
 * The tier's label — "Essential Content" and the rest — takes the eyebrow position above
 * the name, which is the one place on the page it reads as a classification rather than
 * a subtitle. The approved descriptor sits under the name in accent, as on the two pages
 * before this one.
 *
 * Image and copy arrive 120ms apart, image first: it is the half that establishes which
 * side of the split this block is.
 */
export function TierBlock({ tier, index, idealForLabel, typicalWorkLabel }: TierBlockProps) {
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
    transitionDelay: prefersReducedMotion ? "0ms" : `${order * motion.stagger.splitStepMs}ms`,
    transitionTimingFunction: "var(--ease-base)",
  });

  return (
    // fade={false}: the approved descriptor is accent-on-dark, which is derived against
    // full ink and measures 3.79:1 against the fade's lighter start value. See Section.
    <Section
      id={tier.slug}
      dark={isDark}
      fade={false}
      ariaLabel={tier.name}
      className="tier-anchor"
    >
      <Container>
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-6" ref={ref}>
          <div
            className={`lg:col-span-5 lg:mt-16 ${isImageFirst ? "lg:col-start-1" : "lg:order-2 lg:col-start-8"}`}
            style={enterStyle(0)}
          >
            {/* The scale settles on entry and stops. Under reduced motion it renders at
                its final size. */}
            <div className="tier-media" data-settled={hasArrived}>
              <Image
                src={tier.media.src}
                alt={tier.media.alt}
                width={1600}
                height={1200}
                sizes="(min-width: 1024px) 42vw, 100vw"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div
            className={`lg:col-span-6 ${isImageFirst ? "lg:col-start-7" : "lg:order-1 lg:col-start-1"}`}
            style={enterStyle(1)}
          >
            {/* `descriptor` is the brief's classification — "Essential Content" and the
                rest — and `summary` is its sentence. The classification takes the eyebrow
                slot, which is the one place it reads as a category rather than a subtitle. */}
            <Eyebrow dark={isDark}>{tier.descriptor}</Eyebrow>
            <RevealHeading
              className={`text-display-m mt-4 font-medium ${isDark ? "text-canvas" : "text-ink"}`}
            >
              {tier.name}
            </RevealHeading>
            {/* The approved one-line summary, directly under the name it belongs to. */}
            <p className={`text-lead mt-3 ${isDark ? "text-accent-on-dark" : "text-accent"}`}>
              {tier.summary}
            </p>
            <p
              className={`text-body mt-6 ${isDark ? "text-canvas-80" : "text-ink-70"}`}
              style={{ maxWidth: "62ch" }}
            >
              {tier.expandedCopy}
            </p>

            <div className="mt-10 grid gap-8 sm:grid-cols-2 sm:gap-6">
              <DeliverableList
                label={idealForLabel}
                items={tier.idealForItems}
                dark={isDark}
                className=""
              />
              <DeliverableList
                label={typicalWorkLabel}
                items={tier.typicalWorkItems}
                dark={isDark}
                className=""
              />
            </div>

            <Link
              href={tier.cta.href}
              className={`text-small mt-8 inline-block font-medium ${
                isDark ? "text-accent-on-dark" : "text-accent"
              }`}
            >
              {tier.cta.label} &rarr;
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  );
}
