"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import type { HeroContentView } from "../../lib/viewModels";
import { Button } from "../../components/Button";
import { RevealHeading } from "../../components/RevealHeading";
import { useHeroMotion } from "../../hooks/useHeroMotion";

interface HeroProps {
  readonly hero: HeroContentView;
}

/** The words the headline sets in the display accent face. */
const ACCENT_PHRASES = ["agency overhead."] as const;

/**
 * THE HOMEPAGE HERO. Type left, a five-band accordion right, and a sixty-four bar level
 * meter painted across the whole ground behind both.
 *
 * The meter is a canvas rather than elements because it is 64 shapes redrawn every frame;
 * everything else here is layout and CSS. All of the motion — the meter, the copy
 * column's lift, which band is open, the two magnetic buttons — comes from one loop in
 * useHeroMotion, which is also where reduced motion is answered.
 *
 * WHAT IS NOT JAVASCRIPT. The entrance. The headline reveals through RevealHeading and
 * everything under it through `.enter-fade`, both of which are keyframes and transitions
 * that finish on their own — so with the bundle blocked or failed the hero is simply
 * present, rather than a section of invisible text. That is the same rule the mosaic hero
 * was rebuilt around and it has not changed; only what moves has.
 */
export function Hero({ hero }: HeroProps) {
  const { sectionRef, canvasRef, bodyRef, activeBand, onBandEnter, onBandLeave } = useHeroMotion(
    hero.bands.length,
  );

  const fadeIn = (delayMs: number) => ({ "--enter-delay": `${delayMs}ms` }) as CSSProperties;

  return (
    // Exactly one viewport tall, header included — the header is fixed and overlays this
    // section, so the copy column's top padding is what keeps the type clear of it rather
    // than the section being shortened by the bar's height.
    <section
      ref={sectionRef}
      aria-label="Introduction"
      className="hero-final surface-dark bg-ink"
    >
      <div className="hero-final-meter" aria-hidden="true">
        <canvas ref={canvasRef} />
      </div>
      {/* The type sits left, so the ground is carried heaviest on that side and thins
          across to the accordion. This is what the headline is actually read against —
          the meter runs the full width behind it. */}
      <div className="hero-final-veil" aria-hidden="true" />

      {/* A list, because that is what it is: five disciplines in a fixed order, and the
          numeral beside each label is its position in that order. Only the open band is
          expanded; the rest are legible slivers, so nothing here is content that hiding
          would lose. */}
      <ul className="hero-final-accordion">
        {hero.bands.map((band, index) => (
          <li
            key={band.media.src}
            className={`hero-final-band${index === activeBand ? " is-open" : ""}`}
            onPointerEnter={() => onBandEnter(index)}
            onPointerLeave={onBandLeave}
          >
            <Image
              src={band.media.src}
              alt={band.media.alt}
              width={900}
              height={1200}
              sizes="(min-width: 901px) 28vw, 33vw"
              priority={index === 0}
              loading={index === 0 ? undefined : "lazy"}
              className="hero-final-band-media"
            />
            <span className="hero-final-band-label">
              {band.label}
              <b>{String(index + 1).padStart(2, "0")}</b>
            </span>
          </li>
        ))}
      </ul>

      <div ref={bodyRef} className="hero-final-body">
        <RevealHeading as="h1" className="hero-final-heading" accent={ACCENT_PHRASES}>
          {hero.heading}
        </RevealHeading>
        <p className="hero-final-sub enter-fade" style={fadeIn(360)}>
          {hero.body}
        </p>
        <div className="hero-final-cta enter-fade" style={fadeIn(480)}>
          {/* The LIGHT primary variant on a dark ground, as the approved design has it:
              the accent fill carrying the page ground as its label. Same choice the header
              bar makes, and it needs the same hairline — see `.hero-final-btn--primary`. */}
          <Button
            cta={hero.primaryCta}
            variant="primary"
            rollOnHover
            className="hero-final-btn hero-final-btn--primary"
          />
          <Button
            cta={hero.secondaryCta}
            variant="ghost"
            dark
            rollOnHover
            className="hero-final-btn"
          />
        </div>
        <p className="hero-final-sup enter-fade" style={fadeIn(600)}>
          {hero.supportingLine}
        </p>
      </div>
    </section>
  );
}
