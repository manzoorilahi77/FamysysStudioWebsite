import type { WhyFamysysBlock } from "../../domain/marketing/entities/WhyFamysysBlock";
import { Container } from "../components/Container";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";
import { SectionHeader } from "../components/SectionHeader";

interface WhyFamysysProps {
  readonly whyFamysys: WhyFamysysBlock;
}

/**
 * Alternating full-width rows on hairlines rather than five equal cards: label and
 * description swap columns row by row, which reads denser and more editorial and stops
 * this section from repeating the shape of What We Do. Both halves stay left-aligned
 * inside their own column, so the alternation never becomes ragged centring.
 */
export function WhyFamysys({ whyFamysys }: WhyFamysysProps) {
  return (
    <Section ariaLabel={whyFamysys.heading}>
      <Container>
        <SectionHeader heading={whyFamysys.heading} body={whyFamysys.body} />
        <div className="mt-14">
          {whyFamysys.reasons.map((reason, index) => {
            const isFlipped = index % 2 === 1;
            return (
              <Reveal
                key={reason.title}
                index={index}
                staggerStepMs={60}
                className="reason-row py-8"
              >
                <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
                  <p
                    className={`text-display-s font-medium text-ink lg:col-span-4 ${
                      isFlipped ? "lg:order-2 lg:col-start-9" : ""
                    }`}
                  >
                    {reason.title}
                  </p>
                  <p
                    className={`text-body text-ink-70 lg:col-span-6 ${
                      isFlipped ? "lg:order-1 lg:col-start-1" : "lg:col-start-7"
                    }`}
                  >
                    {reason.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
