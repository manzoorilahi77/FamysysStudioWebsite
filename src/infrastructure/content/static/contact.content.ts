// Content for the Contact page (/contact).
//
// THE ONE PAGE WHOSE REFERENCE IS THE PARENT SITE. Every other page here is shaped
// against the design language the six share; this one follows famysys.com's own contact
// page — light hero, dark two-column form section, "What happens next" panel on the
// right — because that page already solves this problem and the client asked for it.
//
// WHAT WAS DELIBERATELY NOT CARRIED OVER FROM IT:
//
//   THE TRUST BADGES. "SOC2 Type II Compliant", "Strict Commercial NDA" and "Zero
//   Lock-In Guarantee" are the parent company's certification and commitments. The
//   Studio is a new arm and nothing in the brief says it holds any of them. A
//   certification claimed by a business that does not hold it is a different order of
//   problem from unapproved copy, so the space is empty until the manager says what the
//   Studio can genuinely claim.
//
//   THE CONTACT DETAILS. hello@famysys.com and the phone number on that page are the
//   PARENT's. The Studio may share them or may have its own; the brief says neither, and
//   publishing a number that rings the wrong desk is worse than publishing none.
//
//   THE QR BUSINESS CARD. A personal digital card, and probably an individual's. Whose
//   it would be here is a question for the client.
//
//   THE HERO COPY, and the role options. Both are engineering-shaped on the parent's
//   page — see the note at the hero below, and ContactRole for the roles.
//
// All of it is listed in docs/content-todo.md.
//
// EVERY STRING BELOW IS DRAFT except the closing line and the tagline, which are the
// client's own and are read from marketing.content.ts rather than retyped.

import type { ContactPage } from "../../../domain/contact/entities/ContactPage";
import { closingCta, footerContent } from "./marketing.content";

export const contactPage: ContactPage = {
  hero: {
    // TODO(client): expanded copy — draft, pending approval.
    //
    // The parent's hero is "Start with the problem, not the pitch." over "Tell us what
    // is not working and what it is costing you. If it is work we should take, you will
    // hear back from the engineer who would scope it — not a sales sequence." That is
    // written for someone buying engineering, and neither sentence survives the move to
    // a creative production studio: a client with a film to make does not have something
    // that is not working and costing them money, they have something they want made.
    //
    // What is kept is the shape — a declarative heading built on a contrast, and an
    // intro that says what to send and who reads it. The brief's own final-CTA copy
    // ("Have a creative requirement? Let us talk.") is approved and is the fallback if
    // this is not; it is already on the homepage, which is the argument against reusing
    // it as this page's headline.
    //
    // "the person who would direct it" is a commitment about who replies, exactly as the
    // parent's "the engineer who would scope it" is. It is in the commitments list in
    // docs/content-todo.md with the three steps.
    eyebrow: "Contact",
    heading: "Start with what you want made, not how to make it.",
    body: "Tell us what you are trying to create, who it is for and roughly when you need it. If it is work we should take, you will hear back from the person who would direct it — not a sales sequence.",
  },
  form: {
    // TODO(client): expanded copy — draft, pending approval. The eight fields are the
    // parent form's, in its order, with its labels — except the last, which asks what
    // you are trying to CREATE where the parent asks what you are trying to FIX. The
    // form's fields were already listed in docs/content-todo.md as needing confirmation
    // before this page existed.
    heading: "Tell us about the work",
    labels: {
      firstName: "First name",
      lastName: "Last name",
      email: "Work email",
      companyName: "Company",
      companyWebsite: "Company website",
      role: "Your role",
      companySize: "Company size",
      brief: "What are you trying to create?",
    },
    optionalSuffix: "(optional)",
    selectPlaceholder: "Select one",
    submitLabel: "Send inquiry",
    submittingLabel: "Sending…",
    // No turnaround here, and no "within one business day". The brief gives the Studio no
    // such number and the parent's cannot be inherited — see docs/content-todo.md.
    confirmationHeading: "Thanks — your brief is with us.",
    confirmationBody:
      "We read every one. If it is work we should take, you will hear back from the person who would direct it.",
    submitErrorMessage: "Something went wrong sending that. Please try again.",
  },
  panel: {
    // TODO(client): expanded copy — draft, pending approval, AND three operational
    // commitments. The parent's steps are "Someone senior reads it", "A short call" and
    // "A written point of view"; these are their equivalents for creative work. Each
    // promises something the studio then has to do, so all three are in the commitments
    // list in docs/content-todo.md.
    //
    // NO DURATIONS. The parent's step 02 says "Thirty minutes". The brief gives the
    // Studio no number, and one invented here would be a commitment the business never
    // made. Step 02 says "short" and stops.
    heading: "What happens next",
    steps: [
      {
        numeral: "01",
        heading: "Someone who makes the work reads it",
        body: "Your brief goes to the person who would direct it, not a routing queue.",
      },
      {
        numeral: "02",
        heading: "A short call",
        body: "Enough to establish what you are making, who it is for, and whether this is work we should be taking on at all.",
      },
      {
        numeral: "03",
        heading: "A written approach",
        body: "If it fits, you get the approach we would take, the scope it implies and the production model that suits it — before any commitment.",
      },
    ],
    directEyebrow: "Or reach us directly",
    // The client's own central-idea sentence, reused from the footer rather than a second
    // tagline written for this panel.
    tagline: footerContent.tagline,
    // TODO(client): the Studio's own email and phone. NOT the parent's — see the header
    // of this file. While both are absent the "Or reach us directly" block does not
    // render at all, so the page never shows a heading with nothing under it.
    direct: {},
    // The client's own closing line, from the brief.
    closingLine: closingCta.closingLine,
  },
};
