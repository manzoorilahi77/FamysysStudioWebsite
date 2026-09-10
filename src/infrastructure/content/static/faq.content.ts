import type { FaqPageStructure } from "../../../domain/faq/entities/FaqPage";
import { closingCta } from "./marketing.content";

/**
 * THE FAQ PAGE'S OWN COPY AND ITS GROUPING. The questions and answers are not here — see
 * `FaqPageStructure` for why — and each group names its questions by their text, which
 * `GetFaqPage` resolves against the four blocks that own them and refuses to render if
 * any question is missing, unnamed, or named twice.
 *
 * THE GROUPING WAS DERIVED FROM THE TWELVE QUESTIONS, NOT CHOSEN FIRST. Read in a row they
 * fall into four kinds, and the four are in the order a buyer meets them: whether the
 * studio is for them at all; what it can make and from what; how the work then runs; and
 * what it costs and how the relationship is shaped. Two of the groups hold two questions
 * and two hold four, which is uneven and left that way — a group padded to match its
 * neighbours would be a group with a question in it that belongs somewhere else.
 *
 * THE ORDER INSIDE A GROUP IS THE ORDER THE HOMEPAGE ASKS THEM, where it asks them, and
 * otherwise the order the inner page did. Nothing has been re-sorted for effect.
 */
export const faqPageStructure: FaqPageStructure = {
  hero: {
    // The shared "Questions" eyebrow every FAQ block on the site carried, so the page is
    // recognisably the same family as the pointers that lead to it.
    eyebrow: "Questions",
    // TODO(client): expanded copy — draft, pending approval. This was the homepage FAQ
    // section's heading (drafted, and recorded as such in docs/content-todo.md) until that
    // section was replaced by this page; the line moves here rather than being lost, and
    // the approval it was waiting for is the same approval.
    heading: "The questions that come up first.",
    // TODO(client): expanded copy — draft, pending approval.
    body: "Everything asked across the site, in one place, with the answers open. If yours is not here, the contact page is the fastest way to ask it.",
  },
  // TODO(client): expanded copy — draft, pending approval.
  indexLabel: "On this page",
  groups: [
    {
      id: "working-with-us",
      // TODO(client): expanded copy — draft, pending approval (every group title and
      // description below). The questions themselves are unchanged and keep whatever
      // status they had where they were first asked.
      title: "Working with us",
      description: "Whether the studio is for you, and how a first piece of work starts.",
      questions: ["Do you work with small businesses?", "Can you do a sample before we commit?"],
    },
    {
      id: "services-and-capability",
      title: "Services and capability",
      description: "What the studio makes, what it can make it from, and how much of it at once.",
      questions: [
        "Do you only create AI-generated content?",
        "Can I give you my own raw video footage?",
        "Can you create content from our existing documents or presentations?",
        "Can you work across more than one service at a time?",
      ],
    },
    {
      id: "process-and-delivery",
      title: "Process and delivery",
      description: "How long the work takes and who you deal with while it is happening.",
      questions: ["How long does a project usually take?", "Who do we deal with day to day?"],
    },
    {
      id: "pricing-and-engagement",
      title: "Pricing and engagement",
      description: "What it costs, how the engagement is shaped, and how it changes as you grow.",
      questions: [
        "How much do your services cost?",
        "Do you offer ongoing monthly support?",
        "Can we move between these as we grow?",
        "What if none of the three named tiers fits?",
      ],
    },
  ],
  // The client's own closing block, reused verbatim as the other inner pages reuse it.
  closingCta,
};
