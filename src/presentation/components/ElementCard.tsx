"use client";

import Image from "next/image";
import type { DifferentiatorView } from "../lib/viewModels";

/**
 * The four panel fills, in the order the row runs: accent, card, warm, card. Three
 * colours across four cards rather than two across four, so the row reads as a
 * deliberate sequence instead of a stripe — and the two white cards are what keep it
 * from reading as a paint chart.
 *
 * Every one carries its text well over the 4.5:1 floor and every one separates from the
 * ink ground, which is what the earlier charcoal proposal could not do (`graphite` on
 * `ink` is 1.047:1, an invisible card). Measured by `npm run check-colours`:
 *
 *   accent  fill, white text   5.768:1 text   2.457:1 against the section  (see below)
 *   card    fill, ink text    14.173:1 text  14.173:1 against the section
 *   warm    fill, ink text     5.031:1 text   5.031:1 against the section
 *
 * The accent panel's own EDGE against the ink section is soft at 2.457:1 — the two are
 * close in luminance even though they read as different colours. It was the only fill on
 * the row before, so the softness was the row's; with two white cards and a warm one
 * beside it the sequence carries the edge and the single accent panel does not have to.
 */
export type ElementTone = "accent" | "card" | "warm";

interface ElementCardProps {
  readonly element: DifferentiatorView;
  readonly tone: ElementTone;
}

export function ElementCard({ element, tone }: ElementCardProps) {
  return (
    <article className="element-card">
      {/* The frame. It shrinks on hover and the image is cropped by `object-fit: cover`
          inside it, so what moves is the boundary — nothing slides over the picture. */}
      <div className="element-media">
        <Image
          src={element.media.src}
          alt={element.media.alt}
          width={1200}
          height={900}
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>

      {/* The panel is exactly its own content in both states, so the resting height is the
          title's and nothing more. The descriptor's wrapper is the single animated thing
          in the card: its grid track runs 0fr to 1fr, the panel grows by exactly that, and
          the media above gives up exactly that. The gap above the descriptor is padding
          inside the track rather than a margin outside it, or 12px of it would survive the
          collapse. */}
      <div className={`element-panel element-panel--${tone} p-6`}>
        <p className="element-title text-display-s font-medium">{element.title}</p>
        <div className="element-description-slot">
          <div className="element-description-clip">
            <p className="element-description text-small">{element.description}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
