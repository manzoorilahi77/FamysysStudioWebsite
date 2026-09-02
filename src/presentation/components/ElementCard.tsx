"use client";

import Image from "next/image";
import type { DifferentiatorView } from "../lib/viewModels";

/**
 * Alternating panel fills. Not the charcoal the brief first asked for: `graphite` on `ink`
 * measures 1.047:1, so those cards would have been very nearly invisible against the
 * section. Canvas and accent both separate from the ink ground and both carry text well
 * above the 4.5:1 floor — ink on canvas is 12.553:1, canvas on accent is 5.107:1 — and
 * both are brand colours, so the alternation survives without a fifth colour.
 */
export type ElementTone = "canvas" | "accent";

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
