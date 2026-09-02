import type { SectionIntro } from "../../domain/marketing/entities/SectionIntro";
import type { CaseStudyView } from "../lib/viewModels";
import { CaseStudyCard } from "../components/CaseStudyCard";
import { Container } from "../components/Container";
import { Section } from "../components/Section";
import { SectionHeader } from "../components/SectionHeader";

interface SelectedWorkProps {
  readonly intro: SectionIntro;
  readonly caseStudies: ReadonlyArray<CaseStudyView>;
}

/**
 * Two tiles a row, every tile the same shape.
 *
 * The ratios used to cycle — 4:3, 3:4, 1:1 — so that no two rows were the same height. On
 * paper that is editorial; on the page it was a grid with holes in it, and it needed a
 * capped media height to stop the worst pairings running to 1.8x each other. Both the
 * cycle and its patch are gone. See `CaseStudyCard`.
 *
 * The reveal moved onto the card too. `Reveal` fades and lifts whatever is inside it,
 * which is the right default for a paragraph and the wrong one for a photograph in a
 * frame: the card wipes its frame open and settles the image inside it, which needs the
 * two to be driven from one observer rather than from a wrapper around both.
 */
export function SelectedWork({ intro, caseStudies }: SelectedWorkProps) {
  return (
    <Section ariaLabel={intro.heading} className="work-section">
      <Container>
        <SectionHeader split heading={intro.heading} body={intro.body} />
        {/* Row order — 01 02 on the first row, 03 04 on the second. */}
        <div className="work-grid mt-14">
          {caseStudies.map((caseStudy, index) => (
            <CaseStudyCard
              key={caseStudy.slug}
              caseStudy={caseStudy}
              index={index}
              isPriority={index === 0}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}
