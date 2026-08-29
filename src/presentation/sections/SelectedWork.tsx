import type { SectionIntro } from "../../domain/marketing/entities/SectionIntro";
import type { CaseStudyView } from "../lib/viewModels";
import { CaseStudyCard } from "../components/CaseStudyCard";
import { Container } from "../components/Container";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";
import { SectionHeader } from "../components/SectionHeader";

interface SelectedWorkProps {
  readonly intro: SectionIntro;
  readonly caseStudies: ReadonlyArray<CaseStudyView>;
}

// Two tiles a row at desktop with the ratios cycling, so no two rows are the same
// height. A portfolio grid should not march.
const ASPECT_RATIOS = ["4 / 3", "3 / 4", "1 / 1", "4 / 3", "3 / 4", "4 / 3", "1 / 1", "3 / 4"];

export function SelectedWork({ intro, caseStudies }: SelectedWorkProps) {
  return (
    <Section ariaLabel={intro.heading} className="work-section">
      <Container>
        <SectionHeader heading={intro.heading} body={intro.body} />
        {/* The first tile runs out to the viewport edge — see .work-bleed. */}
        <div className="mt-14 grid items-start gap-8 md:grid-cols-2">
          {caseStudies.map((caseStudy, index) => (
            <Reveal
              key={caseStudy.slug}
              index={index % 2}
              staggerStepMs={60}
              className={index === 0 ? "work-bleed" : ""}
            >
              <CaseStudyCard
                caseStudy={caseStudy}
                aspectRatio={ASPECT_RATIOS[index] ?? "4 / 3"}
                isPriority={index === 0}
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
