import type { Differentiator } from "../../domain/marketing/entities/Differentiator";
import type { SectionIntro } from "../../domain/marketing/entities/SectionIntro";
import { Container } from "../components/Container";
import { Eyebrow } from "../components/Eyebrow";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";

interface DifferentiatorsProps {
  readonly intro: SectionIntro;
  readonly items: ReadonlyArray<Differentiator>;
}

export function Differentiators({ intro, items }: DifferentiatorsProps) {
  return (
    <Section ariaLabel={intro.heading}>
      <Container>
        <div className="mx-auto max-w-[40ch] text-center">
          <Eyebrow>{intro.eyebrow}</Eyebrow>
          <h2 className="text-display-l mt-4 font-medium text-ink">{intro.heading}</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {items.map((item, index) => (
            <Reveal key={item.title} index={index}>
              <div className="card-surface h-full p-8">
                <p className="text-display-s font-medium text-ink">{item.title}</p>
                <p className="text-body mt-3 text-ink-70">{item.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
