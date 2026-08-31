import type { ContactHero as ContactHeroContent } from "../../domain/contact/entities/ContactPage";
import { Container } from "../components/Container";
import { RevealHeading } from "../components/RevealHeading";

interface ContactHeroProps {
  readonly hero: ContactHeroContent;
}

/**
 * THE ONLY LIGHT HERO ON THE SITE. The other six open on ink; this one opens on canvas,
 * because famysys.com's own contact page does and this is the one page shaped against it
 * rather than against the other six.
 *
 * That has a consequence beyond this file: the header renders its dark-surface tone while
 * it sits transparent over an unscrolled page, which would put canvas nav links on a
 * canvas ground. `Header` therefore takes an `opensOnLight` prop, and /contact is the one
 * route that passes it.
 *
 * Nothing sits on the right half. The whitespace is the composition — a form is coming
 * two hundred pixels below, and a hero that filled its width would leave the page with no
 * quiet moment at all.
 */
export function ContactHero({ hero }: ContactHeroProps) {
  return (
    <section className="bg-canvas text-ink" aria-label={hero.heading}>
      <Container>
        <div className="pt-40 pb-20 lg:pt-48 lg:pb-28">
          <p className="label flex items-center gap-3 text-accent">
            {/* The parent's small square rule before the eyebrow. Decorative — the
                eyebrow beside it is the label. */}
            <span
              aria-hidden="true"
              className="inline-block h-2 w-2 shrink-0"
              style={{ backgroundColor: "var(--color-accent)" }}
            />
            {hero.eyebrow}
          </p>
          <RevealHeading
            as="h1"
            className="text-display-l mt-6 max-w-[18ch] font-medium text-ink"
            accent={["make it."]}
          >
            {hero.heading}
          </RevealHeading>
          <p className="text-lead mt-8 text-ink-70" style={{ maxWidth: "52ch" }}>
            {hero.body}
          </p>
        </div>
      </Container>
    </section>
  );
}
