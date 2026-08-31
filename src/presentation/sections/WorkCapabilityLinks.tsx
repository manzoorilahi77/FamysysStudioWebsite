import Link from "next/link";
import type { CapabilityCrossLink } from "../../domain/portfolio/entities/SelectedWorkPage";
import { Container } from "../components/Container";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";
import { SectionHeader } from "../components/SectionHeader";

interface WorkCapabilityLinksProps {
  readonly crossLink: CapabilityCrossLink;
}

/**
 * The path out. A reader who has just worked through eight pieces is one step from
 * asking what the studio actually sells, and this is the only place on the page that
 * answers it — every fragment resolves to a section that already exists on
 * /creative-services, and the test asserts that rather than trusting the string.
 */
export function WorkCapabilityLinks({ crossLink }: WorkCapabilityLinksProps) {
  return (
    <Section ariaLabel={crossLink.heading}>
      <Container>
        <SectionHeader
          eyebrow={crossLink.eyebrow}
          heading={crossLink.heading}
          body={crossLink.body}
        />
        <ul className="capability-links mt-12">
          {crossLink.links.map((link, index) => (
            <li key={link.href}>
              <Reveal index={index} staggerStepMs={60}>
                <Link href={link.href} className="capability-link">
                  <span className="text-display-s font-medium text-ink">{link.title}</span>
                  <span aria-hidden="true" className="capability-link-arrow text-ink-70">
                    &rarr;
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
