import type { LegalDocument } from "../../../domain/legal/entities/LegalDocument";
import {
  LEGAL_EFFECTIVE_DATE,
  LEGAL_PUBLISHED_DATE,
  LEGAL_REVIEW_STATUS,
  legalContact,
  legalLabels,
  list,
  p,
} from "./legalShared";

/**
 * TERMS & CONDITIONS, DRAFTED AGAINST famysys.com/legal/terms-and-conditions/.
 *
 * THE STRUCTURE IS THE PARENT'S EXACTLY: twelve numbered sections in its order, its
 * heading for each, and its way of setting a clause out — a run of short paragraphs, one
 * bulleted list where it has one. The two sites are the same company and their terms
 * should read as one family.
 *
 * THE WORDS ARE NOT COPIED, and the reason is in every clause that says "we". The parent's
 * document describes FAMYSYS — its entity, its jurisdiction, its contract form, the work it
 * has delivered. The Studio is a different arm, may be a different entity, and has
 * delivered nothing yet that a "case study" clause could truthfully describe. So each
 * clause was read against what THIS site actually is and does, kept where the two agree,
 * rewritten where they do not, and MARKED where the truth of it is something only the
 * client can supply — an entity, a place, a contract form, a jurisdiction.
 *
 * EVERY `TODO(client): legal review required` BELOW IS ALSO LISTED IN docs/content-todo.md,
 * under "Legal pages", with the same reasoning. Until each is resolved the page prints
 * `LEGAL_REVIEW_STATUS` under its date. Approving the documents is: resolve the marks,
 * set `reviewStatus` to null, and set the effective date.
 */
