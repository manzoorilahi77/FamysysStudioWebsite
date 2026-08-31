"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "../../shared/design/tokens";
import { Container } from "../components/Container";
import { DeliverableList } from "../components/DeliverableList";
import { RevealHeading } from "../components/RevealHeading";
import { Section } from "../components/Section";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";
import type { CustomPartnershipDetailView } from "../lib/viewModels";

interface CustomPartnershipBlockProps {
  readonly custom: CustomPartnershipDetailView;
}

/**
 * The destination, not the fourth option. Three things separate it from the tiers above:
 *
 * - It is full width rather than an asymmetric split, so it stops looking like another
 *   entry in a series and starts looking like the end of one.
 * - It carries the accent border at rest — the same treatment the homepage's custom card
 *   uses, which is where this block's visual identity comes from.
 * - The brief's own invitation line is set at display size rather than body size. It is
 *   the sentence the whole page is arranged to arrive at.
 *
 * It also enters slower than the three tiers above it (520ms against 320ms). The same
 * reveal, given longer to land — a different effect would have been a new effect; a
 * different duration is emphasis.
 *
 * fade={false}: the descriptor and the trailing link are accent-on-dark, which is derived
 * against full ink (5.015:1) and measures 3.79:1 against the fade's start value. The
 * accent BORDER would in fact have survived the fade — 3.79:1 still clears the 3:1 floor
 * for a non-text UI boundary — but the text on the same block does not, so the fade comes
 * off the whole section rather than the border being reasoned about separately.
 */
export function CustomPartnershipBlock({ custom }: CustomPartnershipBlockProps) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.15, once: true });
  const prefersReducedMotion = useReducedMotion();
  const hasArrived = prefersReducedMotion || isInView;

  const enterStyle = (order: number) => ({
    opacity: hasArrived ? 1 : 0,
    transform: hasArrived || prefersReducedMotion ? "translateY(0)" : "translateY(24px)",
    transitionProperty: "opacity, transform",
    transitionDuration: prefersReducedMotion
      ? `${motion.duration.reduced}ms`
      : `${motion.emphasis.entryMs}ms`,
    transitionDelay: prefersReducedMotion ? "0ms" : `${order * motion.stagger.splitStepMs}ms`,
    transitionTimingFunction: "var(--ease-base)",
  });

  return (
    <Section id={custom.slug} dark fade={false} ariaLabel={custom.name} className="tier-anchor">
      <Container>
        <div
          ref={ref}
          className="rounded-sm border p-8 lg:p-12"
          style={{ borderColor: "var(--color-accent-on-dark)" }}
        >
          <div style={enterStyle(0)}>
            <div className="custom-media" data-settled={hasArrived}>
              <Image
                src={custom.media.src}
                alt={custom.media.alt}
                width={2400}
                height={1350}
                sizes="(min-width: 1024px) 70vw, 100vw"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div style={enterStyle(1)}>
            <RevealHeading className="text-display-l mt-10 font-medium text-canvas">
              {custom.name}
            </RevealHeading>
            {/* The brief's descriptor is a sentence here, not a one- or two-word
                classification like the tiers', so it stays a line of copy rather than
                taking the eyebrow slot and being set in caps. */}
            <p className="text-lead mt-3 text-accent-on-dark">{custom.descriptor}</p>
            <p className="text-body mt-6 text-canvas-80" style={{ maxWidth: "62ch" }}>
              {custom.summary}
            </p>
            <p className="text-body mt-4 text-canvas-80" style={{ maxWidth: "62ch" }}>
              {custom.expandedCopy}
            </p>
          </div>

          <div
            style={enterStyle(2)}
            className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-6"
          >
            <div className="lg:col-span-6">
              <DeliverableList label={custom.coversLabel} items={custom.covers} dark className="" />
            </div>
            <div className="lg:col-span-6">
              {/* The line the page is arranged to arrive at, set above body size. */}
              <p className="text-display-s font-medium text-canvas" style={{ maxWidth: "28ch" }}>
                {custom.invitation}
              </p>
              <Link
                href={custom.cta.href}
                className="text-small mt-6 inline-block font-medium text-accent-on-dark"
              >
                {custom.cta.label} &rarr;
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
