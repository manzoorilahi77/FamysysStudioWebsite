"use client";

import type { ReactNode } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface MarqueeProps {
  readonly items: ReadonlyArray<{ readonly key: string; readonly content: ReactNode }>;
  readonly ariaLabel: string;
}

/** Infinite horizontal marquee: duplicated track translated -50% for a seamless loop, edge-masked
    to transparent so it fades into whatever the section's own background is. */
export function Marquee({ items, ariaLabel }: MarqueeProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <ul aria-label={ariaLabel} className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
        {items.map((item) => (
          <li key={item.key}>{item.content}</li>
        ))}
      </ul>
    );
  }

  return (
    <div
      role="list"
      aria-label={ariaLabel}
      className="overflow-hidden"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      }}
    >
      <div className="marquee-track flex w-max items-center gap-x-16">
        {[0, 1].map((copy) => (
          <div key={copy} aria-hidden={copy === 1} className="flex items-center gap-x-16">
            {items.map((item) => (
              <div key={item.key} role="listitem">
                {item.content}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
