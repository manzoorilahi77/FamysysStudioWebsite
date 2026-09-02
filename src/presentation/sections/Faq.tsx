"use client";

import Link from "next/link";
import { useState } from "react";
import type { FaqBlockView, FaqItemView } from "../lib/viewModels";
import { motion } from "../../shared/design/tokens";
import { Container } from "../components/Container";
import { Eyebrow } from "../components/Eyebrow";
import { RevealHeading } from "../components/RevealHeading";
import { Section } from "../components/Section";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";

/** Rows arrive top to bottom. The step is the site's standard list step. */
const ROW_STEP_MS = 60;
/** The answer text follows its own panel's height rather than arriving with it. */
const ANSWER_DELAY_MS = 60;

interface FaqProps {
  readonly faq: FaqBlockView;
  /**
   * Defaults reproduce the homepage's deliberately conspicuous placeholder. An inner page
   * that has a heading passes one; it does not inherit the homepage's unfilled gap.
   */
  readonly eyebrow?: string;
  readonly heading?: string;
  readonly ariaLabel?: string;
}

interface FaqRowProps {
  readonly item: FaqItemView;
  readonly index: number;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
  readonly ruleDelayMs: number;
  readonly textDelayMs: number;
  readonly hasArrived: boolean;
  readonly prefersReducedMotion: boolean;
}

