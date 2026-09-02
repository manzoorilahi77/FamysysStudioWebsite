import type { FramingBlock } from "../../domain/portfolio/entities/SelectedWorkPage";
import { Container } from "../components/Container";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";
import { SectionHeader } from "../components/SectionHeader";

interface WorkFramingProps {
  readonly framing: FramingBlock;
}

/** The paragraph lands after the heading rather than with it. One step, not a stagger. */
const PARAGRAPH_DELAY_MS = 120;

/**
 * The block that makes the rest of the page honest, and the reason it sits between the
 * hero and the grid rather than under it: a reader has to know that nothing below has
 * been produced BEFORE they see eight covers under eight real titles. A footnote at the
 * bottom of a portfolio is a disclaimer; this is the page's actual position.
 *
 * Light, and directly on top of the grid's own light section on purpose. The two are one
 * continuous surface — a dark band between them would separate the statement from the
 * work it is a statement about. The hairline above the block is what separates it from
 * the hero instead, and costs nothing in colour or copy to do it.
 *
 * ONE paragraph now, against a five-column heading in a twelve-column grid — a split
 * that is asymmetric in both directions, because three stacked paragraphs opposite a
 * heading made the right column the block and the heading its label. With one paragraph
 * the heading is the block and the paragraph is the qualification.
 *
 * The heading keeps the clip reveal every heading on the site has; the paragraph follows
 * it by one step. `Reveal`'s stagger is the mechanism, with an index of one against a
 * 120ms step, so the offset is the site's own staggering rather than a timer written
 * here — and it collapses with everything else under reduced motion.
 */
export function WorkFraming({ framing }: WorkFramingProps) {
  return (
    <Section ariaLabel={framing.heading}>
      <Container>
        <div className="work-framing grid gap-8 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-5">
            <SectionHeader eyebrow={framing.eyebrow} heading={framing.heading} className="" />
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal index={1} staggerStepMs={PARAGRAPH_DELAY_MS}>
              <p className="text-body text-ink-70" style={{ maxWidth: "52ch" }}>
                {framing.body}
              </p>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
