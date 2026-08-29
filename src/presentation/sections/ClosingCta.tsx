import type { ClosingCtaBlock } from "../../domain/marketing/entities/ClosingCtaBlock";
import { Container } from "../components/Container";
import { DemoForm } from "../components/DemoForm";
import { Section } from "../components/Section";

interface ClosingCtaProps {
  readonly closingCta: ClosingCtaBlock;
}

export function ClosingCta({ closingCta }: ClosingCtaProps) {
  return (
    <Section dark ariaLabel="Book a call">
      <Container className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-display-xl font-semibold text-canvas">
            {closingCta.headlineLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <p className="text-lead mt-6 text-canvas-80" style={{ maxWidth: "44ch" }}>
            {closingCta.supportingParagraph}
          </p>
        </div>
        <DemoForm />
      </Container>
    </Section>
  );
}
