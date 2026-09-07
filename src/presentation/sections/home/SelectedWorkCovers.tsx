"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import type { SectionIntro } from "../../../domain/marketing/entities/SectionIntro";
import { Container } from "../../components/Container";
import { Section } from "../../components/Section";
import { useMotionLayer } from "../../hooks/useMotionLayer";
import { useScrollFrame } from "../../hooks/useScrollFrame";
import type { CaseStudyView } from "../../lib/viewModels";

interface SelectedWorkCoversProps {
  readonly intro: SectionIntro;
  readonly caseStudies: ReadonlyArray<CaseStudyView>;
}

/** Percent of travel a cover makes inside the window it is taller than. */
const PAN = 9;

interface CoverParts {
  readonly window: HTMLElement;
  readonly image: HTMLElement | null;
  /** 1 for the left column, -1 for the right, so the two columns move against each other. */
  readonly direction: number;
}

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/**
 * Eight covers at full width, two to a row, with no gutter between them.
 *
 * Each cover sits in a window it is 24% taller than, and the picture moves inside that
 * window as the page scrolls — the left column downward, the right column upward. Two
 * columns travelling against each other is what makes a grid of eight photographs read as
 * one moving surface rather than as a catalogue.
 *
 * The reference and the title are a small opaque plate below the picture, never over it.
 * The intent line waits for a hover WHERE THERE IS A POINTER TO HOVER WITH, and is simply
 * present everywhere else — on a touch screen, under `prefers-reduced-motion`, and before
 * the script runs. A cover has no button of its own the way a process frame does, and
 * eight focusable articles carrying no action would be eight tab stops that go nowhere; so
 * the reveal is scoped to fine pointers instead, and the line is on the page for everyone
 * who cannot summon it. See `.cover-intent` in globals.css.
 */
export function SelectedWorkCovers({ intro, caseStudies }: SelectedWorkCoversProps) {
  const isMotionOn = useMotionLayer();
  const gridRef = useRef<HTMLDivElement>(null);
  const coversRef = useRef<ReadonlyArray<CoverParts>>([]);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || !isMotionOn) {
      coversRef.current = [];
      return;
    }
    const parts = Array.from(grid.querySelectorAll<HTMLElement>("[data-cover-window]")).map(
      (element, index): CoverParts => ({
        window: element,
        image: element.querySelector<HTMLElement>("[data-cover-image]"),
        direction: index % 2 === 0 ? 1 : -1,
      }),
    );
    coversRef.current = parts;
    return () => {
      for (const part of parts) {
        if (part.image) part.image.style.transform = "";
      }
      coversRef.current = [];
    };
  }, [isMotionOn, caseStudies.length]);

  const paint = useCallback(() => {
    const covers = coversRef.current;
    if (covers.length === 0) {
      return;
    }
    const viewport = window.innerHeight;
    // All eight rects first, then all eight writes. See `useScrollFrame`.
    const rects = covers.map((cover) => cover.window.getBoundingClientRect());

    covers.forEach((cover, index) => {
      const rect = rects[index];
      if (!rect || rect.bottom < 0 || rect.top > viewport || !cover.image) {
        return;
      }
      // Where the window's own centre sits in the viewport: 1 at the bottom edge, -1 at
      // the top.
      const centre = (rect.top + rect.height / 2 - viewport / 2) / (viewport / 2);
      const travel = clamp(centre, -1, 1) * PAN * cover.direction;
      cover.image.style.transform = `translate3d(0,${travel.toFixed(2)}%,0)`;
    });
  }, []);

  useScrollFrame(paint, isMotionOn);

  return (
    <Section dark fade={false} ariaLabel={intro.heading} className="imagery-section work-section">
      <Container>
        <p className="imagery-eyebrow label">{intro.eyebrow}</p>
        <h2 className="imagery-display mt-4">{intro.heading}</h2>
        <p className="imagery-lede">{intro.body}</p>
      </Container>

      <div className="covers" ref={gridRef} data-motion={isMotionOn ? "on" : "off"}>
        {caseStudies.map((piece) => (
          <article className="cover" key={piece.slug}>
            <div className="cover-window" data-cover-window>
              <Image
                src={piece.media.src}
                alt={piece.media.alt}
                width={1600}
                height={1200}
                sizes="(min-width: 780px) 50vw, 100vw"
                loading="lazy"
                className="cover-image"
                data-cover-image
              />
            </div>
            <div className="cover-tag">
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
