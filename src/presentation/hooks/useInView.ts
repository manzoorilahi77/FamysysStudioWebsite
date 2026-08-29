"use client";

import { useEffect, useRef, useState } from "react";

export interface UseInViewOptions {
  readonly threshold?: number;
  readonly once?: boolean;
}

/** Tracks intersection visibility for scroll-triggered reveals, counters, and stagger effects. */
export function useInView<T extends Element>({
  threshold = 0.15,
  once = true,
}: UseInViewOptions = {}): readonly [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);

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

  return [ref, isInView] as const;
}
