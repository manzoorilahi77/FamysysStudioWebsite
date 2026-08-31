"use client";

import { motion } from "../../shared/design/tokens";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface DeliverableListProps {
  readonly label: string;
  readonly items: ReadonlyArray<string>;
  readonly dark?: boolean;
  /** Owned by the caller so two of these can sit in one grid without doubled spacing. */
  readonly className?: string;
}

/**
 * A labelled list whose rows arrive one after another: "What's included" on Creative
 * Services, "What we need from you" and "What you get" on How We Work. One observer for
 * the list rather than one per row — the rows are a few lines apart, so per-row observers
 * would fire almost simultaneously anyway and the stagger would collapse. Firing them all
 * from the list's own entry keeps the order.
 */
export function DeliverableList({
  label,
  items,
  dark = false,
  className = "mt-8",
}: DeliverableListProps) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.2, once: true });
  const prefersReducedMotion = useReducedMotion();
  const hasArrived = prefersReducedMotion || isInView;

  return (
    <div ref={ref} className={className}>
      <p className={`label ${dark ? "text-canvas-80" : "text-ink-70"}`}>{label}</p>
      <ul className="mt-4 space-y-3">
        {items.map((item, index) => (
          <li
            key={item}
            className={`deliverable-row text-body ${dark ? "text-canvas-80" : "text-ink-90"}`}
            data-visible={hasArrived}
            style={{
              transitionDelay: prefersReducedMotion
                ? "0ms"
                : `${index * motion.stagger.listStepMs}ms`,
            }}
          >
            {/* Decorative: the list already announces its own item count and order, so a
                screen reader reading a bullet glyph before every line adds nothing. */}
            <span className="deliverable-marker" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
