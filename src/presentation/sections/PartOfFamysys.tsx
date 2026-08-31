import type { EcosystemBlock } from "../../domain/about/entities/AboutPage";
import { Container } from "../components/Container";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";
import { SectionHeader } from "../components/SectionHeader";

interface PartOfFamysysProps {
  readonly ecosystem: EcosystemBlock;
}

/**
 * The relationship to the parent, and nothing more.
 *
 * Short on purpose. Establishing that the studio is backed by an existing business is
 * useful; going further would mean describing work the studio did not do, which is the
 * borrowed credibility the rest of this page is written to avoid. The third paragraph
 * says so in visible copy rather than leaving it as a discipline someone has to
 * remember.
 *
 * The link leaves the site, so it carries `target="_blank"`, `rel="noopener noreferrer"`
 * and an announced "(opens in a new tab)" — a sighted reader gets the arrow glyph, a
 * screen-reader user gets the words, and nobody gets only the visual cue.
 */
export function PartOfFamysys({ ecosystem }: PartOfFamysysProps) {
  return (
    <Section ariaLabel={ecosystem.heading}>
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-5">
            <SectionHeader eyebrow={ecosystem.eyebrow} heading={ecosystem.heading} className="" />
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            {ecosystem.paragraphs.map((paragraph, index) => (
              <Reveal key={paragraph} index={index} staggerStepMs={60}>
                <p className={`text-body text-ink-70 ${index === 0 ? "" : "mt-5"}`}>{paragraph}</p>
              </Reveal>
            ))}
            <Reveal index={ecosystem.paragraphs.length} staggerStepMs={60}>
              <a
                href={ecosystem.link.href.value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-small mt-8 inline-block font-medium text-accent"
              >
                {ecosystem.link.label.value}
                <span aria-hidden="true"> &#8599;</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
