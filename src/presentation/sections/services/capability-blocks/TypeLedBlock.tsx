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

interface TypeLedBlockProps extends CapabilityCompositionProps {
  readonly mediaSide: "left" | "right";
}

/**
 * Compositions 2 and 5 — type-led: the pitch carries the block and a small thumbnail
 * chip sits to one side, rather than a full column of image. `mediaSide` is the only
 * thing that differs between the two capabilities using this shape, and the text
 * arrives first in both — a type-led block is led by its words, not its picture.
 */
export function TypeLedBlock({ capability, deliverablesLabel, dark, mediaSide }: TypeLedBlockProps) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.15, once: true });
  const prefersReducedMotion = useReducedMotion();
  const hasArrived = prefersReducedMotion || isInView;
  const isMediaLeft = mediaSide === "left";

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
    <Container>
      <div ref={ref} className="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-6">
        <div
          className={`lg:col-span-7 ${isMediaLeft ? "lg:order-2 lg:col-start-6" : "lg:col-start-1"}`}
          style={enterStyle(0)}
        >
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

        <div
          className={`capability-chip lg:col-span-3 ${
            isMediaLeft ? "lg:order-1 lg:col-start-1" : "lg:col-start-10"
          }`}
          style={enterStyle(1)}
        >
          <div className="capability-media" data-settled={hasArrived}>
            <Media
              media={capability.media}
              width={480}
              height={480}
              sizes="(min-width: 1024px) 22vw, 60vw"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </Container>
  );
}
