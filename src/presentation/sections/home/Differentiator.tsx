"use client";

import { Media } from "../../components/Media";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Container } from "../../components/Container";
import { RevealHeading } from "../../components/RevealHeading";
import { Section } from "../../components/Section";
import { SectionHeader } from "../../components/SectionHeader";
import { useMotionLayer } from "../../hooks/useMotionLayer";
import { motionLayerMinWidth } from "../../../shared/design/tokens";
import { useScrollFrame } from "../../hooks/useScrollFrame";
import type { DifferentiatorBlockView } from "../../lib/viewModels";

interface DifferentiatorProps {
  readonly differentiator: DifferentiatorBlockView;
}

/**
 * The selection is the list's own travel cut into equal bands, one per element — the same
 * shape `useScrollSequence` uses for the process section.
 *
 * The exploration picks the name whose centre is nearest a line at 46% of the viewport,
 * and that line is why this does not. When the section arrives, the list's top is at the
 * top of the screen and a line 46% down it is already past the FIRST name's centre, so the
 * section opened on "Intelligent AI Workflows" and the first element was never the one on
 * the stage. Bands cannot do that: band 0 is the state the section arrives in, and the
 * last band ends exactly as the stage lets go.
 */

/**
 * THE FOUR ELEMENTS — one stage, four frames, and a list that chooses between them.
 *
 * A sticky 4:3 stage on the left holds all four photographs stacked; the four names run
 * down the right as a tall list. Changing the selection cross-fades the picture from 1.06
 * to 1, raises its panel a beat later, and wipes a bar in the incoming tint across the
 * stage — image, then panel, then wipe, in that order, which is what makes the change read
 * as a transition rather than a cut.
 *
 * NO COPY SITS ON A PHOTOGRAPH. Each frame's title and descriptor are on a fully opaque
 * coloured panel — rose, mint, gold, claret, one per element, all four measured against
 * their own text in `check-colours`. A photograph is not a background whose contrast can
 * be measured once and relied on.
 *
 * THE DESCRIPTOR IS NEVER BEHIND A POINTER. All four panels are in the document at all
 * times, so a screen reader gets every element's sentence in order without touching
 * anything. The list on the right is four real buttons: focusing one selects it, so the
 * keyboard reaches every frame, and tapping one does the same where there is no hover to
 * give. Scroll drives the selection when neither is engaged.
 *
 * THE BASE STATE IS THE FINAL STATE. Before the script runs, and under
 * `prefers-reduced-motion`, there is no stage and no list: the four frames are a plain
 * grid with their panels open, which is the whole section with nothing hidden and nothing
 * moving. The motion layer is only ever added on top, scoped to `[data-motion="on"]`.
 * See `useMotionLayer`.
 *
 * This replaces a row of four hover-to-open cards. The row put the four elements side by
 * side as equals, which they are, but at a quarter of the container each the picture was a
 * thumbnail and the sentence was behind a pointer.
 */
/**
 * The thesis lights word by word as the reader travels through it. Progress runs from the
 * sentence's top reaching THIS share of the viewport to it reaching the second — a band
 * either side of the middle, so the words resolve while the line is being looked at rather
 * than before it arrives or after it has gone.
 */
const THESIS_ENTER = 0.95;
const THESIS_SETTLE = 0.3;
/** How many words are part-lit at once. Higher is a softer sweep, lower a sharper edge. */
const THESIS_SPREAD = 3.2;

