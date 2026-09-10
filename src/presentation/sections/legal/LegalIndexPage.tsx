import Link from "next/link";
import type { LegalIndex } from "../../../domain/legal/entities/LegalDocument";
import { Container } from "../../components/Container";

interface LegalIndexPageProps {
  readonly index: LegalIndex;
}

/**
 * THE LIST OF LEGAL DOCUMENTS AT /legal, AS famysys.com/legal/ SETS IT.
 *
 * Each document's closing line says "All legal documents" and points here, as the
 * parent's does; a closing line that pointed nowhere would have been the one thing on
 * the page that was not the parent's. The page is the parent's: the same head as a
 * document's, then a hairlined list with the effective date in the label face on the
 * left and the title, lead and a "Read" line on the right. The whole row is the link, and
 * hovering it colours the title and grows the rule beside "Read" — the same two
 * transitions the documents use, and the only motion on the page.
 */
export function LegalIndexPage({ index }: LegalIndexPageProps) {
  return (
    <div className="legal">
      <Container className="legal-head legal-head--index">
        <p className="legal-eyebrow label">
          <span className="legal-eyebrow-mark" aria-hidden="true" />
          {index.copy.eyebrow}
        </p>
        <h1 className="legal-title legal-title--index">{index.copy.title}</h1>
        <p className="legal-lead">{index.copy.lead}</p>
      </Container>

      <Container className="legal-body">
        <ol className="legal-docs">
          {index.entries.map((entry) => (
            <li key={entry.href} className="legal-doc">
              <Link href={entry.href} className="legal-doc-link">
                <div className="legal-doc-when">
                  <time className="label">
                    {entry.effectiveLabel} {entry.effectiveDate}
                  </time>
                </div>
                <div className="legal-doc-body">
                  <h2 className="legal-doc-title text-display-s">{entry.title}</h2>
                  <p className="legal-doc-lead text-body">{entry.lead}</p>
                  <p className="label legal-doc-read">
                    {index.copy.readLabel}
                    <span className="legal-closing-rule legal-closing-rule--after" aria-hidden="true" />
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </Container>
    </div>
  );
}
