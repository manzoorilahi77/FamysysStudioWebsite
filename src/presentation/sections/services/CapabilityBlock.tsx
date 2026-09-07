"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "../../../shared/design/tokens";
import { Container } from "../../components/Container";
import { DeliverableList } from "../../components/DeliverableList";
import { RevealHeading } from "../../components/RevealHeading";
import { Section } from "../../components/Section";
import { useInView } from "../../hooks/useInView";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import type { CapabilityDetailView } from "../../lib/viewModels";

interface CapabilityBlockProps {
  readonly capability: CapabilityDetailView;
  readonly index: number;
  readonly deliverablesLabel: string;
}

/**
 * One capability, as an asymmetric split: five columns of image against six of copy, with
 * a column of gap between them and the image dropped down a step. Not 50/50 — an even
 * split reads as a table row, and six of these in a column would read as six identical
 * table rows. The same proportions the Differentiator uses.
 *
 * The side the image sits on alternates with the index, and so does the surface: even
 * blocks are canvas, odd ones ink. Two alternations rather than one, because the
 * left/right flip alone still leaves six panels of identical tone.
 *
 * Image and copy arrive one after the other rather than together — the image first, since
 * it is the thing that establishes which side of the split this block is.
 */
export function CapabilityBlock({ capability, index, deliverablesLabel }: CapabilityBlockProps) {
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
    // fade={false}: the descriptor and the link are accent-on-dark, which is derived
    // against full ink and fails 4.5:1 against the fade's lighter start value.
    <Section
      id={capability.slug}
      dark={isDark}
      fade={false}
      ariaLabel={capability.title}
      className="scroll-anchor"
    >
      <Container>
        <div ref={ref} className="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-6">
          <div
            className={`lg:col-span-5 lg:mt-16 ${isImageFirst ? "lg:col-start-1" : "lg:order-2 lg:col-start-8"}`}
            style={enterStyle(0)}
          >
            {/* The scale settles on entry and stops there — it is the image arriving, not
                an idle loop. Under reduced motion it renders at its final size. */}
            <div className="capability-media" data-settled={hasArrived}>
              <Image
                src={capability.media.src}
                alt={capability.media.alt}
                width={1200}
                height={900}
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
            <RevealHeading
              className={`text-display-m font-medium ${isDark ? "text-canvas" : "text-ink"}`}
            >
              {capability.title}
            </RevealHeading>
            {/* The approved one-line descriptor, directly under the name it belongs to. */}
            <p className={`text-lead mt-3 ${isDark ? "text-accent-on-dark" : "text-accent"}`}>
              {capability.description}
            </p>
            <p
              className={`text-body mt-6 ${isDark ? "text-canvas-80" : "text-ink-70"}`}
              style={{ maxWidth: "62ch" }}
            >
              {capability.expandedCopy}
            </p>

            <DeliverableList label={deliverablesLabel} items={capability.deliverables} dark={isDark} />

            <Link
              href={capability.cta.href}
              className={`text-small mt-8 inline-block font-medium ${
                isDark ? "text-accent-on-dark" : "text-accent"
              }`}
            >
              {capability.cta.label} &rarr;
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  );
}
