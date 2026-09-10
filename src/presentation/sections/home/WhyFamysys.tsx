"use client";

import { Media } from "../../components/Media";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef } from "react";
import { Container } from "../../components/Container";
import { Section } from "../../components/Section";
import { SectionHeader } from "../../components/SectionHeader";
import { useMotionLayer } from "../../hooks/useMotionLayer";
import { motionLayerMinWidth } from "../../../shared/design/tokens";
import { useScrollFrame } from "../../hooks/useScrollFrame";
import type { WhyFamysysBlockView } from "../../lib/viewModels";

interface WhyFamysysProps {
  readonly whyFamysys: WhyFamysysBlockView;
}

/** Scroll each card is given while the stage holds, as a share of the viewport. */
const RAIL_PER_CARD_VH = 30;
/** How far a card rises as it passes the middle of the stage, in pixels. */
const CARD_LIFT = 22;
/** How far a picture leans inside its own window, as a percentage of its width. */
const IMAGE_PARALLAX = 7;
/** Share of the stage width over which the lift falls away from the centre line. */
const LIFT_FALLOFF = 0.42;
/** The picture is oversized by this much so the lean never exposes an edge. */
const IMAGE_OVERSCAN = 1.14;

interface Geometry {
  travel: number;
  stageWidth: number;
  /** Each card's centre, in pixels from the rail's own left edge. */
  centres: ReadonlyArray<number>;
}

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/**
 * THE FIVE QUALITIES — a rail that travels sideways as the page scrolls down.
 *
 * The five sit on one row of tall cards, wider than the screen, and the stage holds still
 * while the row draws across it. A card rises as it reaches the middle and settles as it
 * leaves; each picture leans inside its own window against the row's travel. The row has
 * depth without anything being faded out to get it.
 *
 * WHY NOT THE CORRIDOR IT REPLACES. That was ported from an exploration built on a dark
 * ground, where distance reads as a card fading toward black. This section is cream, and
 * the same fade here is a card washing out to the page: the far ones did not read as far
 * away, they read as half-loaded, and three of the five were invisible at any moment while
 * most of the screen was empty. Depth had to come from something other than opacity, and a
 * row that fills the frame edge to edge has no empty ground left to explain.
 *
 * NO NUMERALS, for the reason the corridor lost them too: these five hold at the same
 * time. A row says that; a numbered sequence says the opposite.
 *
 * NO COPY SITS ON A PHOTOGRAPH. Each card's name and sentence are on a fully opaque plate
 * beneath its picture, never over it, and both are in the document at all times — nothing
 * is behind a pointer, so a screen reader and a keyboard get all five without touching
 * anything.
 *
 * THE BASE STATE IS THE FINAL STATE. Before the script runs, and under
 * `prefers-reduced-motion`, there is no track and no rail: the five are an ordinary
 * responsive grid, every picture and sentence in place, nothing moving. The motion layer
 * is only ever added on top, scoped to `[data-motion="on"]`. See `useMotionLayer`.
 *
 * NOTHING INTERCEPTS SCROLLING. The stage is `position: sticky` inside a taller track, so
 * the page moves at exactly the rate the reader asks for; the sideways travel is a
 * transform on the row, never a hijacked wheel event.
 */
