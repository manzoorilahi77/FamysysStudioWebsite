"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Container } from "../../components/Container";
import { Section } from "../../components/Section";
import { useMotionLayer } from "../../hooks/useMotionLayer";
import { motionLayerMinWidth } from "../../../shared/design/tokens";
import { useScrollFrame } from "../../hooks/useScrollFrame";
import type { ProcessStepDetailView } from "../../lib/viewModels";

interface HowWeWorkFramesProps {
  readonly eyebrow: string;
  readonly heading: string;
  /** The button under a step name, for the screens that cannot hover. Content, not a literal. */
  readonly revealLabel: string;
  readonly steps: ReadonlyArray<ProcessStepDetailView>;
}

/** How far a covered frame settles back, as a fraction of its own size. */
const COVER_LIFT = 0.055;
/** How far a covered frame darkens under the opaque overlay of the one arriving over it. */
const COVER_DIM = 0.62;
/** Percent of its own height the arriving picture rises inside its frame. */
const ENTER_PAN = 7;

interface FrameParts {
  readonly element: HTMLElement;
  readonly image: HTMLElement | null;
  readonly veil: HTMLElement | null;
}

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/**
 * The process as five full-bleed frames, each taking the screen in turn.
 *
 * Every frame is sticky at the top of the viewport inside a track five screens tall, so
 * the next one climbs over the one before it rather than scrolling past it. The covered
 * frame settles back 5.5% and darkens under an opaque overlay; the arriving picture rises
 * 7% inside its own frame. NOTHING INTERCEPTS SCROLLING — the page moves at exactly the
 * rate the reader asks for, and what reads as a hand-over is five elements staying put.
 *
 * NO COPY SITS ON A PHOTOGRAPH. The numeral and the step name are inside a fully opaque
 * plate at the TOP of the frame, not the foot: the next frame climbs from below, and a
 * caption at the bottom would be the first thing it covered. The step's sentence is a
 * second opaque plate that rises out of the first — never text laid over an image, whose
 * contrast cannot be measured once and relied on.
 *
 * The sentence answers a pointer; the button under it answers the keyboard and the touch
 * screen, which have no hover to give. Under `prefers-reduced-motion`, and before the
 * script runs at all, there is no sticky, no pan and no hidden sentence: the five steps
 * are simply five pictures with their copy beneath them. See `useMotionLayer`.
 */
export function HowWeWorkFrames({ eyebrow, heading, revealLabel, steps }: HowWeWorkFramesProps) {
  /**
   * BELOW 900 THE FIVE FRAMES ARE FIVE PICTURES WITH THEIR COPY UNDER THEM.
   *
   * The sticky sequence costs five viewports of scroll to advance five sentences, which is
   * 4,220px on a 390x844 phone and rather worse on a 667 one, and every one of those
   * sentences is behind a hover with an 11px button under it as the touch alternative. The
   * base state is the same five steps, each sentence already open, in about a third of the
   * travel. Fewer sticky states was one option; none is the honest one at this width.
   */
  const isMotionOn = useMotionLayer({ minWidth: motionLayerMinWidth });
  const trackRef = useRef<HTMLOListElement>(null);
  const framesRef = useRef<ReadonlyArray<FrameParts>>([]);
  const [openSteps, setOpenSteps] = useState<ReadonlySet<number>>(() => new Set());

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !isMotionOn) {
      framesRef.current = [];
      return;
    }
    const parts = Array.from(track.querySelectorAll<HTMLElement>("[data-frame]")).map(
      (element): FrameParts => ({
        element,
        image: element.querySelector<HTMLElement>("[data-frame-image]"),
        veil: element.querySelector<HTMLElement>("[data-frame-veil]"),
      }),
    );
    framesRef.current = parts;
    return () => {
      // The motion layer owns these three properties and nothing else writes them, so
      // handing them back is what leaves the reduced-motion state genuinely untouched.
      for (const part of parts) {
        part.element.style.transform = "";
        if (part.image) part.image.style.transform = "";
        if (part.veil) part.veil.style.opacity = "";
      }
      framesRef.current = [];
    };
  }, [isMotionOn, steps.length]);

  const paint = useCallback(() => {
    const frames = framesRef.current;
    if (frames.length === 0) {
      return;
    }
    const viewport = window.innerHeight;
    // Every rect this frame needs, read before a single style is written — a write in the
    // middle would invalidate the layout the next read is about to measure.
    const tops = frames.map((frame) => frame.element.getBoundingClientRect().top);

    frames.forEach((frame, index) => {
      // A frame is sticky, so its own top pins at 0; how far the NEXT frame has climbed
      // over it is what says how far back this one should sit.
      const nextTop = index + 1 < frames.length ? (tops[index + 1] ?? viewport) : viewport;
      const covered = clamp((viewport - nextTop) / viewport, 0, 1);
      const arriving = clamp((viewport - (tops[index] ?? viewport)) / viewport, 0, 1);

      frame.element.style.transform = `scale(${(1 - COVER_LIFT * covered).toFixed(4)})`;
      if (frame.veil) {
        frame.veil.style.opacity = (COVER_DIM * covered).toFixed(3);
      }
      if (frame.image) {
        frame.image.style.transform = `translate3d(0,${((1 - arriving) * ENTER_PAN).toFixed(2)}%,0)`;
      }
    });
  }, []);

  useScrollFrame(paint, isMotionOn);

  function toggleStep(index: number): void {
    setOpenSteps((current) => {
      const next = new Set(current);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  return (
    // LIGHT, where this was dark. The Differentiator above it has to be dark — its four
    // coloured panels and its stage are built on a dark ground — so with this one dark too
    // the page ran 8,000px of unbroken green through its middle, a third of the homepage in
    // one beat. Moving this one is the single change that fixes the whole run: the darks
    // now fall on the hero, the Differentiator, Selected Work and the closing CTA, spaced
    // by cream, and no two neighbouring sections share a ground. Nothing here names a
    // colour — every plate, numeral and sentence reads the surface it is on.
    <Section ariaLabel={heading} className="imagery-section">
      <Container>
        <p className="imagery-eyebrow label">{eyebrow}</p>
        <h2 className="imagery-display mt-4">{heading}</h2>
      </Container>

      <ol className="frames" ref={trackRef} data-motion={isMotionOn ? "on" : "off"}>
        {steps.map((step, index) => {
          const sentenceId = `process-frame-${step.slug}`;
          const isOpen = openSteps.has(index);
          return (
            <li className="frame-step" key={step.slug} data-frame data-open={isOpen}>
              <div className="frame-shot">
                <Image
                  src={step.media.src}
                  alt={step.media.alt}
                  width={1920}
                  height={1200}
                  sizes="100vw"
                  loading="lazy"
                  className="frame-image"
                  data-frame-image
                />
              </div>
              {/* Fully opaque, and only its opacity moves: this is what darkens a frame
                  under the one arriving over it. */}
              <div className="frame-veil" data-frame-veil aria-hidden="true" />
              <div className="frame-caption">
                {/* The ordinal is carried by the list, so the digits are decorative —
                    same treatment as every other numeral on the site. */}
                <span className="frame-numeral" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="frame-name">{step.title}</h3>
                  <p className="frame-say" id={sentenceId}>
                    {step.description}
                  </p>
                  <button
                    type="button"
                    className="frame-more label"
                    aria-expanded={isOpen}
                    aria-controls={sentenceId}
                    onClick={() => toggleStep(index)}
                  >
                    {revealLabel}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
