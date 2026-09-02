"use client";

import type { CSSProperties } from "react";
import type { HeroContentView } from "../lib/viewModels";
import { Button } from "../components/Button";
import { HeroMosaic } from "../components/HeroMosaic";
import { Container } from "../components/Container";
import { RevealHeading } from "../components/RevealHeading";

interface HeroProps {
  readonly hero: HeroContentView;
}

export function Hero({ hero }: HeroProps) {
  // The entrance is a CSS animation now, not an effect that flips opacity on mount — see
  // `.enter-fade` in globals.css. The old shape meant the hero's supporting copy, its two
  // buttons and its closing line were rendered at opacity 0 and only ever revealed if the
  // client bundle ran; a keyframe animation finishes on its own. Reduced motion is handled
  // in the stylesheet too, so this component no longer needs to know about it.
  const fadeIn = (delayMs: number) => ({ "--enter-delay": `${delayMs}ms` }) as CSSProperties;

  return (
    // Exactly one viewport tall, header included — the header is fixed and overlays this
    // section, so `pt-24` is what keeps the copy clear of it rather than the section
    // being shortened by the header's height. Everything inside has to fit; the type
    // scale came down for it, the section height did not go up.
    <section
      aria-label="Introduction"
      className="surface-dark relative flex items-center overflow-hidden bg-ink pt-24"
      style={{ height: "100svh" }}
    >
      {/* Full-bleed to the right edge, and to the SECTION's top rather than to the bottom
          of the header: the bar is transparent at scroll 0 again, so the strip behind it
          is the one place the mosaic is doing its job — tiles drift past behind the nav.
          Starting it below the header would put a bare ink band where that should be. It
          is positioned against the section rather than placed in the container grid, which
          is what lets its right column reach the viewport edge instead of stopping at the
          container gutter. */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] lg:block">
        <div className="hero-mosaic-frame enter-scale pointer-events-auto h-full">
          <HeroMosaic tiles={hero.mosaicTiles} />
        </div>
      </div>

      <div
        className="hero-top-scrim pointer-events-none absolute inset-x-0 top-0 z-[5]"
        aria-hidden="true"
      />

      <Container className="relative z-10">
        <div className="lg:max-w-[46%]">
          {/* The h1 uses the same line-by-line reveal as every other display heading
              on the page; it just fires on mount rather than on scroll, because it is
              already in view. */}
          <RevealHeading
            as="h1"
            className="text-heading font-semibold text-canvas"
            accent={["the agency overhead."]}
          >
            {hero.heading}
          </RevealHeading>
          <p
            className="text-body enter-fade mt-6 text-canvas-80"
            style={{ maxWidth: "52ch", ...fadeIn(200) }}
          >
            {hero.body}
          </p>
          <div className="enter-fade mt-8 flex flex-wrap gap-4" style={fadeIn(200)}>
            <Button cta={hero.primaryCta} variant="primary" dark />
            <Button cta={hero.secondaryCta} variant="ghost" dark />
          </div>
          <p className="text-small enter-fade mt-6 text-canvas-60" style={fadeIn(300)}>
            {hero.supportingLine}
          </p>
        </div>
      </Container>
    </section>
  );
}
