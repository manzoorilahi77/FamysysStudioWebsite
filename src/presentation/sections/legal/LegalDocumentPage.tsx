import Link from "next/link";
import type { LegalBlock, LegalDocument } from "../../../domain/legal/entities/LegalDocument";
import { Container } from "../../components/Container";
import { LegalIndex } from "./LegalIndex";

interface LegalDocumentPageProps {
  readonly document: LegalDocument;
}

/**
 * A LEGAL DOCUMENT, SET EXACTLY AS famysys.com SETS ITS OWN.
 *
 * The client's direction for these two pages is that they should be the parent site's
 * pages — open /terms here and /legal/terms-and-conditions/ there and see the same page.
 * So this component reproduces famysys.com's markup for a legal document element for
 * element, and the `.legal*` rules in globals.css reproduce its measurements: the same
 * head (eyebrow with its 7px marker, title, lead, a row of facts under a hairline), the
 * same two-column body from lg (a sticky numbered index on a 15rem track, the article on
 * a 68ch measure), the same section anatomy (a hairline, the number in the label face
 * beside the heading, paragraphs at 1.75 leading, 5px accent squares for bullets), and
 * the same closing line — a short rule that grows on hover, then "All legal documents".
 *
 * MOTION IS THE PARENT'S TOO, WHICH IS TO SAY ALMOST NONE. famysys.com's legal pages have
 * no entrance animation and no scroll-triggered reveal; what moves is the colour of a
 * link over 300ms on the brand curve and the closing rule's scale on hover. An earlier
 * version of this page faded each section up on a stagger; that is gone, because it was
 * not on the parent's page and the brief is sameness.
 *
 * TWO ADDITIONS, both at the client's direction. The index marks the clause the reader is
 * in — see LegalIndex — and the review-status line: the Studio's documents are drafts pending
 * legal review and the page has to say so. It is printed as a fifth fact in the row —
 * "Status · Draft — pending legal review." — in the accent, so it sits where the parent's
 * facts sit rather than anywhere the parent has nothing. It disappears when
 * `reviewStatus` is set to null at approval.
 *
 * Section ids are the parent's: the heading slugified, so `/terms#liability` resolves on
 * both sites.
 */
export function LegalDocumentPage({ document }: LegalDocumentPageProps) {
  const { labels } = document;

  return (
    <div className="legal">
      <Container className="legal-head">
        <p className="legal-eyebrow label">
          <span className="legal-eyebrow-mark" aria-hidden="true" />
          {labels.eyebrow}
        </p>
        <h1 className="legal-title">{document.title}</h1>
        <p className="legal-lead">{document.lead}</p>

        <dl className="legal-facts">
          <div>
            <dt className="label">{labels.effective}</dt>
            <dd className="text-body">
              <time>{document.effectiveDate}</time>
            </dd>
          </div>
          <div>
            <dt className="label">{labels.published}</dt>
            <dd className="text-body">
              <time>{document.publishedDate}</time>
            </dd>
          </div>
          <div>
            <dt className="label">{labels.questions}</dt>
            <dd className="text-body">
              <a href={`mailto:${document.contact.email}`} className="legal-email">
                {document.contact.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="label">{labels.writeToUs}</dt>
            <dd className="text-body">
              <address className="legal-address">
                {document.contact.addressLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </address>
            </dd>
          </div>
          {document.reviewStatus ? (
            <div>
              <dt className="label">{labels.status}</dt>
              <dd className="text-body legal-review-status">{document.reviewStatus}</dd>
            </div>
          ) : null}
        </dl>
      </Container>

      <Container className="legal-body">
        <div className="legal-grid">
          <LegalIndex
            label={labels.onThisPage}
            entries={document.sections.map((section) => ({
              number: section.number,
              heading: section.heading,
              id: sectionId(section.heading),
            }))}
          />

          <article className="legal-article">
            {document.sections.map((section) => (
              <section
                key={section.number}
                id={sectionId(section.heading)}
                aria-labelledby={`legal-${section.number}`}
                className="legal-section"
              >
                <h2 id={`legal-${section.number}`} className="legal-heading text-display-s">
                  <span className="label legal-heading-number" aria-hidden="true">
                    {section.number}
                  </span>
                  <span className="legal-heading-text">
                    <span className="sr-only">{section.number}. </span>
                    {section.heading}
                  </span>
                </h2>
                <div className="legal-blocks">
                  <Blocks blocks={section.blocks} />
                </div>
              </section>
            ))}

            <p className="legal-closing">
              <Link href="/legal" className="label legal-closing-link">
                <span className="legal-closing-rule" aria-hidden="true" />
                {labels.allDocuments}
              </Link>
            </p>
          </article>
        </div>
      </Container>
    </div>
  );
}

/**
 * The parent's anchor for a section is its heading slugified — `#liability`,
 * `#who-these-terms-are-with` — so a link into one site's document lands on the same
 * clause in the other's. The ampersand is dropped rather than spelt, as the site's other
 * slugs do.
 */
function sectionId(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/&/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function Blocks({ blocks }: { readonly blocks: ReadonlyArray<LegalBlock> }) {
  return (
    <>
      {blocks.map((block, index) =>
        block.kind === "paragraph" ? (
          <p key={index} className="text-body legal-prose">
            {block.text}
          </p>
        ) : (
          <ul key={index} className="legal-list">
            {block.items.map((item) => (
              <li key={item} className="text-body legal-prose">
                <span className="legal-bullet" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ),
      )}
    </>
  );
}
