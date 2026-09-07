import type { EngagementHero as EngagementHeroContent } from "../../../domain/engagement/entities/WaysToWorkPage";
import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { Eyebrow } from "../../components/Eyebrow";
import { RevealHeading } from "../../components/RevealHeading";
import { toCtaView } from "../../lib/viewModels";

interface EngagementHeroProps {
  readonly hero: EngagementHeroContent;
}

/**
 * A section-page hero, sibling to the Creative Services and How We Work ones: about
 * 60svh rather than the homepage's full viewport, one call to action rather than two,
 * and the `hero` type step rather than `display-l` — display-l is LARGER than the
 * homepage's own headline, so a section page using it reads as an escalation instead of
 * a step down.
 *
 * A plain `<section>` rather than `Section`, so there is no entry fade at all and the
 * accent-derived question of the fade's start value does not arise. Every colour here is
 * canvas or canvas-80 regardless.
 */
export function EngagementHero({ hero }: EngagementHeroProps) {
  return (
    <section
      className="surface-dark bg-ink text-canvas flex items-center"
      aria-label={hero.heading}
      style={{ minHeight: "60svh" }}
    >
      <Container>
        {/* Top padding clears the fixed header and no more; the flex centring absorbs
            whatever slack is left inside the 60svh. */}
        <div className="pt-28 pb-14">
          <Eyebrow dark>{hero.eyebrow}</Eyebrow>
          <RevealHeading
            as="h1"
            className="text-heading mt-5 max-w-[22ch] font-semibold text-canvas"
            accent={["Flexible"]}
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
