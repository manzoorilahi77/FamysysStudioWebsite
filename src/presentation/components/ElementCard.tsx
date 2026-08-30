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
    <article className="element-card h-full">
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

      <div className={`element-panel element-panel--${tone} p-6`}>
        <p className="text-display-s font-medium">{element.title}</p>
        <p className="element-description text-small mt-3">{element.description}</p>
      </div>
    </article>
  );
}
