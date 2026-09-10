import type {
  LegalBlock,
  LegalContact,
  LegalIndexCopy,
  LegalPageLabels,
} from "../../../domain/legal/entities/LegalDocument";
import { footerContent } from "./marketing.content";

/** A paragraph block, so a section's body reads as prose in the content file. */
export function p(text: string): LegalBlock {
  return { kind: "paragraph", text };
}

/** A bulleted list block. */
export function list(items: ReadonlyArray<string>): LegalBlock {
  return { kind: "list", items };
}

/**
 * The name and address both documents sign off with, READ FROM THE FOOTER rather than
 * typed a second time. The footer's address and email are already flagged for
 * confirmation; a copy here would be a second place for the same fact to be wrong.
 *
 * TODO(client): legal review required — legal entity. "Famysys Studio" is the trading
 * name the site uses; whether the Studio is its own legal entity or an arm of FAMYSYS,
 * and which name a contract or a legal notice should be addressed to, is not stated
 * anywhere in the brief. Both documents put this name on every clause that says "we".
 *
 * TODO(client): legal review required — address. This is the footer's address, supplied
 * by the client, and the footer's own note records that its ZIP (77447) differs from the
 * one famysys.com prints for the same street (77407). A legal notice sent to the wrong
 * ZIP is a legal notice not received.
 */
export const legalContact: LegalContact = {
  name: "Famysys Studio",
  addressLines: footerContent.addressLines ?? [],
  email: footerContent.contactEmail,
};

/**
 * TODO(client): legal review required — effective date. Today's date, as the date the
 * drafts were written. It becomes the real effective date when the review is done and
 * the documents are published, and should be changed then rather than left.
 */
export const LEGAL_EFFECTIVE_DATE = "10 September 2026";

/**
 * The day the wording went on the page. The parent prints "Published" beside "Effective"
 * and the two are the same day there too. Change it with the effective date at review.
 */
export const LEGAL_PUBLISHED_DATE = LEGAL_EFFECTIVE_DATE;

/**
 * Printed among the document's facts until the review is done, and then removed by
 * setting `reviewStatus` to null. See `LegalDocument.reviewStatus`.
 */
export const LEGAL_REVIEW_STATUS = "Draft — pending legal review.";

/**
 * The words around a document, as famysys.com prints them in the same places. One object
 * for both documents: the chrome is the page's, not the document's.
 */
export const legalLabels: LegalPageLabels = {
  eyebrow: "Legal",
  effective: "Effective",
  published: "Published",
  questions: "Questions",
  writeToUs: "Write to us",
  status: "Status",
  onThisPage: "On this page",
  allDocuments: "All legal documents",
};

/**
 * The index page at /legal, which the closing line of both documents points at. The
 * title and lead are the parent's for its own index; both are true of the Studio's two
 * documents as well, so they are kept rather than redrafted.
 */
export const legalIndexCopy: LegalIndexCopy = {
  eyebrow: "Legal",
  title: "The terms we publish, in full.",
  lead: "What governs your use of this site, and what happens to anything you send us through it. Each document states the day its wording takes effect.",
  readLabel: "Read",
};
