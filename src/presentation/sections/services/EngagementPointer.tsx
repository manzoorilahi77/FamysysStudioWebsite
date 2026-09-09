import Link from "next/link";
import type { EngagementSummary } from "../../../domain/services/entities/CreativeServicesPage";
import { motion } from "../../../shared/design/tokens";
import { Container } from "../../components/Container";
import { Reveal } from "../../components/Reveal";
import { Section } from "../../components/Section";
import { SectionHeader } from "../../components/SectionHeader";
import type { CtaView } from "../../lib/viewModels";

interface EngagementPointerProps {
  readonly eyebrow: string;
  readonly heading: string;
  readonly body: string;
  readonly summaries: ReadonlyArray<EngagementSummary>;
  readonly cta: CtaView;
}

/**
 * A pointer, not a repeat. Each tier gets its name and one line and nothing else — the
 * summary, the "ideal for" and the "typical work" all live on Ways to Work With Us, and
 * restating them here would create a second copy to keep in sync and give the reader no
 * reason to follow the link.
 *
 * Four rows on a hairline rather than four cards: cards would look like the homepage's
 * tier grid and imply this is the full treatment.
 */
export function EngagementPointer({
  eyebrow,
  heading,
  body,
  summaries,
  cta,
}: EngagementPointerProps) {
  // fade={false}: the trailing link is accent-on-dark — see Section.
  return (
    <Section dark fade={false} ariaLabel={heading}>
      <Container>
        <SectionHeader eyebrow={eyebrow} heading={heading} body={body} dark />

        <ul className="mt-14 border-t border-canvas-16">
          {summaries.map((summary, index) => (
            // The Reveal div sits inside the li, not around it: a div between ul and li
            // is invalid, and the browser's error recovery moves it out of the list.
            <li key={summary.name} className="border-b border-canvas-16">
              <Reveal index={index} staggerStepMs={motion.stagger.rowStepMs}>
                <div className="grid gap-2 py-6 md:grid-cols-12 md:gap-6">
                  <p className="text-display-s font-medium text-canvas md:col-span-4">
                    {summary.name}
                  </p>
                  <p className="text-body text-canvas-80 md:col-span-8">{summary.line}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>

        <Link
          href={cta.href}
          className="inline-link text-small mt-10 inline-block font-medium text-accent-on-dark"
        >
          {cta.label} &rarr;
        </Link>
      </Container>
    </Section>
  );
}
