import type { ScopingBlock as ScopingBlockContent } from "../../domain/engagement/entities/WaysToWorkPage";
import { motion } from "../../shared/design/tokens";
import { Container } from "../components/Container";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";
import { SectionHeader } from "../components/SectionHeader";

interface ScopingBlockProps {
  readonly scoping: ScopingBlockContent;
}

/**
 * The brief says every engagement is scoped around the actual requirement, which is the
 * reason there is no price on this page. That is only a satisfying answer if the reader
 * can see what scoping actually involves — so this says what happens, what is needed from
 * them and what comes back.
 *
 * It states no duration anywhere, on purpose. A turnaround written here becomes a promise
 * the brief never made, and this is the page a prospect would quote back.
 *
 * Dark, and carrying no accent text, so it keeps `Section`'s entry fade: canvas and
 * canvas-80 both hold above 4.5:1 against the fade's start value.
 */
export function ScopingBlock({ scoping }: ScopingBlockProps) {
  return (
    <Section dark ariaLabel={scoping.heading}>
      <Container>
        <SectionHeader
          eyebrow={scoping.eyebrow}
          heading={scoping.heading}
          body={scoping.body}
          dark
        />

        <div className="scoping-grid mt-14">
          {scoping.steps.map((step, index) => (
            <Reveal key={step.title} index={index} staggerStepMs={motion.stagger.rowStepMs}>
              <div className="scoping-step">
                <h3 className="text-display-s font-medium text-canvas">{step.title}</h3>
                <p className="text-body mt-3 text-canvas-80" style={{ maxWidth: "58ch" }}>
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
