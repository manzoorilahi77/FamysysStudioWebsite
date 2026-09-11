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
 * Composition 4 — paired: two crops of the same image, stacked, beside the pitch. The
 * second crop carries `decorative` so it is not announced twice with identical alt
 * text — see `Media`'s own `decorative` note.
 */
export function DiptychBlock({ capability, deliverablesLabel, dark }: CapabilityCompositionProps) {
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
    transitionDelay: prefersReducedMotion ? "0ms" : `${order * motion.stagger.diagonalStepMs}ms`,
    transitionTimingFunction: "var(--ease-base)",
  });

  return (
    <Container>
      <div ref={ref} className="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-6">
        <div className="lg:col-span-4 lg:col-start-1">
          <div
            className="capability-media capability-diptych-frame"
            data-settled={hasArrived}
            style={enterStyle(0)}
          >
            <Media
              media={capability.media}
              width={700}
              height={700}
              sizes="(min-width: 1024px) 20vw, 45vw"
              className="h-full w-full object-cover object-top"
            />
          </div>
          <div
            className="capability-media capability-diptych-frame mt-4"
            data-settled={hasArrived}
            style={enterStyle(1)}
          >
            <Media
              media={capability.media}
              width={700}
              height={700}
              sizes="(min-width: 1024px) 20vw, 45vw"
              className="h-full w-full object-cover object-bottom"
              decorative
            />
          </div>
        </div>

        <div className="lg:col-span-7 lg:col-start-6" style={enterStyle(2)}>
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
