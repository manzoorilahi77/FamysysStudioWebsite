/**
 * A LEGAL DOCUMENT — the Terms & Conditions, the Privacy Policy — as structure rather than
 * as a wall of text.
 *
 * The shape is famysys.com's own, exactly: an eyebrow, a title and a one-sentence lead;
 * a row of facts about the document (when it took effect, when it was published, where
 * questions go, where to write); a numbered index; then the numbered sections, each a
 * heading over a run of paragraphs and bullet lists in whatever order the clause needs
 * them; and a closing line back to the list of all documents. The two documents share the
 * shape so one component renders both, and so the Studio's pages are the parent's pages —
 * the same company, the same way of setting out its terms, on either site.
 *
 * WHAT THIS TYPE DOES NOT KNOW. Whether a clause is the client's, adapted, or drafted
 * pending legal review. That is recorded where the strings are — as `TODO(client)` marks
 * in the content module and as a list in docs/content-todo.md — because it is a fact about
 * the words, not about the shape, and the shape is the one thing here that is settled.
 */

/** One run of prose, or one bulleted list. A section is a sequence of these. */
export type LegalBlock =
  | { readonly kind: "paragraph"; readonly text: string }
  | { readonly kind: "list"; readonly items: ReadonlyArray<string> };

export interface LegalSection {
  /** "01", "02" — rendered, so it is content rather than an index. */
  readonly number: string;
  readonly heading: string;
  readonly blocks: ReadonlyArray<LegalBlock>;
}

/**
 * The lines the document prints as its author's address. One line per element, with the
 * email separate because it is a link rather than a line of an address.
 */
export interface LegalContact {
  readonly name: string;
  readonly addressLines: ReadonlyArray<string>;
  readonly email: string;
}

/**
 * The words the page's chrome prints around a document — the same on both documents, so
 * they are one object rather than two copies. Every one of them is on famysys.com's page
 * in the same place; the exception is `status`, which labels the review line the Studio's
 * drafts carry and the parent's approved documents do not.
 */
export interface LegalPageLabels {
  /** The eyebrow over the title: "Legal". */
  readonly eyebrow: string;
  readonly effective: string;
  readonly published: string;
  readonly questions: string;
  readonly writeToUs: string;
  readonly status: string;
  readonly onThisPage: string;
  /** The closing line under the last section, which links to the index of documents. */
  readonly allDocuments: string;
}

export interface LegalDocument {
  /** The route the document lives at — "/terms" — so the index can link to it. */
  readonly href: string;
  readonly title: string;
  /** The one sentence under the title, saying what the document covers. */
  readonly lead: string;
  /** As printed — "31 August 2026" — rather than a Date, because it is a line of the document. */
  readonly effectiveDate: string;
  /** The day the wording was put on the page. The parent prints both dates; so do we. */
  readonly publishedDate: string;
  /**
   * A one-line status printed among the document's facts while it is unreviewed, or null
   * once it has been. The document is drafted against the parent company's and every
   * clause naming an entity, a place, a period or a practice is flagged for legal review;
   * a page that prints those clauses without saying so would be presenting a draft as a
   * commitment. Set it to null when the review is done — that is the whole edit.
   */
  readonly reviewStatus: string | null;
  readonly sections: ReadonlyArray<LegalSection>;
  readonly contact: LegalContact;
  readonly labels: LegalPageLabels;
}

/**
 * The copy of the index page at /legal — the page the closing line of every document
 * points at, listing each document with its lead and effective date. The list itself is
 * derived from the documents (see `GetLegalIndex`); this is only the page's own words.
 */
export interface LegalIndexCopy {
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  /** The label on each entry's link: "Read". */
  readonly readLabel: string;
}

/** One entry on the index page: the facts of a document that identify it in a list. */
export interface LegalIndexEntry {
  readonly href: string;
  readonly title: string;
  readonly lead: string;
  readonly effectiveDate: string;
  readonly effectiveLabel: string;
}

export interface LegalIndex {
  readonly copy: LegalIndexCopy;
  readonly entries: ReadonlyArray<LegalIndexEntry>;
}
