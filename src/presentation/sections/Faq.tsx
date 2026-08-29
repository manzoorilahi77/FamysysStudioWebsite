"use client";

import Link from "next/link";
import { useState } from "react";
import type { FaqBlockView, FaqItemView } from "../lib/viewModels";
import { Container } from "../components/Container";
import { Section } from "../components/Section";

interface FaqProps {
  readonly faq: FaqBlockView;
}

interface FaqRowProps {
  readonly item: FaqItemView;
  readonly index: number;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
}

function FaqRow({ item, index, isOpen, onToggle }: FaqRowProps) {
  const triggerId = `faq-trigger-${index}`;
  const panelId = `faq-panel-${index}`;

  return (
    <div className="border-b border-ink-8">
      <h3>
        <button
          id={triggerId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="faq-trigger flex w-full items-center justify-between gap-6 py-6 text-left"
        >
          <span className="text-display-s font-medium text-ink">{item.question}</span>
          <svg
            className="faq-chevron shrink-0 text-ink-70"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
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
          <p className="text-body pb-6 text-ink-70" style={{ maxWidth: "72ch" }}>
            {item.answer}
          </p>
          {item.ctaHref && item.ctaLabel ? (
            <p className="pb-6">
              <Link href={item.ctaHref} className="text-small font-medium text-accent">
                {item.ctaLabel} &rarr;
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function Faq({ faq }: FaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <Section ariaLabel="Frequently asked questions">
      <Container>
        {/* TODO(client): the brief supplies no heading for the FAQ section — the
            accessible name above is a placeholder until the client provides one.
            See docs/content-todo.md. */}
        <div className="mx-auto max-w-[72ch]">
          {faq.items.map((item, index) => (
            <FaqRow
              key={item.question}
              item={item}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex((current) => (current === index ? null : index))}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}
