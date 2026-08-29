import type { ProcessBlock } from "../../domain/marketing/entities/ProcessBlock";
import { ClipNumber } from "../components/ClipNumber";
import { Container } from "../components/Container";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";
import { SectionHeader } from "../components/SectionHeader";

interface HowWeWorkProps {
  readonly process: ProcessBlock;
}

/**
 * A process, laid out as one. Five steps run left to right along a single hairline with
 * the numerals sitting on it and the copy beneath; below `lg` the same rule runs down
 * the left instead. Cards would have said "five things"; the rule says "in this order".
 */
export function HowWeWork({ process }: HowWeWorkProps) {
  return (
    <Section dark ariaLabel={process.heading}>
      <Container>
        <SectionHeader dark heading={process.heading} />
        <ol className="mt-14 grid list-none gap-0 lg:grid-cols-5 lg:gap-6">
          {process.steps.map((step, index) => (
            <li key={step.title}>
              <Reveal index={index} staggerStepMs={60} className="process-step">
                <div className="process-rail">
                  <ClipNumber
                    value={String(index + 1).padStart(2, "0")}
                    className="text-display-l font-medium text-accent-on-dark"
                  />
                  <span className="process-rule" aria-hidden="true" />
                </div>
                <div className="process-content">
                  <p className="text-display-s font-medium text-canvas">{step.title}</p>
                  <p className="text-body mt-2 text-canvas-80">{step.description}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
