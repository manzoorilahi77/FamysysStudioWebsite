"use client";

import type { ServiceOffering } from "../../domain/services/entities/ServiceOffering";
import { motion } from "../../shared/design/tokens";
import type { CtaView } from "../lib/viewModels";
import type { SectionIntro } from "../../domain/marketing/entities/SectionIntro";
import { Button } from "../components/Button";
import { CapabilityCard } from "../components/CapabilityCard";
import { Container } from "../components/Container";
import { Section } from "../components/Section";
import { SectionHeader } from "../components/SectionHeader";
import { useGridColumns } from "../hooks/useGridColumns";

interface WhatWeDoProps {
  readonly intro: SectionIntro;
  readonly cta: CtaView;
  readonly capabilities: ReadonlyArray<ServiceOffering>;
}

/**
 * Six text-only tiles of equal weight, so this is an even 3 x 2 grid, not a bento.
 * Uneven spans only earn their keep when the tiles differ in importance or carry media;
 * here they just produced mismatched heights and a hole to design around.
 *
 * The reference's services block is 20 tiles with a photograph on each — that shape does
 * not survive being handed six lines of text, so the tiles carry a numeral instead and
 * the section earns its place on motion rather than on imagery.
 *
 * Entry is a diagonal: `(row + column)` steps, so the wave crosses the grid corner to
 * corner instead of sweeping row by row. The column count comes from the same breakpoints
 * the grid uses, so at one column the formula collapses to a plain sequential stagger,
 * which is the right reading of a diagonal when there is only one of them.
 */
export function WhatWeDo({ intro, cta, capabilities }: WhatWeDoProps) {
  const columns = useGridColumns();

  return (
    <Section ariaLabel={intro.heading}>
      <Container>
        <SectionHeader eyebrow={intro.eyebrow} heading={intro.heading} body={intro.body} />

        <div className="mt-14 grid auto-rows-fr gap-6 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((capability, index) => (
            <CapabilityCard
              key={capability.title}
              capability={capability}
              numeral={String(index + 1).padStart(2, "0")}
              delayMs={
                (Math.floor(index / columns) + (index % columns)) * motion.stagger.diagonalStepMs
              }
            />
          ))}
        </div>

        <div className="mt-10">
          <Button cta={cta} variant="ghost" />
        </div>
      </Container>
    </Section>
  );
}
