"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import type { SectionIntro } from "../../../domain/marketing/entities/SectionIntro";
import { Container } from "../../components/Container";
import { Section } from "../../components/Section";
import { useMotionLayer } from "../../hooks/useMotionLayer";
import { motionLayerMinWidth } from "../../../shared/design/tokens";
import { useScrollFrame } from "../../hooks/useScrollFrame";
import type { CaseStudyView } from "../../lib/viewModels";

interface SelectedWorkCoversProps {
  readonly intro: SectionIntro;
  readonly caseStudies: ReadonlyArray<CaseStudyView>;
}

/** Where a frame's top is when its mask starts to slide, as a fraction of the viewport. */
const MASK_START = 0.92;
/** And where it is when the mask has cleared the frame entirely. */
const MASK_END = 0.4;
/** A hair past 100 so the mask's own edge is off the frame, not sitting on its last row. */
const MASK_TRAVEL = 101;
/** Percent of its own height the picture rises as it is uncovered. */
const IMAGE_RISE = 6;
/** How much larger the picture starts, so it settles into the frame rather than arriving. */
const IMAGE_SETTLE = 0.06;
/** Pixels the caption lifts through, and the opacity it starts from. */
const TAG_LIFT = 14;
const TAG_FLOOR = 0.25;

interface CoverParts {
  readonly frame: HTMLElement;
  readonly image: HTMLElement | null;
  readonly veil: HTMLElement | null;
  readonly tag: HTMLElement | null;
}

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/** Smoothstep — the mask leaves and arrives slowly and crosses the frame quickly. */
function ease(t: number): number {
  return t * t * (3 - 2 * t);
}

/**
 * THE EIGHT PIECES, UNCOVERED BY A MASK THAT TRACKS THE SCROLL.
 *
 * Two columns on the container line, the right one dropped by most of a frame, so the
 * eight read down the page as a stagger rather than as four tidy rows. Every frame is 4:3
 * and every caption sits under its own picture: an italic numeral, the title, and the line
 * that says what the piece was for.
 *
 * WHAT MOVES. Each frame carries a solid panel of the section's own ground over it, and
 * that panel slides DOWN off the frame as the frame comes up the viewport — so a piece is
 * uncovered rather than faded in, and what appears is the photograph at full strength
 * rather than a half-transparent one. Underneath it the picture is 6% high and 6% large,
 * and it settles both back as the mask clears; the caption comes up 14px behind it. The
 * offset column means the two sides are never uncovered on the same beat.
 *
 * WHAT IT REPLACES. Eight covers at full bleed, two to a row with no gutter, each panning
 * inside a window it was taller than. That was one moving surface with the pictures welded
 * edge to edge; this is eight separate pieces on the page's own line, which is what the
 * approved design asks for and what "follows the container" means here.
 *
 * NO COPY SITS ON A PHOTOGRAPH — the caption is beneath the frame, on the section ground,
 * and it is in the document at all times. The intent line is no longer hidden behind a
 * pointer: it is one short sentence per piece and the design shows all eight.
 *
 * THE BASE STATE IS THE FINAL STATE. With the script blocked, before it runs, and under
 * `prefers-reduced-motion`, there is no mask at all — `.cover-veil` is `display: none`
 * until the motion layer turns it on — and the eight pieces are simply present. See
 * `useMotionLayer`. The frame task merges into the page's one shared loop; every rect it
 * needs is read before a single style is written. See `useScrollFrame`.
 */
