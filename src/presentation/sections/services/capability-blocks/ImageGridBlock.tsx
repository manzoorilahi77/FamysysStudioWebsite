"use client";

import Link from "next/link";
import { Media } from "../../../components/Media";
import { motion } from "../../../../shared/design/tokens";
import { Container } from "../../../components/Container";
import { RevealHeading } from "../../../components/RevealHeading";
import { CapabilityDisclosure } from "../../../components/CapabilityDisclosure";
import { useInView } from "../../../hooks/useInView";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import type { CapabilityCompositionProps } from "./types";

/**
 * Composition 6 — grid: two crops of the capability's image and two decorative accent
 * tiles in a 2x2 block. See this task's header note on why two of the four cells are
 * not photographs.
 */
export function ImageGridBlock({ capability, deliverablesLabel, dark }: CapabilityCompositionProps) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.15, once: true });
  const prefersReducedMotion = useReducedMotion();
  const hasArrived = prefersReducedMotion || isInView;

  const enterStyle = (order: number) => ({
    opacity: hasArrived ? 1 : 0,
    transitionProperty: "opacity",
    transitionDuration: prefersReducedMotion
      ? `${motion.duration.reduced}ms`
      : `${motion.duration.base}ms`,
    transitionDelay: prefersReducedMotion ? "0ms" : `${order * motion.stagger.diagonalStepMs}ms`,
    transitionTimingFunction: "var(--ease-base)",
  });

  return (
    <Container>
      <div ref={ref} className="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-6">
        <div className="capability-grid lg:col-span-5 lg:col-start-1">
          <div
            className="capability-media capability-grid-cell"
            data-settled={hasArrived}
            style={enterStyle(0)}
          >
            <Media
              media={capability.media}
              width={500}
              height={500}
              sizes="(min-width: 1024px) 18vw, 45vw"
              className="h-full w-full object-cover object-left-top"
            />
          </div>
          <div
            className={`capability-grid-cell capability-grid-accent ${
              dark ? "capability-grid-accent--on-dark" : ""
            }`}
            style={enterStyle(1)}
            aria-hidden="true"
          />
          <div
            className={`capability-grid-cell capability-grid-accent ${
              dark ? "capability-grid-accent--on-dark" : ""
            }`}
            style={enterStyle(2)}
            aria-hidden="true"
          />
          <div
            className="capability-media capability-grid-cell"
            data-settled={hasArrived}
            style={enterStyle(3)}
          >
            <Media
              media={capability.media}
              width={500}
              height={500}
              sizes="(min-width: 1024px) 18vw, 45vw"
              className="h-full w-full object-cover object-right-bottom"
              decorative
            />
          </div>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <RevealHeading className={`text-display-m font-medium ${dark ? "text-canvas" : "text-ink"}`}>
            {capability.title}
          </RevealHeading>
          <p className={`text-lead mt-3 ${dark ? "text-accent-on-dark" : "text-accent"}`}>
            {capability.description}
          </p>
          <CapabilityDisclosure
            label={deliverablesLabel}
            expandedCopy={capability.expandedCopy}
            deliverables={capability.deliverables}
            dark={dark}
          />
          <Link
            href={capability.cta.href}
            className={`inline-link text-small mt-8 inline-block font-medium ${
              dark ? "text-accent-on-dark" : "text-accent"
            }`}
          >
            {capability.cta.label} &rarr;
          </Link>
        </div>
      </div>
    </Container>
  );
}
