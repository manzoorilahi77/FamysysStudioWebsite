import type { ServiceOffering } from "../../domain/services/entities/ServiceOffering";
import type { CtaView } from "../lib/viewModels";
import type { SectionIntro } from "../../domain/marketing/entities/SectionIntro";
import { Button } from "../components/Button";
import { Container } from "../components/Container";
import { Eyebrow } from "../components/Eyebrow";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";

interface WhatWeDoProps {
  readonly intro: SectionIntro;
  readonly cta: CtaView;
  readonly capabilities: ReadonlyArray<ServiceOffering>;
}

// Six tiles over four columns, with the tile that opens each row spanning two:
// row one is [wide][1][1], row two the same. That fills both rows exactly, so
// the grid breaks its rhythm without leaving a hole — a lighter asymmetry than
// the bento used when this section carried nineteen tiles.
const WIDE_TILE_INDEXES = new Set([0, 3]);

export function WhatWeDo({ intro, cta, capabilities }: WhatWeDoProps) {
  return (
    <Section ariaLabel={intro.heading}>
      <Container>
        <div className="mx-auto max-w-[46ch] text-center">
          <Eyebrow>{intro.eyebrow}</Eyebrow>
          <h2 className="text-display-l mt-4 font-medium text-ink">{intro.heading}</h2>
          <p className="text-lead mt-6 text-ink-70">{intro.body}</p>
        </div>

        <div className="mt-12 grid auto-rows-fr gap-6 md:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((capability, index) => (
            <Reveal
              key={capability.title}
              index={index}
              staggerStepMs={40}
              className={WIDE_TILE_INDEXES.has(index) ? "lg:col-span-2" : ""}
            >
              <div className="card-surface flex h-full flex-col justify-between p-8">
                <div>
                  <p className="text-display-s font-medium text-ink">{capability.title}</p>
                  <p className="text-body mt-3 text-ink-70">{capability.description}</p>
                </div>
                <span className="service-tile-arrow mt-6 text-accent" aria-hidden="true">
                  &rarr;
                </span>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Button cta={cta} variant="ghost" />
        </div>
      </Container>
    </Section>
  );
}
