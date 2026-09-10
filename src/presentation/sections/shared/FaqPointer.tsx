import Link from "next/link";
import { Container } from "../../components/Container";
import { Eyebrow } from "../../components/Eyebrow";
import { Section } from "../../components/Section";

interface FaqPointerProps {
  readonly eyebrow: string;
  readonly heading: string;
  /** The group on /faq this page's questions sit in — "services-and-capability". */
  readonly group: string;
  readonly ariaLabel?: string;
}

/**
 * WHERE THE FAQ SECTION USED TO BE, A POINTER TO WHERE THE QUESTIONS WENT.
 *
 * Three inner pages carried four questions each under a heading of their own — "Questions
 * about these services.", "Questions about the process.", "Questions about engagements."
 * Those questions are on /faq now, all twelve, grouped and open, and this is what stands
 * in the section's place: the same eyebrow, the same heading, and an arrow. THE HEADING
 * IS THE LINK. It already names exactly what the reader will find, so a button under it
 * saying "See the questions" would say the same thing a second time in smaller type.
 *
 * It lands on the page's own group rather than at the top of /faq, because the reader
 * arrived from a page about services and should arrive at the questions about services.
 *
 * THE CONTENT IS THE SECTION'S OWN, unchanged: the eyebrow and heading each page already
 * had, edited in the panel under the same owner as before. The section was not deleted
 * from the page's content or from the CMS; it stopped rendering its questions here and
 * started pointing at them.
 *
 * No RevealHeading here, deliberately: it renders a block element, and a block inside an
 * anchor inside a heading is not valid HTML. The heading enters with the section instead.
 */
export function FaqPointer({ eyebrow, heading, group, ariaLabel }: FaqPointerProps) {
  return (
    <Section cmsSection="faq" ariaLabel={ariaLabel ?? heading}>
      <Container>
        <div className="faq-pointer">
          <Eyebrow>{eyebrow}</Eyebrow>
          {/* The link is INSIDE the heading, so the outline gains a section and the tab
              order gains one target. The arrow is part of the link's box, `aria-hidden`
              so the accessible name is the heading and nothing more, and it moves with
              the words on hover — see `.faq-pointer-link`. */}
          <h2 className="text-heading mt-4 font-medium text-ink">
            <Link href={`/faq#${group}`} className="faq-pointer-link">
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
