import type { ProcessBlock } from "../../domain/marketing/entities/ProcessBlock";
import { ClipNumber } from "../components/ClipNumber";
import { Container } from "../components/Container";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";
import { SectionHeader } from "../components/SectionHeader";

interface HowWeWorkProps {
  readonly process: ProcessBlock;
}

// Five steps of equal weight resolve as 3 + 2 with no hole: a six-column grid where
// the first three steps take two columns each (2+2+2) and the last two take three
// (3+3). Both rows fill exactly, and `auto-rows-fr` keeps the cards level.
const NARROW_STEP_COUNT = 3;

export function HowWeWork({ process }: HowWeWorkProps) {
  return (
    <Section dark ariaLabel={process.heading}>
      <Container>
        <SectionHeader dark heading={process.heading} />
        <div className="mt-14 grid auto-rows-fr gap-6 md:grid-cols-2 lg:grid-cols-6">
          {process.steps.map((step, index) => (
            <Reveal
              key={step.title}
              index={index}
              staggerStepMs={60}
              className={index < NARROW_STEP_COUNT ? "lg:col-span-2" : "lg:col-span-3"}
            >
              <div className="card-surface-dark h-full p-6">
                <ClipNumber
                  value={String(index + 1).padStart(2, "0")}
                  className="text-display-m font-medium text-accent-on-dark"
                />
                <p className="text-display-s mt-3 font-medium text-canvas">{step.title}</p>
                <p className="text-body mt-2 text-canvas-80">{step.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
