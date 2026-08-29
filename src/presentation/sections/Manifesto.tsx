import type { ManifestoBlockView } from "../lib/viewModels";
import { Button } from "../components/Button";
import { Container } from "../components/Container";
import { Eyebrow } from "../components/Eyebrow";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";

interface ManifestoProps {
  readonly manifesto: ManifestoBlockView;
}

export function Manifesto({ manifesto }: ManifestoProps) {
  return (
    <Section ariaLabel="What we believe">
      <Container>
        <Reveal>
          <div className="mx-auto max-w-[52ch] text-center">
            <Eyebrow>{manifesto.eyebrow}</Eyebrow>
            <h2 className="text-display-l mt-4 font-medium text-ink">
              {manifesto.statementLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
            <p className="text-lead mx-auto mt-6 text-ink-70" style={{ maxWidth: "48ch" }}>
              {manifesto.supportingParagraph}
            </p>
            <div className="mt-8 flex justify-center">
              <Button cta={manifesto.cta} variant="ghost" />
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
