import type { DirectionBlock } from "../../domain/about/entities/AboutPage";
import { Container } from "../components/Container";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";
import { SectionHeader } from "../components/SectionHeader";

interface WhereWereGoingProps {
  readonly direction: DirectionBlock;
}

/**
 * Ambition and current position, in that order, in one block.
 *
 * The two are never separated and the second is never dropped. The client's ambition
 * sentence on its own reads as a description of the studio today; followed by the
 * client's own "starting deliberately" line it reads as what it is — a statement of
 * intent from a business that says plainly where it currently stands. That pairing is
 * the whole section, which is why the block has no third paragraph and no image.
 *
 * The present line is set quieter and on a hairline beneath the ambition, so the
 * relationship between them is structural rather than something the reader has to infer
 * from two paragraphs of equal weight.
 */
export function WhereWereGoing({ direction }: WhereWereGoingProps) {
  return (
    <Section ariaLabel={direction.heading}>
      <Container>
        <SectionHeader eyebrow={direction.eyebrow} heading={direction.heading} className="" />
        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-7">
            <Reveal index={0} staggerStepMs={60}>
              <p className="text-lead text-ink" style={{ maxWidth: "44ch" }}>
                {direction.ambition}
              </p>
            </Reveal>
          </div>
          <div className="lg:col-span-5">
            <Reveal index={1} staggerStepMs={60}>
              <p className="direction-present text-body text-ink-70" style={{ maxWidth: "44ch" }}>
                {direction.present}
              </p>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
