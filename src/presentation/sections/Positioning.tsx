"use client";

import { useEffect, useRef, useState } from "react";
import type { PositioningBlockView } from "../lib/viewModels";
import { motion } from "../../shared/design/tokens";
import { AutoplayVideo } from "../components/AutoplayVideo";
import { Container } from "../components/Container";
import { Eyebrow } from "../components/Eyebrow";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface PositioningProps {
  readonly positioning: PositioningBlockView;
}

const PARALLAX_PX = motion.parallax.positioning;

export function Positioning({ positioning }: PositioningProps) {
  const mediaRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }
    let frame = 0;
    function update(): void {
      const node = mediaRef.current;
      if (node) {
        const rect = node.getBoundingClientRect();
        const viewportCenter = window.innerHeight / 2;
        const elementCenter = rect.top + rect.height / 2;
        const progress = Math.max(-1, Math.min(1, (viewportCenter - elementCenter) / window.innerHeight));
        setOffset(progress * PARALLAX_PX);
      }
      frame = requestAnimationFrame(update);
    }
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [prefersReducedMotion]);

  return (
    <Section ariaLabel="Positioning">
      <Container>
        <div className="positioning-grid">
          <div className="positioning-copy">
            <Reveal>
              <Eyebrow>{positioning.eyebrow}</Eyebrow>
              <h2 className="text-display-l mt-4 font-medium text-ink">{positioning.heading}</h2>
              <p className="text-lead mt-6 text-ink-70" style={{ maxWidth: "48ch" }}>
                {positioning.supportingParagraph}
              </p>
            </Reveal>
          </div>
          <div
            ref={mediaRef}
            className="positioning-media overflow-hidden rounded-sm"
            style={{
              aspectRatio: "3 / 4",
              transform: `translateY(${offset}px)`,
              willChange: prefersReducedMotion ? undefined : "transform",
            }}
          >
            <AutoplayVideo media={positioning.media} className="h-full w-full object-cover" />
          </div>
        </div>
      </Container>
    </Section>
  );
}
