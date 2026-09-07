import type { BeliefBlock } from "../../../domain/about/entities/AboutPage";
import { Container } from "../../components/Container";
import { RevealHeading } from "../../components/RevealHeading";
import { Section } from "../../components/Section";

interface BeliefStatementProps {
  readonly belief: BeliefBlock;
}

/**
 * The page's thesis, and THE SITE'S THIRD AND LAST CENTRED MOMENT.
 *
 * The homepage has the other two — the thesis line in The Differentiator, and the
 * closing CTA heading. Everything else on every page is flush left. That is what makes a
 * centred line read as emphasis rather than as a default, and it is why nothing else on
 * this page is centred: the statement carries no eyebrow, no rule and no supporting
 * line, because a second centred element beside it would spend the whole budget at once.
 * The section's own name comes from `label`, which is not rendered.
 *
 * `statement` padding gives it the most air any block on the site gets — the same
 * measure the homepage's thesis stands in.
 *
 * IT ARRIVES ON LOAD, NOT ON SCROLL, and that is a measurement rather than a preference:
 * the hero holds 60svh and the statement's own padding puts this line about 700px down at
 * a 900px viewport and about 640px down on a phone, so on every viewport the site is
 * built for it is already inside the first screen. A scroll reveal on something nobody
 * scrolls to is a reveal that never plays — it would simply render final and the page's
 * emphasis would be the one block that does not move.
 *
 * So it takes the same mechanism the hero's own copy takes: a keyframe, which holds its
 * from-state before it starts and its to-state after, and therefore needs no JavaScript
 * to finish. Its entry is slower and further than anything else on the page — 760ms from
 * 28px against 320ms from 24px — and it starts after the hero's copy has landed. A
 * different effect would have been a new effect; a different pace is emphasis. See
 * `.belief-enter` in globals.css, which also holds it still under reduced motion.
 */
export function BeliefStatement({ belief }: BeliefStatementProps) {
  return (
    <Section statement ariaLabel={belief.label}>
      <Container>
        <div className="belief-enter">
          <RevealHeading
            as="p"
            className="text-heading mx-auto max-w-[30ch] text-center font-medium text-balance text-ink"
          >
            {belief.statement}
          </RevealHeading>
        </div>
      </Container>
    </Section>
  );
}
