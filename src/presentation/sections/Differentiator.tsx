import type { DifferentiatorBlock } from "../../domain/marketing/entities/DifferentiatorBlock";
import { Container } from "../components/Container";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";

interface DifferentiatorProps {
  readonly differentiator: DifferentiatorBlock;
}

export function Differentiator({ differentiator }: DifferentiatorProps) {
  return (
    <Section ariaLabel={differentiator.heading}>
      <Container>
        <div className="mx-auto max-w-[46ch] text-center">
          <h2 className="text-display-l font-medium text-ink">{differentiator.heading}</h2>
          <p className="text-lead mt-6 text-ink-70">{differentiator.body}</p>
          <p className="text-body mt-6 font-medium text-ink">{differentiator.leadIn}</p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {differentiator.elements.map((element, index) => (
            <Reveal key={element.title} index={index}>
              <div className="card-surface h-full p-8">
                <p className="text-display-s font-medium text-ink">{element.title}</p>
                <p className="text-body mt-3 text-ink-70">{element.description}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* The page's thesis — the strongest typographic moment after the hero. */}
        <Reveal>
          <p className="text-display-l mx-auto mt-20 max-w-[24ch] text-center font-medium text-ink">
            {differentiator.closingStatement}
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}
