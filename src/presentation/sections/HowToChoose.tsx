import Link from "next/link";
import type { HowToChoose as HowToChooseContent } from "../../domain/engagement/entities/WaysToWorkPage";
import { motion } from "../../shared/design/tokens";
import { Container } from "../components/Container";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";
import { SectionHeader } from "../components/SectionHeader";

interface HowToChooseProps {
  readonly howToChoose: HowToChooseContent;
}

/**
 * Self-selection, not qualification. Every question is one a visitor answers about their
 * own situation — how much they need, how often, in how many formats — and every answer
 * resolves to exactly one engagement and links straight to its block. A question that
 * ended "talk to us to find out" would be sales copy wearing the shape of help.
 *
 * Rows on hairlines rather than cards: this is one argument in four parts, not four
 * offers to compare. The comparison above is where comparing happens.
 */
export function HowToChoose({ howToChoose }: HowToChooseProps) {
  return (
    <Section ariaLabel={howToChoose.heading}>
      <Container>
        <SectionHeader
          eyebrow={howToChoose.eyebrow}
          heading={howToChoose.heading}
          body={howToChoose.body}
        />

        <div className="mt-14">
          {howToChoose.questions.map((entry, index) => (
            <Reveal
              key={entry.question}
              index={index}
              staggerStepMs={motion.stagger.rowStepMs}
              className="choice-row"
            >
              <h3 className="text-display-s font-medium text-ink">{entry.question}</h3>
              <div>
                <p className="text-body text-ink-70" style={{ maxWidth: "56ch" }}>
                  {entry.answer}
                </p>
                <Link
                  href={`#${entry.tierSlug}`}
                  className="text-small mt-4 inline-block font-medium text-accent"
                >
                  {entry.tierName} &rarr;
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
