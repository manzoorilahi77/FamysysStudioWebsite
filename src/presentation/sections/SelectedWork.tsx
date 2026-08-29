import type { CaseStudyView, WorkSectionView } from "../lib/viewModels";
import { Button } from "../components/Button";
import { CaseStudyCard } from "../components/CaseStudyCard";
import { Container } from "../components/Container";
import { Eyebrow } from "../components/Eyebrow";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";

interface SelectedWorkProps {
  readonly work: WorkSectionView;
  readonly caseStudies: ReadonlyArray<CaseStudyView>;
}

export function SelectedWork({ work, caseStudies }: SelectedWorkProps) {
  return (
    <Section ariaLabel={work.intro.heading}>
      <Container>
        <div className="mx-auto max-w-[40ch] text-center">
          <Eyebrow>{work.intro.eyebrow}</Eyebrow>
          <h2 className="text-display-l mt-4 font-medium text-ink">{work.intro.heading}</h2>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {caseStudies.map((caseStudy, index) => (
            <Reveal key={caseStudy.slug} index={index % 6} staggerStepMs={40}>
              <CaseStudyCard caseStudy={caseStudy} stagger={index % 3 === 1} />
            </Reveal>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Button cta={work.exploreCta} variant="ghost" />
        </div>
      </Container>
    </Section>
  );
}
