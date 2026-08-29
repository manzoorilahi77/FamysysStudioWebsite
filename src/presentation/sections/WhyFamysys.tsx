import type { WhyFamysysBlock } from "../../domain/marketing/entities/WhyFamysysBlock";
import { Container } from "../components/Container";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";
import { SectionHeader } from "../components/SectionHeader";

interface WhyFamysysProps {
  readonly whyFamysys: WhyFamysysBlock;
}

// Same 3 + 2 resolution as How We Work, so the two odd-numbered sections settle the
// same way instead of each inventing one: three two-column tiles, then two
// three-column tiles. Both rows fill their six columns exactly.
const NARROW_REASON_COUNT = 3;

export function WhyFamysys({ whyFamysys }: WhyFamysysProps) {
  return (
    <Section ariaLabel={whyFamysys.heading}>
      <Container>
        <SectionHeader heading={whyFamysys.heading} body={whyFamysys.body} />
        <div className="mt-14 grid auto-rows-fr gap-6 md:grid-cols-2 lg:grid-cols-6">
          {whyFamysys.reasons.map((reason, index) => (
            <Reveal
              key={reason.title}
              index={index}
              staggerStepMs={60}
              className={index < NARROW_REASON_COUNT ? "lg:col-span-2" : "lg:col-span-3"}
            >
              <div className="card-surface h-full p-8">
                <p className="text-display-s font-medium text-ink">{reason.title}</p>
                <p className="text-body mt-3 text-ink-70">{reason.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
