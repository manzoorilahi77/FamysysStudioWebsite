import type { FaqPageView } from "../../lib/viewModels";
import { Container } from "../../components/Container";
import { RevealHeading } from "../../components/RevealHeading";

interface FaqHeroProps {
  readonly hero: FaqPageView["hero"];
}

/**
 * The questions page opens LIGHT, like /contact and the two legal documents — the three
 * kinds of page a reader arrives at to find one thing rather than to be shown around.
 * The header starts solid over it for the same reason it does on /contact: a transparent
 * bar would put canvas links on a canvas ground.
 */
export function FaqHero({ hero }: FaqHeroProps) {
  return (
    <section className="bg-canvas text-ink" aria-label={hero.heading}>
      <Container>
        <div className="pt-40 pb-12 lg:pt-48 lg:pb-16">
          <p className="label flex items-center gap-3 text-accent">
            <span
              aria-hidden="true"
              className="inline-block h-2 w-2 shrink-0"
              style={{ backgroundColor: "var(--color-accent)" }}
            />
            {hero.eyebrow}
          </p>
          <RevealHeading
            as="h1"
            className="text-heading mt-6 max-w-[20ch] font-medium text-ink"
            accent={["come up first."]}
          >
            {hero.heading}
          </RevealHeading>
          <p className="text-body mt-8 text-ink-70" style={{ maxWidth: "52ch" }}>
            {hero.body}
          </p>
        </div>
      </Container>
    </section>
  );
}
