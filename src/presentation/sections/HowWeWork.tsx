import type { ProcessBlock } from "../../domain/marketing/entities/ProcessBlock";
import { Container } from "../components/Container";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";

interface HowWeWorkProps {
  readonly process: ProcessBlock;
}

// Five steps land as 2 + 3 on desktop: a six-column grid where the first two
// steps take three columns each and the last three take two. A single row of
// five squeezed each step's copy too narrowly at 1440.
const WIDE_STEP_COUNT = 2;

export function HowWeWork({ process }: HowWeWorkProps) {
  return (
    <Section dark ariaLabel={process.heading}>
      <Container>
        <div className="mx-auto max-w-[36ch] text-center">
          <h2 className="text-display-l font-medium text-canvas">{process.heading}</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-6">
          {process.steps.map((step, index) => (
            <Reveal
              key={step.title}
              index={index}
              staggerStepMs={60}
              className={index < WIDE_STEP_COUNT ? "lg:col-span-3" : "lg:col-span-2"}
            >
              <div className="card-surface-dark h-full p-6">
                <p className="text-display-m font-medium text-accent-on-dark">
                  {String(index + 1).padStart(2, "0")}
                </p>
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
