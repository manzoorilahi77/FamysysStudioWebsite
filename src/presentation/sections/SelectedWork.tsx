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

export function SelectedWork({ intro, caseStudies }: SelectedWorkProps) {
  return (
    <Section ariaLabel={intro.heading}>
      <Container>
        <SectionHeader heading={intro.heading} body={intro.body} />
        {/* Bento stays here: these tiles carry media and genuinely differ. */}
        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {caseStudies.map((caseStudy, index) => (
            <Reveal key={caseStudy.slug} index={index % 8} staggerStepMs={60}>
              <CaseStudyCard caseStudy={caseStudy} />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
