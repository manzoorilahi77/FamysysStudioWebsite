"use client";

import Link from "next/link";
import { useCallback, useRef } from "react";
import { Media } from "../../../components/Media";
import { motion } from "../../../../shared/design/tokens";
import { Container } from "../../../components/Container";
import { RevealHeading } from "../../../components/RevealHeading";
import { CapabilityDisclosure } from "../../../components/CapabilityDisclosure";
import { useFinePointer } from "../../../hooks/useFinePointer";
import { useInView } from "../../../hooks/useInView";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import { useScrollFrame } from "../../../hooks/useScrollFrame";
import type { CapabilityCompositionProps } from "./types";

/** How far the image drifts, in px, across the block's travel through the viewport. */
const PARALLAX_RANGE_PX = 24;

/**
 * Composition 3 — full-bleed: the visual fills the container edge to edge, with the
 * pitch on a scrim at the bottom-left instead of beside it. The text always takes the
 * on-dark palette here, independent of the section's own light/dark alternation —
 * it sits on a photograph, not on the section's ink or canvas ground.
 */
export function FullBleedBlock({ capability, deliverablesLabel }: CapabilityCompositionProps) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.15, once: true });
  const prefersReducedMotion = useReducedMotion();
  const hasFinePointer = useFinePointer();
  const hasArrived = prefersReducedMotion || isInView;
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const parallax = useCallback(() => {
    const frame = frameRef.current;
    const image = imageRef.current;
    if (!frame || !image) {
      return;
    }
    const rect = frame.getBoundingClientRect();
    const viewport = window.innerHeight;
    const progress = (rect.top + rect.height / 2 - viewport / 2) / viewport;
    const clamped = Math.max(-1, Math.min(1, progress));
    image.style.transform = `translate3d(0, ${clamped * PARALLAX_RANGE_PX}px, 0)`;
  }, []);

  useScrollFrame(parallax, hasFinePointer && !prefersReducedMotion);

  const copyStyle = {
    opacity: hasArrived ? 1 : 0,
    transitionProperty: "opacity",
    transitionDuration: prefersReducedMotion
      ? `${motion.duration.reduced}ms`
      : `${motion.duration.base}ms`,
    transitionTimingFunction: "var(--ease-base)",
  };

  return (
    <Container>
      <div ref={ref} className="capability-fullbleed">
        <div ref={frameRef} className="capability-fullbleed-frame">
          <div ref={imageRef} className="capability-fullbleed-image">
            <Media
              media={capability.media}
              width={1600}
              height={900}
              sizes="100vw"
              className="h-full w-full object-cover"
            />
          </div>
          <span className="capability-fullbleed-scrim" aria-hidden="true" />
          <div className="capability-fullbleed-copy" style={copyStyle}>
            <RevealHeading className="text-display-m font-medium text-canvas">
              {capability.title}
            </RevealHeading>
            <p className="text-lead mt-3 text-accent-on-dark">{capability.description}</p>
            <CapabilityDisclosure
              label={deliverablesLabel}
              expandedCopy={capability.expandedCopy}
              deliverables={capability.deliverables}
              dark
            />
            <Link
              href={capability.cta.href}
              className="inline-link text-small mt-8 inline-block font-medium text-accent-on-dark"
            >
              {capability.cta.label} &rarr;
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
}
