"use client";

import { useEffect, useState } from "react";
import type { HeroContentView } from "../lib/viewModels";
import { Button } from "../components/Button";
import { HeroMosaic } from "../components/HeroMosaic";
import { Container } from "../components/Container";
import { RevealHeading } from "../components/RevealHeading";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface HeroProps {
  readonly hero: HeroContentView;
}

export function Hero({ hero }: HeroProps) {
  const [isMounted, setIsMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isRevealed = isMounted || prefersReducedMotion;

  return (
    <section
      aria-label="Introduction"
      className="surface-dark flex items-center bg-ink pt-24"
      style={{ minHeight: "calc(100svh - 5rem)" }}
    >
      <Container className="grid items-center gap-10 lg:grid-cols-2 lg:items-stretch">
        <div>
          {/* The h1 uses the same line-by-line reveal as every other display heading
              on the page; it just fires on mount rather than on scroll, because it is
              already in view. */}
          <RevealHeading
            as="h1"
            className="text-display-xl font-semibold text-canvas"
            accent={["the agency overhead."]}
          >
            {hero.heading}
          </RevealHeading>
          <p
            className="text-lead mt-6 text-canvas-80"
            style={{
              maxWidth: "60ch",
              opacity: isRevealed ? 1 : 0,
              transform: prefersReducedMotion || isRevealed ? "translateY(0)" : "translateY(12px)",
              transitionProperty: "opacity, transform",
              transitionDuration: prefersReducedMotion ? "120ms" : "400ms",
              transitionDelay: prefersReducedMotion ? "0ms" : "200ms",
              transitionTimingFunction: "var(--ease-base)",
            }}
          >
            {hero.body}
          </p>
          <div
            className="mt-8 flex flex-wrap gap-4"
            style={{
              opacity: isRevealed ? 1 : 0,
              transform: prefersReducedMotion || isRevealed ? "translateY(0)" : "translateY(12px)",
              transitionProperty: "opacity, transform",
              transitionDuration: prefersReducedMotion ? "120ms" : "400ms",
              transitionDelay: prefersReducedMotion ? "0ms" : "200ms",
              transitionTimingFunction: "var(--ease-base)",
            }}
          >
            <Button cta={hero.primaryCta} variant="primary" dark />
            <Button cta={hero.secondaryCta} variant="ghost" dark />
          </div>
          <p
            className="text-small mt-6 text-canvas-60"
            style={{
              opacity: isRevealed ? 1 : 0,
              transitionProperty: "opacity",
              transitionDuration: prefersReducedMotion ? "120ms" : "400ms",
              transitionDelay: prefersReducedMotion ? "0ms" : "300ms",
              transitionTimingFunction: "var(--ease-base)",
            }}
          >
            {hero.supportingLine}
          </p>
        </div>

        <div
          className="h-[380px] sm:h-[460px] lg:h-full"
          style={{
            transform: prefersReducedMotion || isRevealed ? "scale(1)" : "scale(1.04)",
            transitionProperty: "transform",
            transitionDuration: prefersReducedMotion ? "120ms" : "900ms",
            transitionTimingFunction: "var(--ease-base)",
          }}
        >
          <HeroMosaic tiles={hero.mosaicTiles} />
        </div>
      </Container>
    </section>
  );
}
