// Content for the About page (/about).
//
// SHORT BY DESIGN, NOT THIN BY ACCIDENT. The brief says to keep About relatively short
// because the studio is new. That still holds — but "short" had become "empty": five
// sparse sections that read as a placeholder. The page now has eight sections, and every
// added one says something a new studio can stand behind: what it believes and why, how
// the three inputs actually combine, what "starting deliberately" means in practice and
// in what order, why the studio sits inside Famysys, and what a client can honestly
// expect from a studio at this stage — including what is not ready yet.
//
// TWO KINDS OF STRING LIVE HERE:
//
//   APPROVED — the heading, the belief statement, the approach sentence, the ecosystem
//   sentence, the ambition and the "starting deliberately" line, all read from
//   `aboutBlock` in marketing.content.ts rather than retyped; and the closing CTA's
//   label and closing line, read from `closingCta`. See `aboutBlock` for exactly which
//   of those are verbatim and which were completed from the brief's own phrases.
//
//   DRAFT — everything else, each marked `TODO(client): expanded copy — draft, pending
//   approval` at the block it belongs to, and listed in docs/content-todo.md by
//   `pnpm docs:content-todo`.
//
// NOTHING INVENTED. No team member, name, headcount, founding date, office location,
// client count, revenue figure, award, partnership or certification appears anywhere —
// the brief supplies none, and the studio is in its own words still starting. A page
// that implied an established agency would contradict the brief's own sentence in the
// direction block. `StaticAboutRepository.test.ts` asserts it, and the browser
// verification asserts the same against the rendered page.

import { createCta } from "../../../domain/shared/value-objects/Cta";
import { MediaRef } from "../../../domain/shared/value-objects/MediaRef";
import type { AboutPage } from "../../../domain/about/entities/AboutPage";
import { aboutBlock, closingCta } from "./marketing.content";

// TODO(client): stock photography from Unsplash, standing in until the studio's own
// stills exist. Source ids are listed in docs/content-todo.md. Every alt text describes
// what the stock frame actually shows, so it has to be rewritten alongside the image.
//
// SIX images, and the rule that chose them: production, not people. At most one person
// in any frame, no crews, no legible brand marks, and nothing that reads as "our team" or
// "our office" — a stock photograph of strangers or premises is a false claim on this
// page in a way it is not on any other. Each was checked at its final crop.
const heroMedia = MediaRef.create({
  kind: "image",
  src: "/media/about-hero.jpg",
  alt: "An empty photographic studio: a white cyclorama lit by two softboxes and an overhead rig, a camera bag and lenses on the floor.",
  aspectRatio: "16:9",
});

const creativeMedia = MediaRef.create({
  kind: "image",
  src: "/media/about-claim-creative.jpg",
  alt: "An open sketchbook filled with thumbnail layouts and notes in blue ink, a pencil resting across the page.",
  aspectRatio: "4:3",
});

const workflowMedia = MediaRef.create({
  kind: "image",
  src: "/media/about-claim-workflow.jpg",
  alt: "A laptop screen showing a video edit in progress: a timeline of clips below a preview frame, colour wheels to one side.",
  // 4:3, like the other two claim frames, and not the portrait crop this started as. A 3:4
  // frame in a five-column slot is about 660px tall against roughly 300px of copy beside
  // it, so the claim ended a third of the way down its own block and the rest of the row
  // was empty. Mixed ratios are worth having where the images are a set the eye compares
  // (the homepage mosaic); here each image is alone in its own row, and the only thing a
  // taller one changes is how much blank space sits under the words.
  aspectRatio: "4:3",
});

const aiMedia = MediaRef.create({
  kind: "image",
  src: "/media/about-approach.jpg",
  alt: "A colour-grading interface on a monitor, photographed at an angle: two colour wheels beside a hue curve drawn over a spectrum.",
  aspectRatio: "4:3",
});

const ecosystemMedia = MediaRef.create({
  kind: "image",
  src: "/media/about-ecosystem.jpg",
  alt: "A camera operator seen from below, adjusting a rig by hand under a small lamp, the background out of focus.",
  aspectRatio: "4:3",
});

const directionMedia = MediaRef.create({
  kind: "image",
  src: "/media/about-direction.jpg",
  alt: "A projector throwing a beam of light through haze in a red-lit room.",
  aspectRatio: "4:3",
});

