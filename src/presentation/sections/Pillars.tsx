"use client";

import { useEffect, useState } from "react";
import type { SectionIntro } from "../../domain/marketing/entities/SectionIntro";
import type { ValuePillar } from "../../domain/marketing/entities/ValuePillar";
import { Container } from "../components/Container";
import { Eyebrow } from "../components/Eyebrow";
import { Section } from "../components/Section";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";

const DESKTOP_QUERY = "(min-width: 1024px)";

interface PillarCardProps {
  readonly pillar: ValuePillar;
  readonly index: number;
  readonly animateOnEnter: boolean;
}

function PillarCard({ pillar, index, animateOnEnter }: PillarCardProps) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.4, once: true });
  const isActive = !animateOnEnter || isInView;

  return (
    <div
      ref={ref}
      className="rounded-sm border border-ink-8 p-8"
      style={{
        opacity: isActive ? 1 : 0,
        transform: animateOnEnter && !isActive ? "scale(0.92)" : "scale(1)",
        transitionProperty: "opacity, transform",
        transitionDuration: "320ms",
        transitionTimingFunction: "var(--ease-base)",
        transitionDelay: `${index * 60}ms`,
      }}
    >
      <p className="text-display-s font-medium text-ink">{pillar.title}</p>
      <p className="text-body mt-3 text-ink-70">{pillar.description}</p>
    </div>
  );
}

interface PillarsProps {
  readonly intro: SectionIntro;
  readonly pillars: ReadonlyArray<ValuePillar>;
}

export function Pillars({ intro, pillars }: PillarsProps) {
  const [isDesktop, setIsDesktop] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_QUERY);
    setIsDesktop(mediaQuery.matches);
    const handleChange = (event: MediaQueryListEvent): void => setIsDesktop(event.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const animateOnEnter = isDesktop && !prefersReducedMotion;

  return (
    <Section ariaLabel="How we're built">
      <Container className="pillars-grid">
        <div className="lg:sticky" style={{ top: "6rem", alignSelf: "start" }}>
          <Eyebrow>{intro.eyebrow}</Eyebrow>
          <h2 className="text-display-l mt-4 font-medium text-ink">{intro.heading}</h2>
        </div>
        <div className="flex flex-col gap-6">
          {pillars.map((pillar, index) => (
            <PillarCard key={pillar.title} pillar={pillar} index={index} animateOnEnter={animateOnEnter} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
