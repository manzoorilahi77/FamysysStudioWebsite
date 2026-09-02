import type { AboutHero as AboutHeroContent } from "../../domain/about/entities/AboutPage";
import { Container } from "../components/Container";
import { Eyebrow } from "../components/Eyebrow";
import { RevealHeading } from "../components/RevealHeading";

interface AboutHeroProps {
  readonly hero: AboutHeroContent;
}

/**
 * Shorter than every other hero on the site — about 50svh against their 60 — and that
 * difference is the point. This is the quietest page here, and a hero that took the same
 * height as the others would be the first thing to contradict it.
 *
 * No call to action, also deliberately. Every other page's hero carries one; this page's
 * argument is not "do something", it is "here is who this is", and the closing CTA at the
 * foot is where the ask belongs. The `hero` type step rather than `display-l`, for the
 * same reason as the other section pages: display-l is larger than the homepage's own
 * headline, so a section page using it reads as an escalation instead of a step down.
 */
export function AboutHero({ hero }: AboutHeroProps) {
  return (
    <section
      className="surface-dark bg-ink text-canvas flex items-center"
      aria-label={hero.heading}
      style={{ minHeight: "50svh" }}
    >
      <Container>
        {/* Top padding clears the fixed header and no more; the flex centring takes up
            whatever slack is left inside the 50svh. */}
        <div className="pt-28 pb-12">
          <Eyebrow dark>{hero.eyebrow}</Eyebrow>
          <RevealHeading
            as="h1"
            className="text-heading mt-5 max-w-[20ch] font-semibold text-canvas"
            accent={["creative production."]}
          >
            {hero.heading}
          </RevealHeading>
          <p className="text-body mt-6 text-canvas-80" style={{ maxWidth: "54ch" }}>
            {hero.body}
          </p>
        </div>
      </Container>
    </section>
  );
}