export function SelectedWorkCovers({ intro, caseStudies }: SelectedWorkCoversProps) {
  const isMotionOn = useMotionLayer();
  /**
   * THE ONLY SECTION OF THE FOUR THAT KEEPS ITS MOTION ON A PHONE, and it keeps one third
   * of it.
   *
   * The mask survives the move down because it is not a mechanic that needs room: it is a
   * panel of the section's own ground sliding off a frame as that frame comes up the
   * viewport, driven by scroll, which is the one input a touch screen has plenty of. One
   * column is simply eight of them instead of two staggered fours.
   *
   * The other two beats do not survive. Each frame was moving three things at once — the
   * mask, the picture settling from 6% high and 6% large, and the caption lifting 14px out
   * of a 0.25 floor — and eight frames at three properties each is 24 style writes a frame
   * for depth nobody reads on a 390px-wide picture. Above 900 all three still run.
   */
  const isDepthOn = useMotionLayer({ minWidth: motionLayerMinWidth });
  const isDepthOnRef = useRef(isDepthOn);
  isDepthOnRef.current = isDepthOn;
  const gridRef = useRef<HTMLDivElement>(null);
  const coversRef = useRef<ReadonlyArray<CoverParts>>([]);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || !isMotionOn) {
      coversRef.current = [];
      return;
    }
    const parts = Array.from(grid.querySelectorAll<HTMLElement>("[data-cover-window]")).map(
      (element): CoverParts => ({
        frame: element,
        image: element.querySelector<HTMLElement>("[data-cover-image]"),
        veil: element.querySelector<HTMLElement>("[data-cover-veil]"),
        tag: element.parentElement?.querySelector<HTMLElement>("[data-cover-tag]") ?? null,
      }),
    );
    coversRef.current = parts;
    return () => {
      // The motion layer owns exactly these properties and nothing else writes them, so
      // handing them back is what leaves the reduced-motion state genuinely untouched.
      for (const part of parts) {
        if (part.image) part.image.style.transform = "";
        if (part.veil) part.veil.style.transform = "";
        if (part.tag) {
          part.tag.style.transform = "";
          part.tag.style.opacity = "";
        }
      }
      coversRef.current = [];
    };
  }, [isMotionOn, isDepthOn, caseStudies.length]);

  const paint = useCallback(() => {
    const covers = coversRef.current;
    if (covers.length === 0) {
      return;
    }
    const viewport = window.innerHeight;
    const start = viewport * MASK_START;
    const end = viewport * MASK_END;
    // All eight rects first, then all eight writes — a write in the middle would
    // invalidate the layout the next read is about to measure.
    const tops = covers.map((cover) => cover.frame.getBoundingClientRect().top);

    covers.forEach((cover, index) => {
      const top = tops[index];
      if (top === undefined) {
        return;
      }
      const shown = ease(clamp((start - top) / (start - end), 0, 1));
      const hidden = 1 - shown;
      if (cover.veil) {
        cover.veil.style.transform = `translate3d(0,${(shown * MASK_TRAVEL).toFixed(2)}%,0)`;
      }
      if (!isDepthOnRef.current) {
        return;
      }
      if (cover.image) {
        cover.image.style.transform = `translate3d(0,${(hidden * IMAGE_RISE).toFixed(2)}%,0) scale(${(1 + hidden * IMAGE_SETTLE).toFixed(4)})`;
      }
      if (cover.tag) {
        cover.tag.style.opacity = (TAG_FLOOR + shown * (1 - TAG_FLOOR)).toFixed(3);
        cover.tag.style.transform = `translate3d(0,${(hidden * TAG_LIFT).toFixed(2)}px,0)`;
      }
    });
  }, []);

  useScrollFrame(paint, isMotionOn);

  return (
    // LIGHT, and nothing here names a colour: the frame ground, the mask, the numeral and
    // the caption all read the surface they are on, so the section works on either. It
    // stays cream because the sections either side of it are both the alternate navy —
    // making this one dark would put three dark sections in a row and undo the page's
    // alternation.
    <Section ariaLabel={intro.heading} className="imagery-section work-section">
      <Container>
        <p className="imagery-eyebrow label">{intro.eyebrow}</p>
        <h2 className="imagery-display mt-4">{intro.heading}</h2>
        <p className="imagery-lede">{intro.body}</p>
      </Container>

      <div
        className="covers"
        ref={gridRef}
        data-motion={isMotionOn ? "on" : "off"}
        // The picture is only oversized while something is going to move it. Without this
        // a narrow screen would keep the 112%/-6% overscan the settle needs and simply
        // show a permanently cropped photograph.
        data-depth={isDepthOn ? "on" : "off"}
      >
        {caseStudies.map((piece) => (
          <article className="cover" key={piece.slug}>
            <div className="cover-window" data-cover-window>
              <Image
                src={piece.media.src}
                alt={piece.media.alt}
                width={1600}
                height={1200}
                sizes="(min-width: 780px) 44vw, 90vw"
                loading="lazy"
                className="cover-image"
                data-cover-image
              />
              {/* The mask. A solid panel of the section's own ground, and only its
                  transform moves — see `.cover-veil`, which does not exist at all until
                  the motion layer turns it on. */}
              <i className="cover-veil" data-cover-veil aria-hidden="true" />
            </div>
            <div className="cover-tag" data-cover-tag>
              {/* Decorative: the reference is the piece's position in the list, and it is
                  already the first thing the title says. */}
              <span className="cover-numeral" aria-hidden="true">
                {piece.reference}
              </span>
              <div>
                <h3 className="cover-title">{piece.title}</h3>
                <p className="cover-intent">{piece.description}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
