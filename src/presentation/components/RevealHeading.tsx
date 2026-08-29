"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";

/** Delay between one rendered line and the next. */
const LINE_STAGGER_MS = 80;

type HeadingTag = "h1" | "h2" | "h3" | "p";

interface RevealHeadingProps {
  readonly children: string;
  readonly as?: HeadingTag;
  readonly className?: string;
  readonly id?: string;
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
export function RevealHeading({ children, as: Tag = "h2", className = "", id }: RevealHeadingProps) {
  const [ref, isInView] = useInView<HTMLHeadingElement>({ threshold: 0.2, once: true });
  const prefersReducedMotion = useReducedMotion();
  const wordRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [lineOfWord, setLineOfWord] = useState<ReadonlyArray<number>>([]);

  const words = children.split(/\s+/).filter((word) => word.length > 0);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    function measure(): void {
      const tops = wordRefs.current.map((element) => element?.offsetTop ?? 0);
      const distinctTops = [...new Set(tops)].sort((a, b) => a - b);
      setLineOfWord(tops.map((top) => distinctTops.indexOf(top)));
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
        opacity: isInView ? 1 : 0,
        transitionProperty: "opacity",
        transitionDuration: prefersReducedMotion ? "120ms" : "420ms",
        transitionTimingFunction: "var(--ease-base)",
      }}
    >
      {words.map((word, index) => (
        <span key={`${word}-${index}`}>
          <span
            ref={(element) => {
              wordRefs.current[index] = element;
            }}
            className="reveal-word"
            data-visible={isInView}
            style={{
              transitionDelay: prefersReducedMotion
                ? "0ms"
                : `${(lineOfWord[index] ?? 0) * LINE_STAGGER_MS}ms`,
            }}
          >
            <span className="reveal-word-inner">{word}</span>
          </span>
          {index < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
