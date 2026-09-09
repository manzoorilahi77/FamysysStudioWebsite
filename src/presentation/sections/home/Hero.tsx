"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useMemo } from "react";
import type { HeroContentView } from "../../lib/viewModels";
import { Button } from "../../components/Button";
import { RevealHeading } from "../../components/RevealHeading";
import { useHeroMotion } from "../../hooks/useHeroMotion";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { motionLayerMinWidth } from "../../../shared/design/tokens";

interface HeroProps {
  readonly hero: HeroContentView;
}

/** The words the headline sets in the display accent face. */
const ACCENT_PHRASES = ["agency overhead."] as const;

/**
 * THE THREE BANDS A PHONE SHOWS, as indices into `hero.bands`.
 *
 * The six run camera, colour, motion, design, content, AI — the order
 * /creative-services uses, set in marketing.content.ts. The client names Colour, Design
 * and Content as the three worth the room a phone has, which is the 2nd, 4th and 5th:
 * indices 1, 3 and 4. It was the first three, taken as a slice off the front, and the
 * strip came out camera / colour / motion.
 *
 * THIS LIST IS HALF OF A PAIR AND THE OTHER HALF IS IN CSS. `globals.css` hides the
 * complement — `.hero-final-band:nth-child(1), :nth-child(3), :nth-child(6)` inside the
 * `max-width: 900px` block, one-based where these are zero-based — because the strip has
 * to be a subset without the markup differing between a phone and a desktop, which rules
 * out choosing it in the render. What this list is for is the SEQUENCE: the scroll steps
 * through exactly these and never opens a band that is not on the screen. Change one and
 * the other has to change with it; there is no way to derive either from the other, so
 * they are cross-referenced instead.
 */
const HERO_MOBILE_BANDS: ReadonlyArray<number> = [1, 3, 4];

/** Below the site's one breakpoint. `useMediaQuery` answers false until it has hydrated,
 *  so the first render is the desktop list and matches the markup the server sent. */
const NARROW = `(max-width: ${motionLayerMinWidth - 1}px)`;

/**
 * THE HOMEPAGE HERO. Type left, a five-band accordion right, and a level meter painted
 * across the whole ground behind both.
 *
 * The meter is a canvas rather than elements because it is dozens of shapes redrawn every
 * frame; everything else here is layout and CSS. All of the motion — the meter, the copy
 * column's lift, which band is open, the two magnetic buttons — comes from one loop in
 * useHeroMotion, which is also where reduced motion is answered.
 *
 * WHAT THE SECTION IS WITHOUT A CURSOR. Two of the four things that move here are the
 * pointer answering itself: the bulge and playhead under the cursor, and the two magnetic
 * buttons. Both are off where the primary pointer is coarse — see `useFinePointer` — and
 * neither is replaced by a touch equivalent, because there is nothing a thumb was being
 * told by them. What is left is the half that was always scroll-driven: the three sines
 * drifting the field on their own, the scroll velocity lifting it, and the accordion
 * stepping band by band as the hero leaves. On a phone the meter answers the scroll, which
 * is the input the reader actually has, and the bands answer a tap.
 *
 * WHAT IS NOT JAVASCRIPT. The entrance. The headline reveals through RevealHeading and
 * everything under it through `.enter-fade`, both of which are keyframes and transitions
 * that finish on their own — so with the bundle blocked or failed the hero is simply
 * present, rather than a section of invisible text. That is the same rule the mosaic hero
 * was rebuilt around and it has not changed; only what moves has.
 */
export function Hero({ hero }: HeroProps) {
  const isNarrow = useMediaQuery(NARROW);
  const bandSteps = useMemo(
    () => (isNarrow ? HERO_MOBILE_BANDS : hero.bands.map((_, index) => index)),
    [isNarrow, hero.bands],
  );
  const {
    sectionRef,
    canvasRef,
    bodyRef,
    activeBand,
    onBandEnter,
    onBandLeave,
    onBandPress,
    hasFinePointer,
  } = useHeroMotion(bandSteps);

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
          would lose.

          EACH BAND IS A BUTTON, and it is a button for the touch screen rather than for
          the mouse. With a cursor the band opens on hover and the button is simply a
          second way in; with a thumb hover does not exist, and the pointer handlers below
          are guarded on `hasFinePointer` because a tap fires `pointerenter` and never
          fires `pointerleave` — so without the guard one tap pinned a band open and the
          scroll stopped stepping the accordion for the rest of the visit. `aria-pressed`
          is what says which of the five is open to a reader who cannot see the widths. */}
      <ul className="hero-final-accordion">
        {hero.bands.map((band, index) => (
          <li
            key={band.media.src}
            className={`hero-final-band${index === activeBand ? " is-open" : ""}`}
            {...(hasFinePointer
              ? {
                  onPointerEnter: () => onBandEnter(index),
                  onPointerLeave: onBandLeave,
                }
              : {})}
          >
            <Image
              src={band.media.src}
              alt={band.media.alt}
              width={900}
              height={1200}
              sizes="(min-width: 901px) 28vw, 33vw"
              // EAGER, NOT `priority`. `priority` adds `<link rel="preload" as="image">`,
              // and this photograph is 682 kB — the heaviest file on the site — preloaded
              // ahead of everything else on the page. Measured, the largest contentful
              // paint is the H1 at both 390 and 1440 and never this picture, so the
              // preload was buying nothing and spending it in front of the element that
              // actually decides the number. On a phone it is worse than nothing: the
              // strip lies along the bottom of the hero and the band renders about 130px
              // wide, so the preload is 682 kB fetched at highest priority for a
              // thumbnail. Eager keeps it in the first wave without jumping the queue.
              loading={index === 0 ? "eager" : "lazy"}
              className="hero-final-band-media"
            />
            <button
              type="button"
              className="hero-final-band-hit"
              aria-pressed={index === activeBand}
              onClick={() => onBandPress(index)}
            >
              <span className="hero-final-band-label">
                {band.label}
                {/* THE BAND'S PLACE IN THE STRIP THAT IS ON THE SCREEN, not its place in
                    the list of six. They are the same thing on a desktop, where the strip
                    IS the six; below 900 the strip is bands 1, 3 and 4 and the numerals
                    would otherwise read 02, 04, 05 — the DOM's answer to a question nobody
                    asked. A band not in the strip keeps its own index and is hidden
                    anyway. */}
                <b>{String((bandSteps.indexOf(index) + 1 || index + 1)).padStart(2, "0")}</b>
              </span>
            </button>
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
