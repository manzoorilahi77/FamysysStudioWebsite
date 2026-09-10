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
 * PRIVACY POLICY, DRAFTED AGAINST famysys.com/legal/privacy-policy/.
 *
 * THE STRUCTURE IS THE PARENT'S: fourteen numbered sections, in its order, under its
 * headings. See terms.content.ts for why the structure is kept and the words are not.
 *
 * THIS DOCUMENT HAS A HARDER JOB THAN THE TERMS, because a privacy policy is a list of
 * FACTS about what a system does, and this system is not the parent's. Every clause below
 * was checked against the code before it was written:
 *
 *   - The enquiry forms ask five questions and require one (the email). Not eight.
 *   - NO IP address and NO user-agent string is stored with an enquiry. The `inquiries`
 *     table was designed without those columns, on purpose — see db/migrations/006.
 *   - NOTHING deletes or redacts an enquiry on a schedule. The parent promises 24 months
 *     and redaction; this site has no such job, and the policy must not promise one.
 *   - The panel has ONE shared password, not named accounts, so a change cannot be traced
 *     to a person. It does hash the password (bcrypt), rate-limit sign-in and record every
 *     attempt against a hashed client address — see infrastructure/auth and migration 007.
 *   - No email is sent when an enquiry arrives. There is no email service to name.
 *   - No analytics, no tracking pixels, no embeds, no cookies on the public pages, and the
 *     typefaces are served from this site (next/font self-hosts them). All verified.
 *
 * Where the parent's clause is true of this site it is kept. Where it is not, the clause
 * says what IS true. Where the truth is the client's to supply — the controller, the
 * hosting provider, where the data sits, how long it is kept, how fast a request is
 * answered — it is written as the parent has it and MARKED for review. Every mark is
 * listed in docs/content-todo.md under "Legal pages".
 */
