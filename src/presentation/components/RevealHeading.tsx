"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";

/** Delay between one rendered line and the next. */
const LINE_STAGGER_MS = 80;

/**
 * Word boxes on one rendered line no longer share an exact `offsetTop`, because an
 * accented word is set 5% larger and sits on the same baseline from a taller box. Tops
 * are therefore clustered with a tolerance rather than compared for equality. A line
 * step is a whole line-height apart, so 0.45em separates "same line" from "next line"
 * by a wide margin at every display step.
 */
const LINE_TOLERANCE_EM = 0.45;

type HeadingTag = "h1" | "h2" | "h3" | "p";

interface RevealHeadingProps {
  readonly children: string;
  readonly as?: HeadingTag;
  readonly className?: string;
  readonly id?: string;
  /**
   * Phrases inside `children` to set in the display accent face. Each is matched as a
   * contiguous run of whole words; a phrase that is not found leaves the heading
   * unaccented rather than throwing or half-matching. Two entries are needed where the
   * accented words are not adjacent, as in the thesis line.
   */
  readonly accent?: ReadonlyArray<string> | undefined;
  /**
   * Opt-in: how much each word on a line trails the one before it. Off by default, which
   * is the heading behaviour every other caller wants — a heading resolves a LINE at a
   * time, because a line is the unit a reader takes it in.
   *
   * The Differentiator's thesis is the one exception. It is a single centred sentence
   * standing alone on its own ground, read as a sentence rather than as a headline, and
   * the approved design has it assemble word by word. Passing a value here layers the
   * per-word trail on top of the per-line step rather than replacing it, so a sentence
   * that wraps still starts each line after the one above it has begun.
   */
  readonly wordStaggerMs?: number | undefined;
  /**
   * Opt-in: hand the words' appearance to the scroll position instead of to an entry
   * transition. Each word reads `--lit` — 0 for not yet arrived, 1 for fully in — which a
   * caller's frame task writes as the reader travels through the heading, so the sentence
   * assembles under the scroll rather than playing once when it comes into view.
   *
   * The words render at `--lit`'s default of 1 until something writes it, which is what
   * keeps the no-JavaScript and reduced-motion states complete: nothing is hidden waiting
   * for a script that may never run. See `.reveal-word[data-scrub]`.
   */
  readonly scrub?: boolean;
  /**
   * Opt-in: force a line to end before this word, wherever it falls. The value is matched
   * as a whole word and only its FIRST occurrence breaks, so a word that appears twice
   * does not split the heading twice.
   *
   * A `max-width` cannot do this. The Differentiator's thesis turns on a hinge — the claim
   * and then its limit — and the break belongs at the hinge, not wherever the measure runs
   * out: left to itself the line read "AI is our production advantage not / our identity"
   * at every width from 390 to 1920, which puts the join in the middle of the second half.
   * A width tuned to break it correctly at one size breaks it somewhere else at the next.
   */
  readonly breakBefore?: string;
}

/** Index of the first element of `needle` inside `haystack`, or -1. */
function findRun(haystack: ReadonlyArray<string>, needle: ReadonlyArray<string>): number {
  if (needle.length === 0 || needle.length > haystack.length) {
    return -1;
  }
  for (let start = 0; start <= haystack.length - needle.length; start += 1) {
    if (needle.every((word, offset) => haystack[start + offset] === word)) {
      return start;
    }
  }
  return -1;
}

function clusterIntoLines(tops: ReadonlyArray<number>, tolerance: number): ReadonlyArray<number> {
  const anchors: number[] = [];
  for (const top of [...tops].sort((a, b) => a - b)) {
    const existing = anchors.findIndex((anchor) => Math.abs(anchor - top) <= tolerance);
    if (existing === -1) {
      anchors.push(top);
    }
  }
  return tops.map((top) => {
    const index = anchors.findIndex((anchor) => Math.abs(anchor - top) <= tolerance);
    return index === -1 ? 0 : index;
  });
}

/**
 * Reveals a display heading a line at a time: every word is a clipping box, and words
 * that share a rendered line share a delay, so the heading resolves line by line
 * instead of fading in as one block.
 *
 * Which words share a line is a layout fact, not a content one — it changes with the
 * viewport — so it is measured from the DOM after paint and re-measured on resize.
 * Before the first measurement every word reads as line 0, which degrades to a single
 * whole-heading reveal rather than to nothing.
 */
