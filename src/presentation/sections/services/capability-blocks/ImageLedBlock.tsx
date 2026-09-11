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

/** Composition 1 — image-led: a large visual on the right, the pitch and disclosure on the left. */
export function ImageLedBlock({ capability, deliverablesLabel, dark }: CapabilityCompositionProps) {
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
    <Container>
      <div ref={ref} className="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-6">
        <div className="lg:col-span-6 lg:col-start-1" style={enterStyle(0)}>
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

        <div className="lg:col-span-5 lg:col-start-8 lg:mt-16" style={enterStyle(1)}>
          <div className="capability-media" data-settled={hasArrived}>
            <Media
              media={capability.media}
              width={1200}
              height={900}
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </Container>
  );
}
