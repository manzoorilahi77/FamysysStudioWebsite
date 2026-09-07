import type { ScopeBlock } from "../../../domain/process/entities/HowWeWorkPage";
import { motion } from "../../../shared/design/tokens";
import { Container } from "../../components/Container";
import { Reveal } from "../../components/Reveal";
import { Section } from "../../components/Section";
import { SectionHeader } from "../../components/SectionHeader";

interface ScopeAndRevisionsProps {
  readonly scope: ScopeBlock;
}

/**
 * The Refine step says feedback is incorporated "within the agreed scope". Every prospect
 * wants to know where that line sits and almost nobody puts it on a page, so this section
 * answers it plainly: how scope is set, what a round covers, what counts as new work, and
 * what happens when the requirement moves.
 *
 * Four topics on hairlines rather than in cards. Cards would have said "four features";
 * the rules say "four parts of one answer", which is what this is.
 */
export function ScopeAndRevisions({ scope }: ScopeAndRevisionsProps) {
  return (
    <Section ariaLabel={scope.heading}>
      <Container>
        <SectionHeader eyebrow={scope.eyebrow} heading={scope.heading} body={scope.body} />

        <div className="scope-grid mt-14">
          {scope.topics.map((topic, index) => (
            <Reveal key={topic.title} index={index} staggerStepMs={motion.stagger.rowStepMs}>
              <div className="scope-topic">
                <h3 className="text-display-s font-medium text-ink">{topic.title}</h3>
                <p className="text-body mt-3 text-ink-70" style={{ maxWidth: "58ch" }}>
                  {topic.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
