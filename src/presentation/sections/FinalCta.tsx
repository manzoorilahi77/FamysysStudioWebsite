import type { ClosingCtaBlock } from "../../domain/marketing/entities/ClosingCtaBlock";
import { toCtaView } from "../lib/viewModels";
import { Button } from "../components/Button";
import { Container } from "../components/Container";
import { DemoForm } from "../components/DemoForm";
import { Section } from "../components/Section";

interface FinalCtaProps {
  readonly closingCta: ClosingCtaBlock;
}

export function FinalCta({ closingCta }: FinalCtaProps) {
  return (
    <Section dark ariaLabel={closingCta.heading}>
      <Container className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-display-xl font-semibold text-canvas">{closingCta.heading}</h2>
          <p className="text-lead mt-6 text-canvas-80" style={{ maxWidth: "44ch" }}>
            {closingCta.body}
          </p>
          <div className="mt-8">
            <Button cta={toCtaView(closingCta.cta)} variant="primary" dark />
          </div>
          <p className="text-small mt-8 text-canvas-60">{closingCta.closingLine}</p>
        </div>
        <DemoForm />
      </Container>
    </Section>
  );
}
