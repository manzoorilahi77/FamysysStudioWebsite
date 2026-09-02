"use client";

import Image from "next/image";
import { Button } from "../components/Button";
import { Container } from "../components/Container";
import { Eyebrow } from "../components/Eyebrow";
import { RevealHeading } from "../components/RevealHeading";
import type { ServicesHeroView } from "../lib/viewModels";

interface ServicesHeroProps {
  readonly hero: ServicesHeroView;
}

/**
 * A section-page hero, not a landing-page one. It holds around 60svh rather than the
 * homepage's full viewport, carries no mosaic, and offers one call to action instead of
 * two — the reader arriving here has already chosen a direction, and the page's actual
 * subject is the six blocks below.
 *
 * The wide band underneath the copy is the only image. It sits inside the dark section so
 * the hero still reads as one ink block, and it is deliberately short: a tall image here
 * would push the first capability off the fold and turn a section page into a splash.
 */
export function ServicesHero({ hero }: ServicesHeroProps) {
  return (
    <section
      className="surface-dark bg-ink text-canvas"
      aria-label={hero.heading}
      style={{ minHeight: "60svh" }}
    >
      <Container>
        {/* Top padding clears the fixed header and no more. The whole section is budgeted
            to about 60svh, so every step here is tighter than a homepage section's: the
            heading takes the hero step rather than display-l (which is LARGER than the
            homepage headline and would have read as an escalation, not a step down), and
            the band below is short enough to leave the first capability near the fold. */}
        <div className="pt-28 pb-8">
          <Eyebrow dark>{hero.eyebrow}</Eyebrow>
          <RevealHeading
            as="h1"
            className="text-heading mt-5 max-w-[24ch] font-semibold text-canvas"
            accent={["one team."]}
          >
            {hero.heading}
          </RevealHeading>
          <p className="text-body mt-6 text-canvas-80" style={{ maxWidth: "58ch" }}>
            {hero.body}
          </p>
          <div className="mt-8">
            <Button cta={hero.cta} variant="primary" dark />
          </div>
        </div>
      </Container>

      <div className="services-hero-band">
        <Image
          src={hero.media.src}
          alt={hero.media.alt}
          width={2400}
          height={1000}
          sizes="100vw"
          priority
          className="h-full w-full object-cover"
        />
      </div>
    </section>
  );
}
