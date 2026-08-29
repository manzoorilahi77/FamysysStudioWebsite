import type { ServiceOffering } from "../../domain/services/entities/ServiceOffering";
import type { CtaView } from "../lib/viewModels";
import type { SectionIntro } from "../../domain/marketing/entities/SectionIntro";
import { Button } from "../components/Button";
import { Container } from "../components/Container";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";
import { SectionHeader } from "../components/SectionHeader";

interface WhatWeDoProps {
  readonly intro: SectionIntro;
  readonly cta: CtaView;
  readonly capabilities: ReadonlyArray<ServiceOffering>;
}

// Six text-only tiles of equal weight, so this is an even 3 x 2 grid, not a bento.
// Uneven spans only earn their keep when the tiles differ in importance or carry
// media; here they just produced mismatched heights and a hole to design around.
export function WhatWeDo({ intro, cta, capabilities }: WhatWeDoProps) {
  return (
    <Section ariaLabel={intro.heading}>
      <Container>
        <SectionHeader eyebrow={intro.eyebrow} heading={intro.heading} body={intro.body} />

        <div className="mt-14 grid auto-rows-fr gap-6 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((capability, index) => (
            <Reveal key={capability.title} index={index} staggerStepMs={60}>
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

        <div className="mt-10">
          <Button cta={cta} variant="ghost" />
        </div>
      </Container>
    </Section>
  );
}
