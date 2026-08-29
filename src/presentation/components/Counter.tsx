"use client";

import type { MetricStat } from "../../domain/social-proof/entities/MetricStat";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";

const DIGITS = "0123456789".split("");

interface DigitColumnProps {
  readonly digit: string;
  readonly isRolling: boolean;
}

function DigitColumn({ digit, isRolling }: DigitColumnProps) {
  const targetIndex = Number(digit);
  return (
    <span
      className="tabular inline-block overflow-hidden align-bottom"
      style={{ height: "1em", width: "1ch" }}
    >
      <span
        className="transition-base flex flex-col"
        style={{
          transform: `translateY(${isRolling ? -targetIndex : 0}em)`,
          transitionDuration: "600ms",
        }}
      >
        {DIGITS.map((value) => (
          <span key={value} style={{ height: "1em", lineHeight: 1 }}>
            {value}
          </span>
        ))}
      </span>
    </span>
  );
}

interface CounterProps {
  readonly stat: MetricStat;
}

/** Odometer-style digit-column roll. Fires once at 40% visibility; renders the final value immediately under reduced motion. */
export function Counter({ stat }: CounterProps) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.4, once: true });
  const prefersReducedMotion = useReducedMotion();
  const digits = String(stat.value).split("");
  const shouldRoll = isInView || prefersReducedMotion;

  return (
    <div ref={ref}>
      <p className="text-metric font-medium text-ink">
        {digits.map((digit, index) => (
          <DigitColumn key={index} digit={digit} isRolling={shouldRoll} />
        ))}
        {stat.suffix ? <span className="text-display-m align-baseline">{stat.suffix}</span> : null}
      </p>
      <p className="text-small mt-2 text-ink-70">{stat.label}</p>
    </div>
  );
}
