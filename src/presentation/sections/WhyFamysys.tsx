import type { WhyFamysysBlock } from "../../domain/marketing/entities/WhyFamysysBlock";
import { Container } from "../components/Container";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";

interface WhyFamysysProps {
  readonly whyFamysys: WhyFamysysBlock;
}

// Five reasons over a six-column grid: the first two take three columns each,
// the last three take two — the same 2 + 3 split as How We Work, so the two
// odd-numbered sections resolve the same way rather than each inventing one.
const WIDE_REASON_COUNT = 2;

export function WhyFamysys({ whyFamysys }: WhyFamysysProps) {
  return (
    <Section ariaLabel={whyFamysys.heading}>
      <Container>
        <div className="mx-auto max-w-[46ch] text-center">
          <h2 className="text-display-l font-medium text-ink">{whyFamysys.heading}</h2>
          <p className="text-lead mt-6 text-ink-70">{whyFamysys.body}</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-6">
          {whyFamysys.reasons.map((reason, index) => (
            <Reveal
              key={reason.title}
              index={index}
              staggerStepMs={60}
              className={index < WIDE_REASON_COUNT ? "lg:col-span-3" : "lg:col-span-2"}
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
