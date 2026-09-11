import Link from "next/link";
import { Container } from "../../components/Container";
import { Eyebrow } from "../../components/Eyebrow";
import { Section } from "../../components/Section";
import type { CtaView } from "../../lib/viewModels";

interface ProcessPointerLinkProps {
  readonly eyebrow: string;
  readonly heading: string;
  readonly cta: CtaView;
}

/**
 * WHERE THE FIVE-STEP SCROLL-PINNED SEQUENCE USED TO BE. This page is not about
 * process — it links to `/how-we-work` anyway — so the section that used to spend
 * roughly two screens of pinned scroll on it is now a heading-as-link, exactly the
 * shape `FaqPointer` already uses one section down. `cmsSection="process-pointer"`
 * is the same id `HowWeWork` rendered here before, so the CMS preview and
 * `e2e/06-section-anchors.spec.ts` need no change.
 */
export function ProcessPointerLink({ eyebrow, heading, cta }: ProcessPointerLinkProps) {
  return (
    <Section cmsSection="process-pointer" ariaLabel={heading}>
      <Container>
        <div className="faq-pointer">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="text-heading mt-4 font-medium text-ink">
            <Link href={cta.href} className="faq-pointer-link">
              <span className="faq-pointer-heading">{heading}</span>
              <span className="faq-pointer-arrow" aria-hidden="true">
                &rarr;
              </span>
            </Link>
          </h2>
        </div>
      </Container>
    </Section>
  );
}
