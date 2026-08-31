import type { WorkedExample as WorkedExampleContent } from "../../domain/process/entities/HowWeWorkPage";
import { motion } from "../../shared/design/tokens";
import { Container } from "../components/Container";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";
import { SectionHeader } from "../components/SectionHeader";

interface WorkedExampleProps {
  readonly example: WorkedExampleContent;
}

/**
 * The same five steps again, but as one project rather than as a description. It takes a
 * vertical rail — step name in a fixed left column, narrative beside it — rather than
 * another image/copy split, so it reads as a walk down the sequence instead of a sixth
 * step block.
 *
 * The block is dark and carries no accent-coloured text, so it keeps `Section`'s entry
 * fade: canvas and canvas-80 both hold above 4.5:1 against the fade's start value.
 *
 * `illustrativeNote` is rendered, not commented. The piece has not been produced and the
 * client in it does not exist; a reader who takes this for a case study has been misled,
 * and a comment in the source does not reach them.
 */
export function WorkedExample({ example }: WorkedExampleProps) {
  return (
    <Section dark ariaLabel={example.heading}>
      <Container>
        <SectionHeader
          eyebrow={example.eyebrow}
          heading={example.heading}
          body={example.illustrativeNote}
          dark
        />

        <p className="text-display-s mt-12 font-medium text-canvas">{example.pieceTitle}</p>
        <p className="text-body mt-2 text-canvas-80">{example.pieceDescription}</p>

        <ol className="mt-10 list-none">
          {example.stages.map((stage, index) => (
            // The Reveal div sits inside the li, not around it: a div between ol and li
            // is invalid, and the browser's error recovery moves it out of the list.
            <li key={stage.stepTitle} className="example-stage">
              <Reveal index={index} staggerStepMs={motion.stagger.rowStepMs}>
                <p className="example-stage-label">
                  {/* Decorative: the <ol> already carries the ordinal, and the overview
                      bar above carries it a second time. */}
                  <span
                    className="example-stage-numeral decorative-numeral tabular"
                    aria-hidden="true"
                    data-numeral={String(index + 1).padStart(2, "0")}
                  />
                  <span className="text-body font-medium text-canvas">{stage.stepTitle}</span>
                </p>
              </Reveal>
              <Reveal index={index} staggerStepMs={motion.stagger.rowStepMs}>
                <p className="text-body text-canvas-80" style={{ maxWidth: "62ch" }}>
                  {stage.text}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
