"use client";

import { useState } from "react";
import type { ServiceCategory } from "../../domain/services/entities/ServiceCategory";
import type { SectionIntro } from "../../domain/marketing/entities/SectionIntro";
import { Container } from "../components/Container";
import { Eyebrow } from "../components/Eyebrow";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";

interface ServicesGridProps {
  readonly intro: SectionIntro;
  readonly categories: ReadonlyArray<ServiceCategory>;
}

const ALL_FILTER = "All";

export function ServicesGrid({ intro, categories }: ServicesGridProps) {
  const [activeFilter, setActiveFilter] = useState(ALL_FILTER);

  const numberedOfferings = categories.flatMap((category) =>
    category.offerings.map((offering) => ({ ...offering, category: category.title })),
  );
  const visibleOfferings = numberedOfferings.filter(
    (offering) => activeFilter === ALL_FILTER || offering.category === activeFilter,
  );

  return (
    <Section ariaLabel={intro.heading}>
      <Container>
        <Eyebrow>{intro.eyebrow}</Eyebrow>
        <h2 className="text-display-l mt-4 font-medium text-ink">{intro.heading}</h2>

        <div className="mt-8 flex flex-wrap gap-3" role="group" aria-label="Filter services by category">
          {[ALL_FILTER, ...categories.map((category) => category.title)].map((filter) => (
            <button
              key={filter}
              type="button"
              aria-pressed={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
              className="transition-base rounded-sm border px-4 py-2 text-small font-medium"
              style={{
                borderColor: activeFilter === filter ? "var(--color-accent)" : "var(--color-ink-20)",
                color: "var(--color-ink)",
              }}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleOfferings.map((offering, index) => {
            const globalIndex = numberedOfferings.indexOf(offering);
            return (
              <Reveal key={offering.title} index={index % 8} staggerStepMs={40}>
                <div className="card-surface flex h-full flex-col justify-between p-6">
                  <div>
                    <p className="tabular text-small text-ink-40">{String(globalIndex + 1).padStart(2, "0")}</p>
                    <p className="text-display-s mt-3 font-medium text-ink">{offering.title}</p>
                    <p className="text-small mt-2 text-ink-70">{offering.description}</p>
                  </div>
                  <span className="service-tile-arrow mt-4 text-accent" aria-hidden="true">
                    &rarr;
                  </span>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
