import type { WorkHero as WorkHeroContent } from "../../domain/portfolio/entities/SelectedWorkPage";
import { Button } from "../components/Button";
import { Container } from "../components/Container";
import { Eyebrow } from "../components/Eyebrow";
import { RevealHeading } from "../components/RevealHeading";
import { toCtaView } from "../lib/viewModels";

interface WorkHeroProps {
  readonly hero: WorkHeroContent;
}

/**
 * Sibling to the Creative Services and How We Work heroes: about 60svh rather than the
 * homepage's full viewport, one call to action, and the `hero` type step rather than
 * `display-l` — display-l is LARGER than the homepage's own headline, so a section page
 * using it reads as an escalation instead of a step down. Creative Services had to be
 * corrected from 83svh for exactly this; this one is budgeted at 60svh from the start.
 *
 * No image, and deliberately so. The honest framing block immediately below is the thing
 * a reader has to see before the grid, and a hero band would push it under the fold.
 */
export function WorkHero({ hero }: WorkHeroProps) {
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
            accent={["Creative Work"]}
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