export const aboutPage: AboutPage = {
  hero: {
    // TODO(client): expanded copy — draft, pending approval (eyebrow and body). The
    // heading is the client's own, read from marketing.content.ts rather than retyped.
    eyebrow: "About Famysys Studio",
    heading: aboutBlock.heading,
    body: "A creative production studio, built to make professional creative work easier to commission and easier to keep producing.",
    media: heroMedia,
  },
  belief: {
    // TODO(client): expanded copy — draft, pending approval (the label only, which is
    // the section's accessible name and is not rendered). The statement is the client's
    // own central sentence and the page's thesis.
    label: "What we believe",
    statement: aboutBlock.belief,
  },
  approach: {
    // TODO(client): expanded copy — draft, pending approval (eyebrow, heading, the
    // practice label, and every claim's title, claim and practice). The intro is the
    // client's own sentence.
    eyebrow: "What we do, and why",
    heading: "Creative judgment, with production built around it.",
    intro: aboutBlock.approach,
    practiceLabel: "In practice",
    claims: [
      {
        title: "Creative direction decides what a piece should be.",
        claim:
          "Nothing else on this page matters if the idea is wrong. Before anything is produced, someone with taste decides what the work is for, who it is speaking to and what it should feel like — and that decision is made by a person.",
        practice:
          "Every piece starts with a written creative direction that you see and agree before production begins. If the direction is unclear, we stop and fix that first, because production cannot rescue it later.",
        media: creativeMedia,
      },
      {
        title: "The workflow decides whether it can be made again.",
        claim:
          "A good piece made once is luck. The same standard reached the second and the tenth time is a method, and it only happens when the steps are written down, in order, with a check at each one.",
        practice:
          "The same stages every time — understand, create, produce, refine, deliver — with the same review at the same point in each. Your second piece with us should feel like a continuation, not a restart.",
        media: workflowMedia,
      },
      {
        title: "AI is used where it removes overhead, and left out where it would cost quality.",
        claim:
          "Emerging tools are genuinely useful for the slow, repetitive parts of production. They are not a substitute for the decisions above, and pretending otherwise produces work that looks like everyone else's.",
        practice:
          "AI helps with drafts, variations, transcripts, rough assemblies and the versions a piece needs for different channels. It does not set the direction, and nothing generated goes out without a person having judged it.",
        media: aiMedia,
      },
    ],
  },
  inputs: {
    // TODO(client): expanded copy — draft, pending approval (the whole block: eyebrow,
    // heading, body, and every panel's name, labels, contribution and limit).
    eyebrow: "The three inputs",
    heading: "What each input contributes, and where it stops.",
    body: "The studio is built on three things, and each is only useful because the other two are there. Naming where each one stops is the honest half of the description.",
    inputs: [
      {
        name: "Human creativity",
        contributesLabel: "Contributes",
        contributes:
          "Taste, judgment and the idea itself. Deciding what a piece is for, what it should say and what it should feel like — and recognising when a draft is not there yet.",
        stopsLabel: "Stops at",
        stops:
          "Volume. One person's judgment does not multiply by itself, and a studio that relied on it alone would be slow, expensive and inconsistent from one piece to the next.",
      },
      {
        name: "AI",
        contributesLabel: "Contributes",
        contributes:
          "Speed on the repetitive parts: first drafts, variations, transcripts, rough assemblies and the many versions one piece needs across channels.",
        stopsLabel: "Stops at",
        stops:
          "Direction and sign-off. It does not decide what the work is for, and nothing it produces goes out without a person having judged it.",
      },
      {
        name: "Structured production",
        contributesLabel: "Contributes",
        contributes:
          "Repeatability. The same stages in the same order, with a review at the same point each time, so the second piece is as considered as the first.",
        stopsLabel: "Stops at",
        stops:
          "Ideas. A process can make a good idea reliably; it cannot supply one. That is why it sits underneath the other two rather than in front of them.",
      },
    ],
  },
  building: {
    // TODO(client): expanded copy — draft, pending approval (the whole block: eyebrow,
    // heading, body, every stage's title, status and body, and the caveat).
    eyebrow: "How we're building",
    heading: "Starting deliberately, in a set order.",
    body: "The studio is new, and saying so is easier than being caught out by it. This is the order things are being built in, and where each stage stands.",
    stages: [
      {
        title: "Capabilities first",
        status: "Now",
        body: "Building the creative and production capability itself: the people, the tools and the working method for each service we offer. A studio that cannot yet make the work well has nothing to organise.",
      },
      {
        title: "Then process",
        status: "Next",
        body: "Writing down how each kind of piece gets made, and running enough work through it to find where it needs tightening. The process described on this site is the one in use; refining it is the current work.",
      },
      {
        title: "Then scale",
        status: "After that",
        body: "Taking on more work, and more kinds of work, once the first two hold without effort. Growth that arrives before the method is ready is exactly what the word deliberately is there to prevent.",
      },
    ],
    caveat:
      "What that means for a client today: the work is made carefully and reviewed properly, and the studio is small enough that you deal directly with the people doing it. What is not ready yet is volume — a large programme of work on a fixed calendar is the stage after this one.",
  },
  ecosystem: {
    // TODO(client): expanded copy — draft, pending approval (eyebrow, heading and the
    // second, third and fourth paragraphs). The first is the client's own.
    eyebrow: "Part of Famysys",
    heading: "Where the Studio sits.",
    paragraphs: [
      aboutBlock.ecosystem,
      "That is what makes starting deliberately possible. A standalone studio has to sell before it has built; this one can build first, because the business around it already runs.",
      "So the Studio is not finding its feet alone. It is being built inside an existing business, with creative production as its own focus rather than a side of something else.",
      "What the wider group does is its own work, and this page does not claim it as the Studio's. The link below goes to Famysys itself.",
    ],
    media: ecosystemMedia,
    link: createCta("Visit famysys.com", "https://famysys.com"),
  },
  direction: {
    // TODO(client): expanded copy — draft, pending approval (eyebrow, heading and the
    // two labels). Both sentences are the client's own, and they are rendered together
    // on purpose: the ambition without the present tense beside it would read as a claim
    // about today rather than a statement of intent.
    eyebrow: "Where we're going",
    heading: "What we are building toward.",
    ambitionLabel: "The ambition",
    ambition: aboutBlock.ambition,
    presentLabel: "Where we are today",
    present: aboutBlock.startingDeliberately,
    media: directionMedia,
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
