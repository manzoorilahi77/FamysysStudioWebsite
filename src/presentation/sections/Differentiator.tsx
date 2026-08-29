import type { DifferentiatorBlock } from "../../domain/marketing/entities/DifferentiatorBlock";
import { spacing } from "../../shared/design/tokens";
import { Container } from "../components/Container";
import { Reveal } from "../components/Reveal";
import { RevealHeading } from "../components/RevealHeading";
import { Section } from "../components/Section";
import { SectionHeader } from "../components/SectionHeader";

interface DifferentiatorProps {
  readonly differentiator: DifferentiatorBlock;
}

/**
 * Asymmetric split rather than an even grid: the header holds a narrow left column and
 * the four elements stack down a wider one, offset a column from it. Nine sections all
 * shaped heading-then-grid is what made the page read as uniform, so the sections whose
 * content has a natural shape — a split, a sequence, a list of rows — now take it.
 */
export function Differentiator({ differentiator }: DifferentiatorProps) {
  return (
    <Section ariaLabel={differentiator.heading}>
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-5">
            <SectionHeader
              className=""
              heading={differentiator.heading}
              body={differentiator.body}
              leadIn={differentiator.leadIn}
              accent={["creativity,"]}
            />
          </div>

          <div className="flex flex-col gap-4 lg:col-span-6 lg:col-start-7">
            {differentiator.elements.map((element, index) => (
              <Reveal key={element.title} index={index} staggerStepMs={60}>
                <div className="card-surface p-8">
                  <p className="text-display-s font-medium text-ink">{element.title}</p>
                  <p className="text-body mt-3 text-ink-70">{element.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* One of the page's two centred moments: the thesis, at display size, standing
            alone with the statement measure of space around it. Everything else on the
            page is flush left, which is what lets this one land. */}
        <div style={{ marginTop: spacing.statement }}>
          <RevealHeading
            as="p"
            className="text-display-l mx-auto max-w-[24ch] text-center font-medium text-balance text-ink"
            accent={["advantage", "identity."]}
          >
            {differentiator.closingStatement}
          </RevealHeading>
        </div>
      </Container>
    </Section>
  );
}
