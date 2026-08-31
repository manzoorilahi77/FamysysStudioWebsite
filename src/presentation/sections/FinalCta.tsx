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
    // fade={false}, by the project's own rule: any colour derived against full ink is
    // wrong for the first 900ms of a fading section, and this one carries a form. The
    // error messages are accent-on-dark (5.015:1 on ink, 3.792:1 at the fade's start) and
    // the input borders are canvas-40 (3.231:1 on ink, 2.887:1 at the start, against a
    // 3:1 UI-boundary floor). Both were already true before /contact existed; the
    // measured contrast pass built for that page is what surfaced them. A form is also
    // not a moment for a background transition — /contact's form section does the same.
    <Section dark statement fade={false} ariaLabel={closingCta.heading}>
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
