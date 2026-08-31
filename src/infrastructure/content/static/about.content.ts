// Content for the About page (/about).
//
// THE SHORTEST PAGE ON THE SITE, deliberately. The brief says to keep About relatively
// short initially, so this page has six sections where the others have eight or ten, and
// less copy in each. It should read as quiet by design, not thin by accident — which is
// why the expansion below is modest and stops rather than filling space.
//
// TWO KINDS OF STRING LIVE HERE:
//
//   APPROVED — the heading, the belief statement, the approach sentence, the ecosystem
//   sentence, the ambition and the "starting deliberately" line, all read from
//   `aboutBlock` in marketing.content.ts rather than retyped; and the closing CTA's
//   label and closing line, read from `closingCta`. See `aboutBlock` for exactly which
//   of those are verbatim and which were completed from the brief's own phrases.
//
//   DRAFT — everything else: the eyebrows, the three section headings, the hero intro,
//   the two expanded paragraphs in the approach block, the two in the ecosystem block,
//   and the closing CTA's heading and body.
//
// NOTHING INVENTED. No team member, name, headcount, founding date, office location,
// client count, revenue figure, award, partnership or certification appears anywhere —
// the brief supplies none, and the studio is in its own words still starting. A page
// that implied an established agency would contradict the brief's own sentence two
// sections further down. `StaticAboutRepository.test.ts` asserts it, and the browser
// verification asserts the same against the rendered page.

import { createCta } from "../../../domain/shared/value-objects/Cta";
import { MediaRef } from "../../../domain/shared/value-objects/MediaRef";
import type { AboutPage } from "../../../domain/about/entities/AboutPage";
import { aboutBlock, closingCta } from "./marketing.content";

// TODO(client): stock photography from Unsplash, standing in until the studio's own
// stills exist. Source id is listed in docs/content-todo.md. The alt text describes what
// the stock frame actually shows, so it has to be rewritten alongside the image.
//
// ONE image on this page, and it has no people in it. Both are deliberate: the page's
// subject is the studio itself, so a stock photograph of strangers reads as "our team"
// here in a way it does not on any other page. A grading interface shows the work
// instead of implying a staff. See docs/content-todo.md.
const approachMedia = MediaRef.create({
  kind: "image",
  src: "/media/about-approach.jpg",
  alt: "A colour-grading interface on a monitor, photographed at an angle: two colour wheels beside a hue curve drawn over a spectrum.",
  aspectRatio: "4:3",
});

export const aboutPage: AboutPage = {
  hero: {
    // TODO(client): expanded copy — draft, pending approval (eyebrow and body). The
    // heading is the client's own, read from marketing.content.ts rather than retyped.
    eyebrow: "About Famysys Studio",
    heading: aboutBlock.heading,
    body: "A creative production studio, built to make professional creative work easier to commission and easier to keep producing.",
  },
  belief: {
    // TODO(client): expanded copy — draft, pending approval (the label only, which is
    // the section's accessible name and is not rendered). The statement is the client's
    // own central sentence and the page's thesis.
    label: "What we believe",
    statement: aboutBlock.belief,
  },
  approach: {
    // TODO(client): expanded copy — draft, pending approval (eyebrow, heading and the
    // second and third paragraphs). The first paragraph is the client's own.
    eyebrow: "What we do, and why",
    heading: "Creative judgment, with production built around it.",
    paragraphs: [
      aboutBlock.approach,
      "The three are not interchangeable. Creative direction decides what a piece should be. The workflow decides whether it can be made again, to the same standard, without a scramble. AI is used where it removes production overhead, and left out where it would cost quality.",
      "It is not a complicated method. Most of the difference is in applying it the same way every time.",
    ],
    media: approachMedia,
  },
  ecosystem: {
    // TODO(client): expanded copy — draft, pending approval (eyebrow, heading and the
    // second and third paragraphs). The first is the client's own.
    eyebrow: "Part of Famysys",
    heading: "Where the Studio sits.",
    paragraphs: [
      aboutBlock.ecosystem,
      "So the Studio is not finding its feet alone. It is being built inside an existing business, with creative production as its own focus rather than a side of something else.",
      "What the wider group does is its own work, and this page does not claim it as the Studio's. The link below goes to Famysys itself.",
    ],
    link: createCta("Visit famysys.com", "https://famysys.com"),
  },
  direction: {
    // TODO(client): expanded copy — draft, pending approval (eyebrow and heading). Both
    // sentences below are the client's own, and they are rendered together on purpose:
    // the ambition without the present tense beside it would read as a claim about
    // today rather than a statement of intent.
    eyebrow: "Where we're going",
    heading: "What we are building toward.",
    ambition: aboutBlock.ambition,
    present: aboutBlock.startingDeliberately,
  },
  closingCta: {
    // TODO(client): expanded copy — draft, pending approval (heading and body). The CTA
    // label and the closing line are the client's own, reused from the homepage.
    heading: "Bring us something to make.",
    body: "Tell us what you are trying to produce and who it is for. We will tell you plainly whether it is something we can make well.",
    cta: createCta("Start a Conversation", "/contact"),
    closingLine: closingCta.closingLine,
  },
};