export function RevealHeading({
  children,
  as: Tag = "h2",
  className = "",
  id,
  accent,
  wordStaggerMs,
  scrub = false,
  breakBefore,
}: RevealHeadingProps) {
  const [ref, isInView] = useInView<HTMLHeadingElement>({ threshold: 0.2, once: true });
  const prefersReducedMotion = useReducedMotion();
  const wordRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [lineOfWord, setLineOfWord] = useState<ReadonlyArray<number>>([]);

  const words = children.split(/\s+/).filter((word) => word.length > 0);
  // -1 when nothing was asked for or the word is not in the heading, which leaves the
  // heading wrapping exactly as it did rather than throwing or breaking in the wrong place.
  const breakIndex = breakBefore ? words.indexOf(breakBefore) : -1;
  const accentedIndexes = new Set<number>();
  for (const phrase of accent ?? []) {
    const phraseWords = phrase.split(/\s+/).filter((word) => word.length > 0);
    const start = findRun(words, phraseWords);
    if (start !== -1) {
      for (let offset = 0; offset < phraseWords.length; offset += 1) {
        accentedIndexes.add(start + offset);
      }
    }
  }

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    function measure(): void {
      const element = ref.current;
      if (!element) {
        return;
      }
      const tolerance = parseFloat(getComputedStyle(element).fontSize) * LINE_TOLERANCE_EM;
      const tops = wordRefs.current.map((word) => word?.offsetTop ?? 0);
      setLineOfWord(clusterIntoLines(tops, tolerance));
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, children]);

  return (
    <Tag
      ref={ref}
      id={id}
      className={className}
      style={{
        // Reduced motion resolves the heading immediately rather than fading it in as it
        // enters. The words already hold still under the preference — the clip is dropped
        // in the stylesheet and the per-line delays are dropped above — but the whole
        // heading was still arriving at opacity 0 and resolving on scroll, which is a
        // scroll-triggered change of appearance and exactly what the preference asks a
        // page not to do. Nothing about the default path changes.
        // Scrubbed headings never fade as a block — the words carry the whole arrival, and
        // a block fade on top of them would double the effect and hide the early words.
        opacity: scrub || prefersReducedMotion || isInView ? 1 : 0,
        transitionProperty: "opacity",
        transitionDuration: prefersReducedMotion ? "120ms" : "420ms",
        transitionTimingFunction: "var(--ease-base)",
      }}
    >
      {words.map((word, index) => {
        const isAccented = accentedIndexes.has(index);
        const line = lineOfWord[index] ?? 0;
        // How far into its own line this word sits. Counting from the measured lines rather
        // than from the word index is what keeps the trail restarting on every line instead
        // of running away across a three-line sentence.
        // -1 before the first measurement, when every word still reads as line 0 and the
        // whole heading degrades to a single reveal. Treated as "first on its line".
        const lineStart = wordStaggerMs ? lineOfWord.findIndex((c) => c === line) : 0;
        const placeInLine = lineStart === -1 ? 0 : index - lineStart;
        const delayMs = line * LINE_STAGGER_MS + placeInLine * (wordStaggerMs ?? 0);
        return (
          <span key={`${word}-${index}`}>
            {/* The forced break. A real <br>, so the line ends here at every width and in
                every state — including the one where no script has run. It is not
                announced by a screen reader and the measurement below reads the words'
                offsetTop, which the break moves along with everything else. */}
            {index === breakIndex ? <br /> : null}
            <span
              ref={(element) => {
                wordRefs.current[index] = element;
              }}
              className="reveal-word"
              data-visible={isInView}
              {...(scrub ? { "data-scrub": "true" as const } : {})}
              style={{
                transitionDelay: prefersReducedMotion || scrub ? "0ms" : `${delayMs}ms`,
              }}
            >
              <span className={`reveal-word-inner${isAccented ? " text-display-accent" : ""}`}>
                {word}
              </span>
            </span>
            {index < words.length - 1 ? " " : null}
          </span>
        );
      })}
    </Tag>
  );
}
