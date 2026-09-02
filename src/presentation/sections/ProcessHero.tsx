import type { ProcessHero as ProcessHeroContent } from "../../domain/process/entities/HowWeWorkPage";
import { Button } from "../components/Button";
import { Container } from "../components/Container";
import { Eyebrow } from "../components/Eyebrow";
import { RevealHeading } from "../components/RevealHeading";
import { toCtaView } from "../lib/viewModels";

interface ProcessHeroProps {
  readonly hero: ProcessHeroContent;
}

/**
 * A section-page hero, sibling to the Creative Services one: about 60svh rather than the
 * homepage's full viewport, one call to action rather than two. The heading takes the
 * `hero` type step and not `display-l` — display-l is LARGER than the homepage's own
 * headline, so a section page using it reads as an escalation instead of a step down. The
 * Creative Services hero had to be corrected down from 83svh for exactly this reason, and
 * this one is budgeted at 60svh from the start.
 *
 * No image. The Creative Services hero carries a short band because its subject is six
 * things you look at; this page's subject is a sequence, and the overview bar immediately
 * below is what the reader needs on the fold.
 */
export function ProcessHero({ hero }: ProcessHeroProps) {
  return (
    <section
      className="surface-dark bg-ink text-canvas flex items-center"
      aria-label={hero.heading}
      style={{ minHeight: "60svh" }}
    >
      <Container>
        {/* Top padding clears the fixed header and no more; the flex centring takes up
            whatever slack is left inside the 60svh. */}
        <div className="pt-28 pb-14">
          <Eyebrow dark>{hero.eyebrow}</Eyebrow>
          <RevealHeading
            as="h1"
            className="text-heading mt-5 max-w-[22ch] font-semibold text-canvas"
            accent={["finished creative."]}
          >
            {hero.heading}
          </RevealHeading>
          <p className="text-body mt-6 text-canvas-80" style={{ maxWidth: "56ch" }}>
            {hero.body}
          </p>
          <div className="mt-8">
            <Button cta={toCtaView(hero.cta)} variant="primary" dark />
          </div>
        </div>
      </Container>
    </section>
  );
}