export const termsDocument: LegalDocument = {
  href: "/terms",
  title: "Terms & Conditions",
  lead: "The terms on which this website is published: what it is, how it may be used, how an enquiry is treated, and where the work itself is governed.",
  effectiveDate: LEGAL_EFFECTIVE_DATE,
  publishedDate: LEGAL_PUBLISHED_DATE,
  reviewStatus: LEGAL_REVIEW_STATUS,
  sections: [
    {
      number: "01",
      heading: "Who these terms are with",
      blocks: [
        // TODO(client): legal review required — legal entity. "Famysys Studio" here and in
        // every clause that says "we". See `legalContact` in legalShared.ts.
        p(
          'This website is published by Famysys Studio ("we", "us"). By using it you accept these terms. If you do not accept them, please do not use the site.',
        ),
        p(
          "These terms cover the website only. Work we do for a client is governed by the written agreement for that work, and where the two differ, that agreement wins.",
        ),
      ],
    },
    {
      number: "02",
      heading: "What this website is",
      blocks: [
        p(
          "The site describes what we make, how we work and who we are. It is information, not an offer: nothing here is a quote, a commitment to take on an engagement, or professional advice you should act on without talking to us first.",
        ),
        // TODO(client): legal review required — specific service. The parent's clause says
        // its case studies "describe work already delivered". The Studio's Selected Work
        // page describes eight PLANNED pieces, with stock frames standing in for work that
        // has not been produced, and says so on each one. This clause is rewritten to be
        // true of that page today; it will need rewriting again when the pieces exist.
        p(
          "The work shown on the site is described as what it is: pieces the studio has produced, or pieces it is producing, with any placeholder frame marked as one. Where the site describes an outcome it is describing that piece under its own conditions, not predicting an outcome for anyone else.",
        ),
      ],
    },
    {
      number: "03",
      heading: "Using the site",
      blocks: [
        p(
          "You may read, print and share what is published here for your own business purposes. You may not:",
        ),
        list([
          "copy the site's design, code or copy to publish as your own",
          "use automated tools in a way that degrades the site for other people",
          "attempt to reach any part of our systems you have not been given access to",
          "submit anything through our forms that is unlawful, misleading, or not yours to send",
        ]),
        // The parent says "named accounts". This site's panel has one shared password and
        // records every sign-in attempt, which is what the sentence now says — see the
        // Privacy Policy's security clause for the same fact stated from the other side.
        p(
          "The administration area of this site is for our own staff. Access is by password, and every attempt to sign in is recorded.",
        ),
      ],
    },
    {
      number: "04",
      heading: "Sending us an enquiry",
      blocks: [
        p(
          "The contact form is the way to start a conversation, and it is not a secure channel. Please do not send confidential information, personal data about other people, or anything covered by an obligation of confidence through it — tell us what you need and we will agree a route for the detail.",
        ),
        p(
          "Sending an enquiry does not create a contract, an engagement or a duty of confidence on our part. It also does not put you on a mailing list: we reply to what you sent, and how long the enquiry is kept is set out in our Privacy Policy.",
        ),
      ],
    },
    {
      number: "05",
      heading: "Engagements are governed by their own contract",
      blocks: [
        // TODO(client): legal review required — specific service / contract form. The
        // parent's clause names "a master agreement with a statement of work under it".
        // The Studio's own pages describe a written scope and a quotation against it (see
        // /ways-to-work-with-us, "What happens before a quotation") and nothing beyond
        // that. This says what the site says; whether there is a master agreement behind
        // it is for the client to confirm.
        p(
          "Any work we do is scoped, quoted and governed by a separate written agreement — a written scope, a quotation against it, and the agreement that follows. That agreement is where deliverables, timelines, fees, confidentiality, data protection, ownership of what we make for you and liability are decided.",
        ),
        p(
          "Where this site describes how we work, it is describing our normal practice. The contract states what we owe you.",
        ),
      ],
    },
    {
      number: "06",
      heading: "Ownership of what is on this site",
      blocks: [
        // "Typefaces", plural, and it is true: Jost and Instrument Serif are both under the
        // SIL Open Font License and both are served from this site.
        p(
          "The words, design, code, marks and images on this site belong to us or to the people who licensed them to us, except where the site says otherwise. The typefaces are used under their own open licences.",
        ),
        p(
          "Nothing here transfers any of that to a visitor. Ownership of work we produce under an engagement is decided by that engagement's contract, not by this page.",
        ),
      ],
    },
    {
      number: "07",
      heading: "Links to other sites",
      blocks: [
        p(
          "Where we link to somebody else's site, we are pointing at it, not vouching for it. What happens on that site — including what it does with your data — is between you and whoever runs it.",
        ),
      ],
    },
    {
      number: "08",
      heading: "Availability",
      blocks: [
        p(
          "We keep the site running and up to date as best we reasonably can. We do not promise it will be uninterrupted, that every page will be free of error, or that it will stay the same: pages, services and copy change, and parts may be withdrawn without notice.",
        ),
      ],
    },
    {
      number: "09",
      heading: "Liability",
      blocks: [
        // TODO(client): legal review required — jurisdiction. What can and cannot be
        // limited is a matter of the law that applies, and the law that applies is the
        // open question in section 11. The wording is the parent's; whether it holds for
        // the Studio's jurisdiction is for the review.
        p(
          "Nothing in these terms limits any liability that cannot lawfully be limited, including liability for death or personal injury caused by negligence, or for fraud.",
        ),
        p(
          "Subject to that, we are not liable for business losses arising from your use of this website — lost profit, lost revenue, lost data, lost opportunity, or losses that were not reasonably foreseeable. Liability arising from work we carry out for a client is dealt with in that engagement's contract, which is where the limits and the cover are actually agreed.",
        ),
      ],
    },
    {
      number: "10",
      heading: "Changes to these terms",
      blocks: [
        p(
          "We update these terms when the site or the way we work changes. The version on this page is the one that applies, and the effective date is shown with it. Continuing to use the site after an update means you accept the updated terms.",
        ),
      ],
    },
    {
      number: "11",
      heading: "Governing law and disputes",
      blocks: [
        // TODO(client): legal review required — jurisdiction. The parent's clause defers
        // to "the jurisdiction in which FAMYSYS is established", which is a real answer
        // for the parent and an open question for the Studio: the address the site prints
        // is in Texas, the parent works across the United States and India, and nothing
        // says where the Studio is established. Naming a state or a country here is the
        // single most consequential line in the document and is not guessed.
        p(
          "These terms, and any dispute arising from them or from your use of this site, are governed by the law of the jurisdiction in which Famysys Studio is established, and the courts of that jurisdiction have exclusive jurisdiction.",
        ),
      ],
    },
    {
      number: "12",
      heading: "How to contact us",
      blocks: [
        // The address block itself is rendered from `contact` below, after this line.
        p("Questions about these terms, and any legal notice about them, go to the address shown with this document."),
      ],
    },
  ],
  contact: legalContact,
  labels: legalLabels,
};
