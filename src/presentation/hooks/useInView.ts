"use client";

import { useEffect, useRef, useState } from "react";

export interface UseInViewOptions {
  readonly threshold?: number;
  readonly once?: boolean;
}

/**
 * Tracks intersection visibility for scroll-triggered reveals, counters, and stagger
 * effects.
 *
 * REPORTS `true` UNTIL THE CLIENT HAS MOUNTED, and that is the important part of the
 * contract rather than a detail of it.
 *
 * Every caller uses this to decide whether its content is visible — an opacity, a
 * transform, a clip. Starting at `false` meant the server rendered the whole site in its
 * HIDDEN state and nothing was ever revealed unless the client bundle ran. Any condition
 * that stopped it running — a stale .next, a chunk that 404s, a blocked or failed script,
 * an extension, JS switched off — left every display heading on the site invisible while
 * body copy, links, buttons, form fields and the footer rendered normally, because those
 * do not go through a reveal. Measured on the homepage with scripting disabled: 9 of 16
 * headings hidden, and only 12 of 102 paragraphs.
 *
 * So the hidden state is now something the client opts INTO once it is demonstrably
 * running. `hasMounted` is false during server render and during the first client render,
 * which is what keeps hydration byte-identical; the effect below flips it immediately
 * after, and from then on the observer's answer is the real one. Content above the fold
 * is reported in view again on the observer's first callback, so the reveal still plays.
 * Content below the fold is off screen while this settles, so nobody sees it resolve.
 *
 * The reveal is decoration. Decoration must not be the thing that decides whether words
 * exist.
 */
export function useInView<T extends Element>({
  threshold = 0.15,
  once = true,
}: UseInViewOptions = {}): readonly [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) {
          return;
        }
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsInView(false);
        }
      },
      { threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, once]);

  return [ref, hasMounted ? isInView : true] as const;
}
