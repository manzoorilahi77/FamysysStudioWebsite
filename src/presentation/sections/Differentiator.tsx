import type { DifferentiatorBlock } from "../../domain/marketing/entities/DifferentiatorBlock";
import { spacing } from "../../shared/design/tokens";
import { Container } from "../components/Container";
import { Reveal } from "../components/Reveal";
import { RevealHeading } from "../components/RevealHeading";
import { Section } from "../components/Section";
import { SectionHeader } from "../components/SectionHeader";

interface DifferentiatorProps {
  readonly differentiator: DifferentiatorBlock;
}

export function Differentiator({ differentiator }: DifferentiatorProps) {
  return (
    <Section ariaLabel={differentiator.heading}>
      <Container>
        <SectionHeader
          heading={differentiator.heading}
          body={differentiator.body}
          leadIn={differentiator.leadIn}
        />

        {/* Four elements of equal weight — an even 2 x 2. */}
        <div className="mt-14 grid auto-rows-fr gap-6 md:grid-cols-2">
          {differentiator.elements.map((element, index) => (
            <Reveal key={element.title} index={index} staggerStepMs={60}>
              <div className="card-surface h-full p-8">
                <p className="text-display-s font-medium text-ink">{element.title}</p>
                <p className="text-body mt-3 text-ink-70">{element.description}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* One of the page's two centred moments: the thesis, at display size, standing
            alone with the statement measure of space around it. Everything else on the
            page is flush left, which is what lets this one land. */}
        <div style={{ marginTop: spacing.statement }}>
          <RevealHeading
            as="p"
            className="text-display-l mx-auto max-w-[24ch] text-center font-medium text-balance text-ink"
          >
            {differentiator.closingStatement}
          </RevealHeading>
        </div>
      </Container>
    </Section>
  );
}
