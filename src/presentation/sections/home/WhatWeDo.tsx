import type { ServiceOffering } from "../../../domain/services/entities/ServiceOffering";
import type { CtaView } from "../../lib/viewModels";
import type { SectionIntro } from "../../../domain/marketing/entities/SectionIntro";
import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { Section } from "../../components/Section";
import { SectionHeader } from "../../components/SectionHeader";
import { ServiceGrid } from "../../components/ServiceGrid";

interface WhatWeDoProps {
  readonly intro: SectionIntro;
  readonly cta: CtaView;
  readonly capabilities: ReadonlyArray<ServiceOffering>;
}

/**
 * The six capabilities, rebuilt from six separate cards into one bordered container
 * divided by hairlines — the shape famysys.com's own service grid uses. The cards had two
 * problems the grid does not have: they varied in height, because nothing tied them
 * together, and six individual borders separated by gutters read as six things rather than
 * as one offering with six parts. Sharing edges is what makes it a system; equal heights
 * are now structural rather than something to keep an eye on.
 *
 * CANVAS, and the cells carry no fill of their own. The section is cream and stays cream:
 * building it on ink made it the page's THIRD consecutive dark ground — hero, this, then §3
 * The Differentiator — which cost §3 the thing its own docblock calls it, "the page's one
 * mid-page dark beat". There was no light section left between the top of the page and the
 * end of §3 for it to be a beat against. On canvas the rhythm reads again and §3 is once
 * more the only dark ground between the hero and the closing statement.
 *
 * The CARD design is the part that came from the dark reference, and none of it needed a
 * dark section to work: cells with no fill at rest, a full ink inversion that drops over the
 * hovered cell as a top-down curtain, oversized numerals cropped by the cell's bottom edge,
 * and one accent square that travels between hairline junctions. The inversion replaced a
 * light tint mixed toward white — over this warm cream every mix composited grey, and the
 * fix was to stop tinting and go all the way to the dark ground, which also hands the
 * hovered cell cream-on-ink copy and a terracotta ember under its numeral. See the
 * `.service-*` block in globals.css.
 *
 * The header splits: heading left, supporting line right, from lg up. A six-cell grid is
 * the widest thing on the page, and opening it with a header that uses half the measure
 * and stacks understates it; the split claims the width the grid below is about to use.
 */
export function WhatWeDo({ intro, cta, capabilities }: WhatWeDoProps) {
  return (
    <Section ariaLabel={intro.heading}>
      <Container>
        <SectionHeader split eyebrow={intro.eyebrow} heading={intro.heading} body={intro.body} />

        <ServiceGrid capabilities={capabilities} />

        <div className="mt-10">
          <Button cta={cta} variant="ghost" />
        </div>
      </Container>
    </Section>
  );
}