export const privacyDocument: LegalDocument = {
  href: "/privacy",
  title: "Privacy Policy",
  lead: "What this website collects when you send an enquiry, what it does not, who can see it, how long it is kept, and what you can ask us to do with it.",
  effectiveDate: LEGAL_EFFECTIVE_DATE,
  publishedDate: LEGAL_PUBLISHED_DATE,
  reviewStatus: LEGAL_REVIEW_STATUS,
  sections: [
    {
      number: "01",
      heading: "Who we are",
      blocks: [
        // TODO(client): legal review required — data controller. The controller is the
        // entity legally responsible for this data, and it is the same open question as
        // the entity in the Terms: the Studio, or FAMYSYS on the Studio's behalf.
        p(
          "Famysys Studio is responsible for the personal data described in this policy. If you want to ask about anything here, or to exercise one of the rights set out below, write to the address shown with this document and say what you need.",
        ),
      ],
    },
    {
      number: "02",
      heading: "What this policy covers",
      blocks: [
        // Two forms, not one: the closing form on six pages and the form on /contact. Both
        // post to the same place and store the same fields.
        p(
          "It covers this website and the enquiry forms on it — the short form at the foot of most pages and the one on the contact page. It also covers the administration area used by our own staff to run the site.",
        ),
        // TODO(client): legal review required — specific service. This promises that any
        // client engagement carries data-protection terms of its own and a client privacy
        // notice. Whether the Studio's engagement contract actually contains such terms is
        // for the client to confirm; if it does not, this clause makes a promise the
        // contract does not keep.
        p(
          "It does not cover personal data we process on behalf of a client during an engagement. There we act on the client's instructions under the data protection terms of that engagement's contract, and the client's own privacy notice applies.",
        ),
      ],
    },
    {
      number: "03",
      heading: "What we collect when you send an enquiry",
      blocks: [
        // The five fields the forms actually have, and the one rule they actually apply.
        // The parent lists eight fields, all required; copying that would describe a form
        // this site does not have.
        p("The enquiry forms ask for:"),
        list([
          "your name",
          "your work email address — the one thing the form requires, because without it we cannot reply",
          "your company, and its size",
          "what you are trying to create",
        ]),
        p(
          "Everything else in that list is optional and is stored only if you chose to type it. We do not ask for a budget, a job title, a website, or anything about your customers or your staff. Please do not send us information about other people through these forms.",
        ),
      ],
    },
    {
      number: "04",
      heading: "What we collect automatically",
      blocks: [
        // THE PARENT STORES AN IP ADDRESS AND A USER-AGENT WITH EACH ENQUIRY. THIS SITE
        // DOES NOT — the table has no such columns, by a decision recorded in migration
        // 006 ("storing personal data that has no use is a liability rather than a
        // feature"). The clause is rewritten to say so. Only the time of arrival and which
        // of the two forms sent it are kept alongside the answers.
        p(
          "Alongside an enquiry we record the date and time it arrived and which of the two forms it came from, and nothing else: no IP address and no browser details are stored with what you sent.",
        ),
        // TODO(client): legal review required — specific service / hosting provider. Any
        // web server keeps request logs, and this site's host is no exception; what those
        // logs hold and how long the host keeps them is the host's practice, not this
        // code's, and should be confirmed with the provider named in section 08.
        p(
          "The server this site runs on keeps ordinary operational logs of requests, as every web server does; those are the hosting provider's records and are kept according to its practice.",
        ),
        // True, and precisely stated: login_attempts stores a HASH of the client address,
        // never the address (migration 007), and the panel has no per-person audit trail
        // to claim — every edit is versioned, but with one shared account nobody is named.
        p(
          "Signing in to the administration area records the attempt, against a hashed form of the address it came from rather than the address itself, so repeated failures can be locked out. Edits made through the administration area are kept as versions of the content, so an earlier wording can be seen and restored.",
        ),
        // Verified: no analytics or tracking scripts anywhere in src/app or src/presentation,
        // no third-party embeds, and both typefaces are self-hosted through next/font.
        p(
          "We do not run analytics, advertising, tracking pixels or social media embeds on this website. The typefaces are served from this site rather than from a font network, so simply reading a page does not send a request to a third party.",
        ),
      ],
    },
    {
      number: "05",
      heading: "Why we hold it",
      blocks: [
        // TODO(client): legal review required — jurisdiction. "Legitimate interest" is a
        // lawful basis under some regimes and a term of art that means nothing under
        // others. Which law applies is the open question in the Terms' section 11, and it
        // decides whether this clause is the right shape at all.
        p(
          "We hold enquiry data because you asked us to get in touch and because we have a legitimate interest in responding to business enquiries and keeping a record of the work we were asked about. We hold sign-in records because we have a legitimate interest in keeping the site secure.",
        ),
        p(
          "Where the law that applies to you requires consent for something, we ask for it rather than assuming it.",
        ),
      ],
    },
    {
      number: "06",
      heading: "Cookies",
      blocks: [
        // Verified: nothing outside src/app/admin reads or sets a cookie.
        p(
          "The public website sets no cookies. There is nothing to accept, and no banner, because there is nothing to ask you about.",
        ),
        p(
          "The administration area sets one first-party session cookie so a signed-in member of staff stays signed in. It carries no advertising or analytics purpose, it is not readable by any other site, and it exists only for the people we have given the password to.",
        ),
      ],
    },
    {
      number: "07",
      heading: "How long we keep it",
      blocks: [
        // TODO(client): legal review required — retention period. THE PARENT PROMISES
        // "24 months, then the identifying fields are overwritten". This site has no job
        // that deletes or redacts anything: an enquiry stays in the inbox until somebody
        // archives or deletes it. The clause says that, because a retention period on a
        // privacy policy is a promise the system has to keep, and a period the client
        // then decides on will need the job written before the sentence is changed.
        p(
          "Enquiries are kept for as long as we are replying to them, or there is a live conversation about the work, and then until we clear them from our records. There is at present no fixed period after which an enquiry is deleted automatically.",
        ),
        // Both true to the code: sessions expire by cookie age (session.ts) and failed
        // attempts are pruned once older than the lockout window (migration 007).
        list([
          "Sign-in sessions: until the session expires, after which the cookie is no longer honoured.",
          "Sign-in attempts: for the length of the lockout window, after which they are removed.",
          "Edit history: kept, so an earlier version of the site's wording can be restored.",
        ]),
      ],
    },
    {
      number: "08",
      heading: "Who else can see it",
      blocks: [
        // TODO(client): legal review required — specific service. The parent names an
        // email service, because it forwards enquiries by email. THIS SITE SENDS NO EMAIL:
        // an enquiry is written to the database and read in the panel, and nothing else
        // touches it. The list below is what is true today. If forwarding is added — the
        // table already has the columns for it — the service that sends the mail joins
        // this list, and the hosting provider should be named once it is confirmed.
        p("Nobody buys this data from us and nobody is sent it for marketing. It is seen by:"),
        list([
          "our own staff, where their role requires it",
          "the provider that hosts this site and the database behind it",
          "a professional adviser, a regulator or a court, where we are legally required to disclose it",
        ]),
      ],
    },
    {
      number: "09",
      heading: "Where it is handled",
      blocks: [
        // TODO(client): legal review required — jurisdiction. The parent's sentence,
        // kept because it is the nearest true thing available, and marked because it is
        // a claim about where the STUDIO's people and servers are — which the brief does
        // not say. If the Studio's team or hosting is anywhere else, this is the clause
        // that is wrong.
        p(
          "We work across the United States and India, so an enquiry may be read by colleagues in either country and is stored on infrastructure we operate or rent. Where personal data moves between countries, we rely on the safeguards the applicable law provides for such transfers.",
        ),
      ],
    },
    {
      number: "10",
      heading: "Your rights",
      blocks: [
        p("Depending on where you live, you can ask us to:"),
        list([
          "tell you what we hold about you, and give you a copy",
          "correct anything that is wrong",
          "delete what we hold, where we have no overriding reason to keep it",
          "stop or limit what we do with it, including objecting to our legitimate interests",
          "withdraw consent, where the processing rests on consent",
        ]),
        // TODO(client): legal review required — response period. "30 days" is a commitment
        // the studio has to be able to keep, and one that the applicable law may set
        // differently. Kept as the parent has it; confirm before publishing.
        p(
          "Write to the address shown with this document. We will respond within 30 days, and we will tell you if we need longer and why. If you are not satisfied with our answer, you can complain to the data protection authority where you live.",
        ),
      ],
    },
    {
      number: "11",
      heading: "Security",
      blocks: [
        // Each claim checked against the code. Encrypted in transit: the production host
        // serves HTTPS (docs/deployment.md) — TODO(client): legal review required —
        // specific service: confirm the certificate is in place on the live host before
        // this sentence goes out. Password: bcrypt at cost 12 (adminAuth.ts). Rate limit
        // and lockout: attemptLogin against login_attempts. ONE shared password, so the
        // parent's "a named account" and "recorded against the account that made it" are
        // NOT claimed — there is no account to name.
        p(
          "Traffic to this site is encrypted in transit. Access to the administration area needs a password that is stored only as a modern one-way hash, sign-in attempts are rate-limited and locked out after repeated failures, and every attempt is recorded. Access to enquiry data is limited to the people who need it to reply.",
        ),
        // TODO(client): legal review required — jurisdiction. Which breaches must be
        // notified, to whom and how fast is set by the applicable law.
        p(
          "No system is perfectly secure, and we do not claim otherwise. If a breach affects your personal data and the law requires us to tell you, we will.",
        ),
      ],
    },
    {
      number: "12",
      heading: "Children",
      blocks: [
        p(
          "This site is aimed at businesses. It is not directed at children, and we do not knowingly collect personal data from them.",
        ),
      ],
    },
    {
      number: "13",
      heading: "Changes to this policy",
      blocks: [
        p(
          "We update this policy when what we do with personal data changes. The version on this page is the one that applies, and its effective date is shown with it. Where a change is significant, we will say so on the page rather than expecting you to compare two versions.",
        ),
      ],
    },
    {
      number: "14",
      heading: "How to contact us",
      blocks: [p("Questions, requests and complaints about this policy go to the address shown with this document.")],
    },
  ],
  contact: legalContact,
  labels: legalLabels,
};
