"use client";

import { useEffect, useState } from "react";
import type { HeroContentView } from "../lib/viewModels";
import { AutoplayVideo } from "../components/AutoplayVideo";
import { Button } from "../components/Button";
import { Container } from "../components/Container";
import { Eyebrow } from "../components/Eyebrow";
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
      className="flex items-center bg-ink pt-24"
      style={{ minHeight: "calc(100svh - 5rem)" }}
    >
      <Container className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <Eyebrow dark>{hero.eyebrow}</Eyebrow>
          <h1 className="text-display-xl mt-4 font-semibold text-canvas">
            {hero.headlineLines.map((line, index) => (
              <span
                key={line}
                className="block overflow-hidden"
                style={{
                  clipPath: prefersReducedMotion || isRevealed ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)",
                  transitionProperty: "clip-path",
                  transitionDuration: prefersReducedMotion ? "120ms" : "500ms",
                  transitionDelay: prefersReducedMotion ? "0ms" : `${index * 90}ms`,
                  transitionTimingFunction: "var(--ease-base)",
                }}
              >
                {line}
              </span>
            ))}
          </h1>
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
            {hero.subhead}
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
        </div>

        <div
          className="overflow-hidden rounded-sm"
          style={{
            aspectRatio: "16 / 9",
            transform: prefersReducedMotion || isRevealed ? "scale(1)" : "scale(1.04)",
            transitionProperty: "transform",
            transitionDuration: prefersReducedMotion ? "120ms" : "900ms",
            transitionTimingFunction: "var(--ease-base)",
          }}
        >
          <AutoplayVideo media={hero.media} className="h-full w-full object-cover" />
        </div>
      </Container>
    </section>
  );
}
