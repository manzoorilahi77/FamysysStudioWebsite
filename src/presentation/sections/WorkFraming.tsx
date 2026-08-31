import type { FramingBlock } from "../../domain/portfolio/entities/SelectedWorkPage";
import { Container } from "../components/Container";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";
import { SectionHeader } from "../components/SectionHeader";

interface WorkFramingProps {
  readonly framing: FramingBlock;
}

/**
 * The block that makes the rest of the page honest, and the reason it sits between the
 * hero and the grid rather than under it: a reader has to know that nothing below has
 * been produced BEFORE they see eight covers under eight real titles. A footnote at the
 * bottom of a portfolio is a disclaimer; this is the page's actual position.
 *
 * Light, and directly on top of the grid's own light section on purpose. The two are one
 * continuous surface — a dark band between them would separate the statement from the
 * work it is a statement about.
 */
export function WorkFraming({ framing }: WorkFramingProps) {
  return (
    <Section ariaLabel={framing.heading}>
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-6">
            <SectionHeader eyebrow={framing.eyebrow} heading={framing.heading} className="" />
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            {framing.paragraphs.map((paragraph, index) => (
              <Reveal key={paragraph} index={index} staggerStepMs={60}>
                <p className={`text-body text-ink-70 ${index === 0 ? "" : "mt-5"}`}>{paragraph}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