export function WhyFamysys({ whyFamysys }: WhyFamysysProps) {
  /**
   * BELOW 900 THE RAIL IS THE GRID IT RENDERS AS WITHOUT A SCRIPT.
   *
   * A row wider than the screen, drawn sideways as the page scrolls down, needs horizontal
   * room to be a row; at 390 the five cards are 208px each and the stage shows one and a
   * half of them, which reads as a carousel that scrolls itself rather than as five things
   * held at once. The base state says the same thing — five peers, no numerals — in a
   * single column. This section is not currently rendered by any page (see the note in
   * app/page.tsx); the switch is here so putting it back is still one line.
   */
  const isMotionOn = useMotionLayer({ minWidth: motionLayerMinWidth });
  const trackRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLUListElement>(null);
  const cardsRef = useRef<ReadonlyArray<HTMLElement>>([]);
  const geometryRef = useRef<Geometry>({ travel: 0, stageWidth: 0, centres: [] });

  /**
   * GEOMETRY IS MEASURED HERE AND NOWHERE ELSE — on mount, on resize, and whenever the
   * rail's own box changes, which is what a picture settling into its aspect ratio does.
   * The frame below reads one rect, the track's position in the viewport, which is a
   * scroll reading rather than a layout one.
   */
  useEffect(() => {
    const track = trackRef.current;
    const rail = railRef.current;
    if (!track || !rail || !isMotionOn) {
      cardsRef.current = [];
      return;
    }
    const cards = Array.from(rail.querySelectorAll<HTMLElement>("[data-card]"));
    cardsRef.current = cards;

    function measure(): void {
      const node = railRef.current;
      const stage = trackRef.current?.firstElementChild;
      if (!node || !(stage instanceof HTMLElement)) {
        return;
      }
      const stageWidth = stage.clientWidth;
      geometryRef.current = {
        // What the row has to travel for its last card to reach the right-hand edge.
        travel: Math.max(0, node.scrollWidth - stageWidth),
        stageWidth,
        centres: cards.map((card) => card.offsetLeft + card.offsetWidth / 2),
      };
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(rail);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      // The motion layer owns these properties and nothing else writes them, so handing
      // them back is what leaves the reduced-motion state genuinely untouched.
      rail.style.transform = "";
      for (const card of cards) {
        card.style.transform = "";
        card.style.removeProperty("--near");
        const image = card.querySelector<HTMLElement>("[data-card-image]");
        if (image) image.style.transform = "";
      }
      cardsRef.current = [];
    };
  }, [isMotionOn, whyFamysys.reasons.length]);

  const paint = useCallback(() => {
    const track = trackRef.current;
    const rail = railRef.current;
    const cards = cardsRef.current;
    const { travel, stageWidth, centres } = geometryRef.current;
    if (!track || !rail || cards.length === 0 || stageWidth === 0) {
      return;
    }
    // The one rect this frame reads, and it is read before a single style is written.
    const rect = track.getBoundingClientRect();
    const runway = rect.height - window.innerHeight;
    if (runway <= 0) {
      return;
    }
    const railX = -clamp(-rect.top / runway, 0, 1) * travel;
    const middle = stageWidth / 2;
    const falloff = stageWidth * LIFT_FALLOFF;

    // Every card's offset from the centre line, computed from the cached centres rather
    // than measured, so the loop below reads nothing and only writes.
    const offsets = centres.map((centre) => centre + railX - middle);

    rail.style.transform = `translate3d(${railX.toFixed(1)}px,0,0)`;

    cards.forEach((card, index) => {
      const offset = offsets[index] ?? 0;
      /**
       * How near this card is to the middle: 1 on the centre line, 0 once it is a falloff
       * away. CONTINUOUS, not a winner — the first and last card can never reach the centre
       * of a row that starts and ends flush with the frame, so picking a single nearest
       * left two of the five permanently unlit. As a ramp every card lights as it comes in
       * and dims as it goes, and the ends get their share.
       */
      const closeness = clamp(1 - Math.abs(offset) / falloff, 0, 1);
      card.style.setProperty("--near", closeness.toFixed(3));
      card.style.transform = `translate3d(0,${(-CARD_LIFT * closeness).toFixed(2)}px,0)`;

      const image = card.querySelector<HTMLElement>("[data-card-image]");
      if (image) {
        const lean = clamp(offset / stageWidth, -1, 1) * IMAGE_PARALLAX;
        image.style.transform = `translate3d(${lean.toFixed(2)}%,0,0) scale(${IMAGE_OVERSCAN})`;
      }
    });
  }, []);

  useScrollFrame(paint, isMotionOn);

  return (
    // Dark, on the alternate green. The rail's cards stay light objects on it — a cream
    // card on the dark ground separates further than it did on the warm one, and the card
    // pins its own ink text rather than inheriting the section's cream.
    <Section cmsSection="why-famysys" dark ground="alt" fade={false} ariaLabel={whyFamysys.heading}>
      <div
        ref={trackRef}
        className="rail-track"
        data-motion={isMotionOn ? "on" : "off"}
        style={
          {
            "--rail-track-height": `${100 + whyFamysys.reasons.length * RAIL_PER_CARD_VH}vh`,
          } as CSSProperties
        }
      >
        {/* THE HEADING IS INSIDE THE STAGE, so it is held with the row rather than scrolled
            off above it: the whole section — what it is called, what it claims, and all
            five cards — is on the screen at once for the length of the travel. `dark`,
            because the section is: without it the heading renders in ink on the green. */}
        <div className="rail-stage">
          <Container>
            <SectionHeader split dark heading={whyFamysys.heading} body={whyFamysys.body} />
          </Container>

          <ul className="rail" ref={railRef}>
            {whyFamysys.reasons.map((reason) => (
              <li key={reason.title} className="rail-card" data-card>
                <div className="rail-window">
                  <Media
                    media={reason.media}
                    width={1200}
                    height={1500}
                    // Below 901 the rail is the base grid — one column at a phone's width, so the
                    // card fills the container line rather than the 78vw a travelling row gave it.
                    sizes="(min-width: 901px) 26rem, 90vw"
                    className="rail-image"
                    dataAttribute="data-card-image"
                  />
                </div>
                {/* Opaque, and under the picture rather than over it. */}
                <div className="rail-plate">
                  <span className="rail-mark" aria-hidden="true" />
                  <h3 className="rail-title text-display-s font-medium">{reason.title}</h3>
                  <p className="rail-say text-small">{reason.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