export function Differentiator({ differentiator }: DifferentiatorProps) {
  /**
   * BELOW 900 THIS SECTION IS FOUR CARDS, not a smaller stage-and-list.
   *
   * The mechanic is a sticky 4:3 stage beside a list tall enough to travel past it, and a
   * phone has neither half: in one column the stage cannot stick against anything, so the
   * scroll bands resolved against a list that had already left the screen and the section
   * arrived showing one photograph and four names with three of the four sentences behind
   * a tap. The base state is the design the brief asks for — every element a card with its
   * picture and its descriptor always visible, stacked — so this stands the layer down and
   * lets it render. The cross-fade and the wipe have nowhere to happen and are replaced by
   * nothing: four cards do not transition between each other, they are all simply there.
   */
  const isMotionOn = useMotionLayer({ minWidth: motionLayerMinWidth });
  const listRef = useRef<HTMLOListElement>(null);
  const sweepRef = useRef<HTMLSpanElement>(null);
  const stageId = useId();
  const thesisWordsRef = useRef<ReadonlyArray<HTMLElement>>([]);
  const thesisNodeRef = useRef<HTMLDivElement | null>(null);

  const countRef = useRef(differentiator.elements.length);
  countRef.current = differentiator.elements.length;
  const [selected, setSelected] = useState(0);
  const selectedRef = useRef(0);
  const pointerIndexRef = useRef<number | null>(null);
  /**
   * THE STICK WINDOW — how far the list travels while the stage is still holding still.
   * The bands are cut from this and nothing else, so the fourth element becomes current
   * exactly as the stage lets go: every change happens against a picture that is standing
   * still, and the section only releases once all four have been seen.
   *
   * Cutting them from the LIST height instead, which is what this did, is why the sequence
   * looked broken. The list is taller than the window, so the stage unpinned around the
   * third element and the fourth arrived over a picture already sliding out of the section.
   *
   * The row height is what makes the window long enough to be worth watching: four rows
   * less the stage and its offset is about 1,150px here, roughly 290px an element.
   *
   * GEOMETRY IS MEASURED HERE AND NOWHERE ELSE; the frame below reads one rect, the list's
   * position in the viewport, which is a scroll reading rather than a layout one.
   */
  const travelRef = useRef(0);

  const select = useCallback((index: number) => {
    selectedRef.current = index;
    setSelected(index);
  }, []);

  // Measure on mount, on resize and whenever the list's own box changes — which is what an
  // image settling into its aspect box does to the row heights beside it.
  useEffect(() => {
    const list = listRef.current;
    if (!list || !isMotionOn) {
      travelRef.current = 0;
      return;
    }
    const track = list.closest(".element-split");
    if (!track) {
      return;
    }

    const stage = track.querySelector<HTMLElement>(".element-stage");

    function measure(): void {
      const node = listRef.current;
      if (!node) {
        return;
      }
      const stageTop = stage ? parseFloat(getComputedStyle(stage).top) || 0 : 0;
      const stageHeight = stage ? stage.offsetHeight : 0;
      travelRef.current = Math.max(1, node.offsetHeight - stageHeight - stageTop);
      // The thesis re-renders its words when the line breaks change, so they are collected
      // here — on mount, on resize and on every reflow the observer sees — rather than in
      // the frame, which must not query the document.
      thesisWordsRef.current = Array.from(
        document.querySelectorAll<HTMLElement>(".element-thesis .reveal-word"),
      );
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [isMotionOn, differentiator.elements.length]);

  const paint = useCallback(() => {
    // THE THESIS, first and independently: it is below the list and still wants to run
    // when the list has nothing to say.
    const thesis = thesisNodeRef.current;
    const words = thesisWordsRef.current;
    if (thesis && words.length > 0) {
      const viewport = window.innerHeight;
      const top = thesis.getBoundingClientRect().top;
      const from = viewport * THESIS_ENTER;
      const to = viewport * THESIS_SETTLE;
      const progress = Math.min(Math.max((from - top) / (from - to), 0), 1);
      const reach = progress * (words.length + THESIS_SPREAD);
      words.forEach((word, index) => {
        const raw = Math.min(Math.max((reach - index) / THESIS_SPREAD, 0), 1);
        // Smoothstep, not the raw ramp. A word's whole arrival — its rise out of the clip,
        // its pitch onto the baseline and its focus — is driven by this one number, and on
        // a linear ramp all three start and stop abruptly at the ends of the band. Eased,
        // each word leaves the floor slowly, crosses quickly and settles, which is what
        // makes eight of them read as a sentence assembling rather than eight sliders
        // being pushed.
        const lit = raw * raw * (3 - 2 * raw);
        word.style.setProperty("--lit", lit.toFixed(3));
      });
    }

    const list = listRef.current;
    if (!list) {
      return;
    }
    // The pointer, or a focused name, owns the selection while it is engaged.
    if (pointerIndexRef.current !== null) {
      return;
    }
    const count = countRef.current;
    if (count === 0) {
      return;
    }
    // The one rect this frame reads, and nothing is written before it.
    const listTop = list.getBoundingClientRect().top;
    const progress = Math.min(Math.max(-listTop / travelRef.current, 0), 1);
    const next = Math.min(count - 1, Math.floor(progress * count));

    if (next !== selectedRef.current) {
      selectedRef.current = next;
      setSelected(next);
    }
  }, []);

  useScrollFrame(paint, isMotionOn);

  /**
   * The wipe. It is the third beat of the change and it only ever plays on a CHANGE — the
   * first selection is the section's resting state and has nothing to transition from, so
   * the previous index is tracked rather than inferred from the render count.
   *
   * Restarting a CSS animation needs the class dropped, the layout flushed and the class
   * put back; `offsetWidth` is the flush. `void` because the value is not wanted.
   */
  const previousRef = useRef<number | null>(null);
  useEffect(() => {
    const sweep = sweepRef.current;
    const previous = previousRef.current;
    previousRef.current = selected;
    if (!sweep || !isMotionOn || previous === null || previous === selected) {
      return;
    }
    sweep.dataset["tint"] = String(selected % differentiator.elements.length);
    sweep.classList.remove("element-sweep--go");
    void sweep.offsetWidth;
    sweep.classList.add("element-sweep--go");
  }, [selected, isMotionOn, differentiator.elements.length]);

  return (
    <Section
      cmsSection="differentiator"
      dark
      ground="alt"
      fade={false}
      ariaLabel={differentiator.heading}
      className="element-section"
    >
      <Container>
        <SectionHeader
          split
          dark
          accent={["creativity,"]}
          heading={differentiator.heading}
          body={differentiator.body}
        />

        <div className="element-split" data-motion={isMotionOn ? "on" : "off"}>
          {/* THE WHOLE LEFT COLUMN STICKS, not just the picture. The lead-in used to sit
              above the split and scroll away with the section heading, so by the second
              element the stage was a photograph held on the screen with nothing left
              saying what it was a photograph OF. It is inside the sticky element now, so
              the sentence that introduces the four is on the screen for as long as the
              four are being read — which is the only time it means anything. */}
          <div className="element-stage">
            {/* Display accent on the dark ground, where the lightened accent measures
                8.395:1. */}
            <p className="element-lead-in">{differentiator.leadIn}</p>

            <div className="element-stage-inner" id={stageId}>
              <div className="element-frames">
                {differentiator.elements.map((element, index) => (
                  <figure
                    key={element.title}
                    className="element-frame"
                    data-tint={index % differentiator.elements.length}
                    data-current={index === selected}
                  >
                    <Media
                      media={element.media}
                      width={1600}
                      height={1200}
                      sizes="(min-width: 900px) 55vw, 100vw"
                      className="element-frame-image"
                    />
                    {/* Fully opaque, one tint per element. The title and the sentence sit
                        on it, never on the picture. */}
                    <figcaption className="element-panel">
                      <h3 className="element-panel-title text-display-s font-medium">
                        {element.title}
                      </h3>
                      <p className="element-panel-say text-small">{element.description}</p>
                    </figcaption>
                  </figure>
                ))}
              </div>
              {/* The wipe. Decorative and inert — it carries no meaning the panel under it
                  does not already carry in words. */}
              <span ref={sweepRef} className="element-sweep" aria-hidden="true" />
            </div>
          </div>

          {/* The names. Buttons rather than list items, because the keyboard and the touch
              screen have no hover to select with and the selection is the only way to a
              frame's panel on the stage. `aria-controls` names the stage the button acts
              on; the panels themselves are in the document either way. */}
          <ol ref={listRef} className="element-names">
            {differentiator.elements.map((element, index) => (
              <li key={element.title} className="element-name" data-name>
                <button
                  type="button"
                  className="element-name-button"
                  data-tint={index % differentiator.elements.length}
                  data-current={index === selected}
                  aria-controls={stageId}
                  {...(index === selected ? { "aria-current": true as const } : {})}
                  onPointerEnter={() => {
                    pointerIndexRef.current = index;
                    select(index);
                  }}
                  onPointerLeave={() => {
                    pointerIndexRef.current = null;
                  }}
                  onFocus={() => {
                    pointerIndexRef.current = index;
                    select(index);
                  }}
                  onBlur={() => {
                    pointerIndexRef.current = null;
                  }}
                  onClick={() => select(index)}
                >
                  <span className="element-name-numeral label" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="element-name-title">{element.title}</span>
                  <span className="element-name-bar" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ol>
        </div>
      </Container>

      {/* THE PAGE'S ONE CENTRED MOMENT — and part of this section, not a section of its
          own. It carries no ground and no rules: on the section's own green it reads as
          the Differentiator's last sentence, which is what it is. What sets it apart is
          the space around it and the fact that it is the only centred thing on the page.
          The sentence's two nouns — `advantage` and `identity` — carry the display accent,
          which on this dark surface resolves to the lightened one at 6.451:1. They are the
          pair the sentence turns on, so colouring both is what makes the contrast legible
          at a glance; two separate entries because they are not adjacent words. */}
      <div ref={thesisNodeRef} className="element-thesis">
        <RevealHeading
          as="p"
          className="element-thesis-line"
          accent={["advantage", "identity"]}
          breakBefore="not"
          scrub={isMotionOn}
        >
          {differentiator.closingStatement}
        </RevealHeading>
      </div>
    </Section>
  );
}
