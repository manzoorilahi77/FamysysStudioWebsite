import type { SectionIntro } from "../../domain/marketing/entities/SectionIntro";
import type { CaseStudyView } from "../lib/viewModels";
import { CaseStudyCard } from "../components/CaseStudyCard";
import { Container } from "../components/Container";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";

interface SelectedWorkProps {
  readonly intro: SectionIntro;
  readonly caseStudies: ReadonlyArray<CaseStudyView>;
}

export function SelectedWork({ intro, caseStudies }: SelectedWorkProps) {
  return (
    <Section ariaLabel={intro.heading}>
      <Container>
        <div className="mx-auto max-w-[46ch] text-center">
          <h2 className="text-display-l font-medium text-ink">{intro.heading}</h2>
          <p className="text-lead mt-6 text-ink-70">{intro.body}</p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {caseStudies.map((caseStudy, index) => (
            <Reveal key={caseStudy.slug} index={index % 8} staggerStepMs={40}>
              <CaseStudyCard caseStudy={caseStudy} />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
