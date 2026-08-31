"use client";

import Image from "next/image";
import type { AspectRatio } from "../../domain/shared/value-objects/MediaRef";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";
import type { CaseStudyDetailView } from "../lib/viewModels";

/**
 * The ratio is content, not layout: it travels on the piece's own MediaRef, so the grid's
 * uneven rhythm survives filtering. The homepage held the same rhythm in a positional
 * array, which only works while all eight are on screen in a fixed order.
 */
const RATIO: Record<AspectRatio, { readonly css: string; readonly w: number; readonly h: number }> =
  {
    "4:3": { css: "4 / 3", w: 1600, h: 1200 },
    "3:4": { css: "3 / 4", w: 1200, h: 1600 },
    "1:1": { css: "1 / 1", w: 1400, h: 1400 },
    "16:9": { css: "16 / 9", w: 1600, h: 900 },
  };

interface WorkTileProps {
  readonly piece: CaseStudyDetailView;
  /** The one status wording, passed in rather than written here. See SelectedWorkPage. */
  readonly statusLabel: string;
  readonly isPriority: boolean;
  readonly onOpen: () => void;
}

/**
 * One planned piece.
 *
 * The status marker is a chip ON the media, opaque and always visible — not a hover
 * state and not a footnote. Every place a piece appears has to say the same thing in the
 * same words, because a grid of covers under real titles reads as delivered work unless
 * each tile says otherwise. The chip carries its own opaque fill for a second reason:
 * axe cannot evaluate text sitting on a photograph, so the fill is what the colour is
 * measured against — canvas on accent at rest (5.107:1), canvas on ink on hover
 * (12.549:1).
 *
 * The heading holds the trigger and a stretched pseudo-element makes the whole card
 * clickable, rather than wrapping the card in a button: a button may only contain
 * phrasing content, so a heading inside one is invalid, and dropping the heading would
 * cost the page its outline.
 *
 * Category chips sit BELOW the media on the section's own background rather than over
 * the photograph, for the same contrast reason — five chips on five different frames is
 * five colour pairs nothing can check.
 */
export function WorkTile({ piece, statusLabel, isPriority, onOpen }: WorkTileProps) {
  const [ref, isInView] = useInView<HTMLElement>({ threshold: 0.2, once: true });
  const prefersReducedMotion = useReducedMotion();
  const hasSettled = prefersReducedMotion || isInView;
  const ratio = RATIO[piece.media.aspectRatio];

  return (
    <article
      ref={ref}
      id={piece.slug}
      className="work-tile work-anchor"
      data-settled={hasSettled}
      data-slug={piece.slug}
    >
      <div className="media-tile" style={{ aspectRatio: ratio.css }}>
        <Image
          src={piece.media.src}
          alt={piece.media.alt}
          width={ratio.w}
          height={ratio.h}
          sizes="(min-width: 768px) 50vw, 100vw"
          {...(isPriority ? { priority: true } : { loading: "lazy" as const })}
          className={`media-tile-media h-full w-full object-cover ${
            prefersReducedMotion ? "" : "media-tile-media--scalable"
          }`}
        />
        <span className="media-tile-chip media-tile-chip--wrap">{statusLabel}</span>
      </div>

      <p className="work-reference label mt-5 text-ink-70">{piece.reference}</p>
      <h3 className="text-display-s mt-2 font-medium text-ink">
        <button type="button" className="work-tile-trigger" aria-haspopup="dialog" onClick={onOpen}>
          {piece.title}
        </button>
      </h3>
      {/* The client's own one-line intent, directly under the title it belongs to. The
          marker class is not styling: it is what lets the verification tell the client's
          approved words apart from ours when it sweeps the rendered page for invented
          figures. One of those lines is "B2B/corporate credibility." */}
      <p className="work-intent text-small mt-2 text-ink-70">{piece.description}</p>

      <ul className="work-chips mt-4">
        {piece.capabilities.map((capability) => (
          <li key={capability.title}>
            <span className="work-chip">{capability.title}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
