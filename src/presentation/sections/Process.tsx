import type { ProcessBlock } from "../../domain/marketing/entities/ProcessBlock";
import { Container } from "../components/Container";
import { Eyebrow } from "../components/Eyebrow";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";

interface ProcessProps {
  readonly process: ProcessBlock;
}

export function Process({ process }: ProcessProps) {
  return (
    <Section dark ariaLabel={process.heading}>
      <Container>
        <div className="mx-auto max-w-[36ch] text-center">
          <Eyebrow dark>{process.eyebrow}</Eyebrow>
          <h2 className="text-display-l mt-4 font-medium text-canvas">{process.heading}</h2>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {process.steps.map((step, index) => {
            const isWide = index === 0 || index === 3;
            return (
              <Reveal key={step.title} index={index} staggerStepMs={60} className={isWide ? "lg:col-span-2" : ""}>
                <div className="card-surface-dark h-full p-6">
                  <p className="text-display-m font-medium text-accent-on-dark">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="text-display-s mt-3 font-medium text-canvas">{step.title}</p>
                  <p className="text-body mt-2 text-canvas-80">{step.description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
