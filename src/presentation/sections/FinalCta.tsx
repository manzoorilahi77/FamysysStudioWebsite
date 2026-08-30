import type { ClosingCtaBlock } from "../../domain/marketing/entities/ClosingCtaBlock";
import { toCtaView } from "../lib/viewModels";
import { Button } from "../components/Button";
import { Container } from "../components/Container";
import { DemoForm } from "../components/DemoForm";
import { RevealHeading } from "../components/RevealHeading";
import { Section } from "../components/Section";

interface FinalCtaProps {
  readonly closingCta: ClosingCtaBlock;
  /**
   * Which words take the display accent. It has to travel with the heading: a phrase that
   * is not in the heading simply does not match, so a page with its own closing copy would
   * silently lose the accent if this stayed hard-coded to the homepage's wording.
   */
  readonly accent?: ReadonlyArray<string>;
}

export function FinalCta({ closingCta, accent = ["creative requirement?"] }: FinalCtaProps) {
  return (
    <Section dark statement ariaLabel={closingCta.heading}>
      <Container>
        {/* The page's second and last centred moment. The heading stands alone at
            display size; everything under it goes back to flush left, which is what
            keeps the centring reading as a decision rather than a habit. */}
        {/* The measure lives on the heading, not on a wrapper: `ch` resolves against
            the element's own font-size, so 15ch on a body-sized div would have been
            ~150px and shattered the heading into one word per line. */}
        <RevealHeading
          as="h2"
          className="text-display-xl mx-auto max-w-[15ch] text-center font-semibold text-balance text-canvas"
          accent={accent}
        >
          {closingCta.heading}
        </RevealHeading>

        <div className="mt-20 grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="text-lead text-canvas-80" style={{ maxWidth: "44ch" }}>
              {closingCta.body}
            </p>
            <div className="mt-8">
              <Button cta={toCtaView(closingCta.cta)} variant="primary" dark />
            </div>
            <p className="text-small mt-8 text-canvas-60">{closingCta.closingLine}</p>
          </div>
          <DemoForm />
        </div>
      </Container>
    </Section>
  );
}