function FaqRow({
  item,
  index,
  isOpen,
  onToggle,
  ruleDelayMs,
  textDelayMs,
  hasArrived,
  prefersReducedMotion,
}: FaqRowProps) {
  const triggerId = `faq-trigger-${index}`;
  const panelId = `faq-panel-${index}`;

  return (
    <div className="faq-row" data-open={isOpen}>
      {/* The hairline is an element, not a border, because it DRAWS — a scaleX from the
          left, one row at a time, with the question arriving a fast step behind its own
          rule. It is also what marks the open row: the rule above an expanded question
          goes accent, which is a second signal on top of the chevron and the height. */}
      <span
        className="faq-rule"
        aria-hidden="true"
        style={{ transitionDelay: `${ruleDelayMs}ms` }}
      />
      <h3>
        <button
          id={triggerId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="faq-trigger"
          data-visible={hasArrived}
          style={{ transitionDelay: `${textDelayMs}ms` }}
        >
          <span className="faq-question text-display-s font-semibold">{item.question}</span>
          {/* A square that turns into an accent diamond when its row opens. It replaces a
              rotating chevron, which said "there is more below" — true of an accordion in
              general and useless for telling one row from another at a glance down the
              column. The state is carried three ways over and above this: the panel's
              height, the rule above it going accent, and `aria-expanded` on the trigger.
              The mark itself changes SHAPE as well as colour, so it is not colour alone
              even read on its own. */}
          <span className="faq-marker" aria-hidden="true" />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        data-open={isOpen}
        // Collapsed rows keep zero height but stay in the DOM for the height
        // transition; `inert` is what actually takes their content — including
        // the one answer that carries a link — out of the tab order.
        inert={!isOpen}
        className="faq-panel"
      >
        <div className="faq-panel-inner">
          {/* The copy fades a step BEHIND the height it is inside, so the row opens and
              then fills rather than the text sliding down with the box. Zero on the way
              closed: a delay on the exit leaves the answer legible over a box that has
              already collapsed. */}
          <div
            className="faq-answer"
            style={{
              transitionDelay: isOpen && !prefersReducedMotion ? `${ANSWER_DELAY_MS}ms` : "0ms",
            }}
          >
            <p className="text-body pb-6 text-ink-70" style={{ maxWidth: "72ch" }}>
              {item.answer}
            </p>
            {item.ctaHref && item.ctaLabel ? (
              <p className="pb-6">
                <Link
                  href={item.ctaHref}
                  className="inline-link text-small font-medium text-accent"
                >
                  {item.ctaLabel} &rarr;
                </Link>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Seven questions on drawn hairlines. The disclosure mechanics are unchanged and
 * deliberately so — `aria-expanded` on the trigger, `aria-controls` pointing at a region
 * that really exists, and `inert` on every collapsed answer so its content, including the
 * one that carries a link, leaves the tab order. Two accordions in this project have
 * shipped with that broken; it is asserted rather than assumed.
 *
 * What changed is everything around it. The rows now carry the same hover vocabulary as
 * the capability rows on /selected-work and the panel rows in the header — a sweep from
 * the left in ink-04, the question shifting right — and they enter the same way, each
 * hairline drawing before its own question fades in. The open row's hairline goes accent.
 *
 * The sweep is on the CLOSED state only. A row that is already open has answered; putting
 * a hover state on it as well would say a second time what the expanded panel underneath
 * it is already saying.
 */
export function Faq({
  faq,
  eyebrow = "Questions",
  heading = "The questions that come up first.",
  ariaLabel = "Frequently asked questions",
}: FaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.15, once: true });
  const prefersReducedMotion = useReducedMotion();
  const hasArrived = prefersReducedMotion || isInView;

  const ruleDelay = (index: number): number => (prefersReducedMotion ? 0 : index * ROW_STEP_MS);
  const textDelay = (index: number): number =>
    prefersReducedMotion ? 0 : ruleDelay(index) + motion.duration.fast;

  return (
    <Section ariaLabel={ariaLabel}>
      <Container>
        {/* Two columns from lg: the header on the left STAYS while the questions travel
            past it, and both leave together when the last answer does. The mechanic is one
            `position: sticky` on the aside — see `.faq-aside` — bounded by the grid, which
            is what makes it release at the end of the section rather than at the end of the
            page. Below lg it is a stack and the aside is not sticky: a heading pinned above
            a list on a phone eats a third of the viewport for the whole section. */}
        <div className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-10">
          {/* TODO(client): expanded copy — draft, pending approval (the heading only).
            The brief supplies seven Q&As and no heading for the section that holds them,
            and this used to render the literal string `TODO(client)` at display size so
            the gap could not ship unnoticed. It shipped anyway, into review, which is the
            answer to whether a conspicuous placeholder is a good way to hold a gap open.

            The two inner pages that DO have an FAQ heading name their own page — "Questions
            about these services." and "Questions about the process.", both also drafted. The
            homepage deliberately does not make that a third: one site running three
            variations on "Questions about X" reads as a template, and the homepage is the
            one that has to sound written. The shared "Questions" eyebrow is what keeps them
            a family. Logged in docs/content-todo.md alongside its two siblings. */}
          {/* Composed here rather than through `SectionHeader`, which every other section
              opens with. Two things differ and both are structural, not cosmetic: the
              eyebrow carries an accent square, and the heading takes display-m instead of
              display-l because it lives in a five-track column where display-l breaks a
              seven-word line into four. Threading two props through a shared component for
              one caller would have bought less than it cost. */}
          <div className="faq-aside lg:col-span-5">
            <Eyebrow className="faq-eyebrow">{eyebrow}</Eyebrow>
            <RevealHeading className="text-display-m mt-5 font-semibold text-ink">
              {heading}
            </RevealHeading>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <div ref={ref} className="faq-list" data-drawn={hasArrived}>
              {faq.items.map((item, index) => (
                <FaqRow
                  key={item.question}
                  item={item}
                  index={index}
                  isOpen={openIndex === index}
                  onToggle={() => setOpenIndex((current) => (current === index ? null : index))}
                  ruleDelayMs={ruleDelay(index)}
                  textDelayMs={textDelay(index)}
                  hasArrived={hasArrived}
                  prefersReducedMotion={prefersReducedMotion}
                />
              ))}
              {/* The rule that closes the list, drawn last. A sibling of the rows rather than
              an eighth one, so it carries no disclosure a reader could try to open. */}
              <span
                className="faq-rule"
                aria-hidden="true"
                style={{ transitionDelay: `${ruleDelay(faq.items.length)}ms` }}
              />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
