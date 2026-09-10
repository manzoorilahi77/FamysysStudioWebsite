"use client";

import { motion } from "../../../shared/design/tokens";
import { AboutFrame } from "../../components/AboutFrame";
import { Container } from "../../components/Container";
import { DrawnRule } from "../../components/DrawnRule";
import { Section } from "../../components/Section";
import { SectionHeader } from "../../components/SectionHeader";
import { useInView } from "../../hooks/useInView";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import type { EcosystemBlockView } from "../../lib/viewModels";

interface PartOfFamysysProps {
  readonly ecosystem: EcosystemBlockView;
}

/**
 * The relationship to the parent, and nothing more — but with weight now. It was a
 * heading, three paragraphs and a link, and read as a footnote to the page.
 *
 * THE ONE SECTION THAT BREAKS THE CONTAINER. The image runs from the viewport's left
 * edge to the middle of the page while the copy stays on the container line: the studio
 * sits inside something larger than itself, and the layout says so. The bleed is a
 * negative margin sized from the same inset the container is built from, and the
 * section clips horizontally so the sub-pixel overhang from `100vw` never becomes a
 * scrollbar.
 *
 * The photograph is of production, not premises. There is no office to show and none is
 * implied; a picture of a building here would be the borrowed credibility the copy is
 * written to avoid. The fourth paragraph says so in visible words rather than leaving it
 * as a discipline someone has to remember.
 *
 * The link leaves the site, so it carries `target="_blank"`, `rel="noopener noreferrer"`
 * and an announced "(opens in a new tab)".
 */
export function PartOfFamysys({ ecosystem }: PartOfFamysysProps) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.15, once: true });
  const prefersReducedMotion = useReducedMotion();
  const hasArrived = prefersReducedMotion || isInView;

  const enterStyle = (order: number) => ({
    opacity: hasArrived ? 1 : 0,
    transform: hasArrived || prefersReducedMotion ? "translateY(0)" : "translateY(24px)",
    transitionProperty: "opacity, transform",
    transitionDuration: prefersReducedMotion
      ? `${motion.duration.reduced}ms`
      : `${motion.duration.base}ms`,
    transitionDelay: prefersReducedMotion ? "0ms" : `${order * 60}ms`,
    transitionTimingFunction: "var(--ease-base)",
  });

  return (
    <Section cmsSection="ecosystem" ariaLabel={ecosystem.heading} className="about-bleed-host">
      <Container>
        <div ref={ref} className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-6">
          <div className="about-bleed-left lg:col-span-6" style={enterStyle(0)}>
            <AboutFrame
              media={ecosystem.media}
              hasArrived={hasArrived}
              sizes="(min-width: 1024px) 56vw, 100vw"
              className="about-frame--bleed"
            />
          </div>

          <div className="lg:col-span-5 lg:col-start-8">
            <div style={enterStyle(1)}>
              <SectionHeader eyebrow={ecosystem.eyebrow} heading={ecosystem.heading} className="" />
            </div>
            {ecosystem.paragraphs.map((paragraph, index) => (
              <div key={paragraph} style={enterStyle(index + 2)}>
                <p
                  className={`text-body ${index === 0 ? "mt-8 text-ink" : "mt-5 text-ink-70"}`}
                  style={{ maxWidth: "52ch" }}
                >
                  {paragraph}
                </p>
              </div>
            ))}
            <div style={enterStyle(ecosystem.paragraphs.length + 2)}>
              <DrawnRule
                className="mt-8"
                isVisible={hasArrived}
                delayMs={motion.duration.base + ecosystem.paragraphs.length * 60}
              />
              <a
                href={ecosystem.link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-link text-small mt-6 inline-block font-medium text-accent"
              >
                {ecosystem.link.label}
                <span aria-hidden="true"> &#8599;</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
