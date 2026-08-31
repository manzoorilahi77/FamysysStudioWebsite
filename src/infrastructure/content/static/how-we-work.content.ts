// Content for the How We Work page (/how-we-work).
//
// TWO KINDS OF STRING LIVE HERE, and the difference matters:
//
//   APPROVED — the five process step names and their one-line descriptions, and the
//   line "From idea to finished creative.". These are NOT retyped in this file. Each
//   detail below spreads its entry from `processBlock.steps`, and the hero takes
//   `processBlock.heading`, so both keep exactly one definition and cannot drift from
//   the homepage. Do not add a literal step title or description here.
//
//   DRAFT — everything else: the hero body, the expanded paragraphs, both lists per
//   step, the worked example, the scope block, the new FAQ entries and the closing CTA.
//   The brief supplies one line per step and nothing more, so this was written to fill a
//   page. Every one of those strings is marked
//   `TODO(client): expanded copy — draft, pending approval` and is listed in
//   docs/content-todo.md for review. Nothing here is final.
//
// TWO FAQ entries and the worked example's subject are reused rather than restated: the
// questions come from the brief's own FAQ block, and the piece comes from the portfolio.

import { createCta } from "../../../domain/shared/value-objects/Cta";
import { MediaRef } from "../../../domain/shared/value-objects/MediaRef";
import { Slug } from "../../../domain/shared/value-objects/Slug";
import type { ProcessStep } from "../../../domain/marketing/entities/ProcessStep";
import type {
  HowWeWorkPage,
  WorkedExampleStage,
} from "../../../domain/process/entities/HowWeWorkPage";
import type { ProcessStepDetail } from "../../../domain/process/entities/ProcessStepDetail";
import { faqBlock, processBlock } from "./marketing.content";
import { caseStudies } from "./portfolio.content";

// TODO(client): every image below is stock photography from Unsplash, standing in until
// the studio's own work exists. Source ids are listed in docs/content-todo.md. The alt
// text describes what each stock frame actually shows, so it has to be rewritten
// alongside the images.
function processImage(file: string, alt: string): MediaRef {
  return MediaRef.create({ kind: "image", src: `/media/${file}.jpg`, alt, aspectRatio: "4:3" });
}

function stepSlug(title: string): Slug {
  return Slug.create(
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, ""),
  );
}

interface DraftStepDetail {
  readonly expandedCopy: string;
  readonly whatWeNeed: ReadonlyArray<string>;
  readonly whatYouGet: ReadonlyArray<string>;
  readonly imageFile: string;
  readonly imageAlt: string;
}

// TODO(client): expanded copy — draft, pending approval. Every `expandedCopy` string and
// every list entry in the block below is drafted, not supplied. Keyed by the approved
// title so a renamed step fails loudly rather than silently losing its detail.
//
// NOTE FOR REVIEW: the durations, the two included revision rounds, the 90-day download
// link and the twelve-month archive are OPERATIONAL COMMITMENTS, not stylistic copy. They
// were written to make the page useful rather than vague, but the studio has to confirm it
// can actually hold each one. They are called out separately in docs/content-todo.md.
const DRAFT_STEPS: Readonly<Record<string, DraftStepDetail>> = {
  Understand: {
    expandedCopy:
      "A first call, usually 30 to 45 minutes, and a short written brief back to you afterwards. We ask what the content is for, where it will be published, who signs it off and what the deadline is fixed by. If you already have a brief, a deck or a campaign plan, we work from that rather than starting a new one. Two to three working days from the call to the written brief, and nothing goes into production until you confirm it reads correctly.",
    whatWeNeed: [
      "One call with whoever will sign the work off",
      "Any brand guidelines, logos and fonts you already hold",
      "The deadline, and what it is fixed by",
    ],
    whatYouGet: [
      "A written brief: what we are making, for which platform, and by when",
      "A scope list naming every asset, its format and its length",
    ],
    imageFile: "process-understand",
    imageAlt: "Two people talking across a table, each with an open notebook and a pen.",
  },
  Create: {
    expandedCopy:
      "We turn the brief into something you can react to before production starts — a script, a design direction, a storyboard or a shot list, depending on what is being made. You see it as a document or a set of sample frames, not as a finished piece, because changing direction here costs an email and changing it after production costs a re-edit. Three to five working days. One round of changes at this stage is included and expected.",
    whatWeNeed: [
      "Feedback on the direction as one consolidated response",
      "Product details, copy points or source material the script has to carry",
      "A named approver for the script or design direction",
    ],
    whatYouGet: [
      "A script, storyboard or design direction document",
      "Sample frames or layouts for anything visual",
      "A production schedule with the delivery date on it",
    ],
    imageFile: "process-create",
    imageAlt:
      "A hand-drawn storyboard in a notebook: boxed frames of stick figures with handwritten captions beneath them.",
  },
  Produce: {
    expandedCopy:
      "The build. Filming or footage assembly, design, AI generation where it is the right tool, editing, grading, voice and sound. You are not in this step day to day — it runs to the schedule agreed at the end of Create, and it takes anywhere from three days for a set of social cuts to three weeks for a training series. If something in the brief turns out not to work in production, we tell you during this step rather than at the review.",
    whatWeNeed: [
      "Raw footage, product samples or file access, where the work uses yours",
      "Sign-off on the script, so production is not rebuilt half way through",
      "A named contact we can reach for a same-day answer",
    ],
    whatYouGet: [
      "A first cut or first draft, watermarked, for review",
      "A note of anything in the brief we changed, and why",
    ],
    imageFile: "process-produce",
    imageAlt:
      "A film crew on a lit soundstage, with an overhead lighting rig, a camera crane and monitors at floor level.",
  },
  Refine: {
    expandedCopy:
      "You review the first cut and send comments. We work through them and send a revised version. Two rounds are included in a standard scope, and a round means one consolidated set of comments from you answered by one revised version from us — one to two working days each. Comments that add an asset, a language or a format are not revisions. They are new scope, and we say so and quote for them rather than absorbing them quietly.",
    whatWeNeed: [
      "Comments consolidated into one list, with timecodes for video",
      "Every reviewer's input gathered before you send it, not one after another",
      "A decision from you where two reviewers disagree",
    ],
    whatYouGet: [
      "A revised version per round, with a note of what changed",
      "A straight answer on anything we think falls outside the agreed scope",
    ],
    imageFile: "process-refine",
    imageAlt:
      "A hand pointing a pen at a monitor filled with image thumbnails, on a studio desk beside a laptop.",
  },
  Deliver: {
    expandedCopy:
      "Final files, in every format the brief named, with no watermark. Video goes out as platform-ready exports at the agreed aspect ratios with separate caption files; design goes out as editable source files alongside flattened exports. You get a download link that stays live for 90 days, and we keep the project files for twelve months, so a later edit does not start from nothing.",
    whatWeNeed: [
      "Confirmation that the final version is approved",
      "Where to deliver: a link, a shared drive, or your own asset library",
    ],
    whatYouGet: [
      "Final assets in every format and aspect ratio the brief listed",
      "Editable source files, and separate caption files for video",
      "A download link live for 90 days, and project files archived for twelve months",
    ],
    imageFile: "process-deliver",
    imageAlt:
      "A laptop showing a grid of finished frames, with downloaded audio and video files listed along the bottom of the screen.",
  },
};

function toDetail(step: ProcessStep): ProcessStepDetail {
  const draft = DRAFT_STEPS[step.title];
  if (!draft) {
    throw new Error(
      `No expanded copy drafted for process step "${step.title}". Add it to DRAFT_STEPS.`,
    );
  }
  return {
    // The approved title and description come from the homepage's process block, never
    // from this file.
    ...step,
    slug: stepSlug(step.title),
    expandedCopy: draft.expandedCopy,
    whatWeNeed: draft.whatWeNeed,
    whatYouGet: draft.whatYouGet,
    media: processImage(draft.imageFile, draft.imageAlt),
  };
}

const stepDetails: ReadonlyArray<ProcessStepDetail> = processBlock.steps.map(toDetail);

/** The piece the worked example walks through. Read from the portfolio, not restated. */
const EXAMPLE_PIECE_SLUG = "ugc-transformation";

const examplePiece = caseStudies.find((piece) => piece.slug.value === EXAMPLE_PIECE_SLUG);
if (!examplePiece) {
  throw new Error(`Worked-example piece "${EXAMPLE_PIECE_SLUG}" is no longer in the portfolio.`);
}

// TODO(client): expanded copy — draft, pending approval. The whole worked example is
// written. It is also HYPOTHETICAL: the piece it walks through has not been produced, and
// the client it describes does not exist, which is why the page labels the block
// illustrative in visible copy rather than in a comment.
const DRAFT_EXAMPLE_STAGES: Readonly<Record<string, string>> = {
  Understand:
    "A skincare brand has 40 clips filmed by three creators on their phones, and wants a month of Instagram Reels out of them. The call settles the platform, the posting cadence and who approves — one marketing lead, not a committee. The written brief names twelve Reels at 9:16, captioned, set in the brand's own fonts.",
  Create:
    "We watch all 40 clips and come back with a cut plan: which clip carries which message, three opening variants to test, and a caption and end-card treatment. The brand changes two of the openings. That is the whole Create round.",
  Produce:
    "Twelve cuts assembled from the approved plan — trimmed, colour-matched across three different phone cameras, captioned, with music and an end card. Two clips turn out to be unusable at 9:16, so we say so during production and substitute from the same shoot.",
  Refine:
    "One consolidated comment list: caption timing on four clips, a music swap on two, and a request for a fifteen-second version of the best performer. The first two are revisions. The fifteen-second version is a new asset, so it is quoted rather than absorbed.",
  Deliver:
    "Twelve Reels at 9:16 plus the extra fifteen-second cut, as MP4s with separate caption files, and a set of stills pulled from the same footage for static posts.",
};

const exampleStages: ReadonlyArray<WorkedExampleStage> = processBlock.steps.map((step) => {
  const text = DRAFT_EXAMPLE_STAGES[step.title];
  if (!text) {
    throw new Error(`No worked-example stage drafted for process step "${step.title}".`);
  }
  return { stepTitle: step.title, text };
});

/** The two homepage FAQ entries that answer process questions, reused verbatim. */
const REUSED_FAQ_QUESTIONS: ReadonlyArray<string> = [
  "Can you do a sample before we commit?",
  "Do you offer ongoing monthly support?",
];

const reusedFaqItems = REUSED_FAQ_QUESTIONS.map((question) => {
  const item = faqBlock.items.find((candidate) => candidate.question === question);
  if (!item) {
    throw new Error(`FAQ entry "${question}" is no longer in the brief's FAQ block.`);
  }
  return item;
});

export const howWeWorkPage: HowWeWorkPage = {
  hero: {
    // TODO(client): expanded copy — draft, pending approval (eyebrow and body). The
    // heading is the client's own process line, read from marketing.content.ts rather
    // than retyped, so the page and the homepage cannot say it differently.
    eyebrow: "How We Work",
    heading: processBlock.heading,
    body: "Five steps, the same on every project. This page sets out what happens at each one — who does what, what we send you, and what we need back before the next step can start.",
    cta: createCta("Start a Conversation", "/contact"),
  },
  // TODO(client): expanded copy — draft, pending approval (all three labels).
  overviewLabel: "Jump to a step",
  steps: stepDetails,
  whatWeNeedLabel: "What we need from you",
  whatYouGetLabel: "What you get",
  workedExample: {
    // TODO(client): expanded copy — draft, pending approval (eyebrow, heading, note and
    // all five stages). The piece's title and description are the client's own planned
    // brief, read from portfolio.content.ts.
    eyebrow: "In practice",
    heading: "One project, through all five steps.",
    illustrativeNote:
      "Illustrative. This walks a planned piece through the five steps to show what each one produces. The piece has not been made and the client described is not a real one.",
    pieceTitle: examplePiece.title,
    pieceDescription: examplePiece.description,
    stages: exampleStages,
  },
  scope: {
    // TODO(client): expanded copy — draft, pending approval (every string below). The
    // Refine step says feedback is incorporated "within the agreed scope"; this block
    // is what that phrase is expanded into, and it commits the studio to specifics.
    eyebrow: "Scope and revisions",
    heading: "What “within the agreed scope” actually means.",
    body: "The Refine step says feedback is incorporated within the agreed scope. That sentence does a lot of work, so here is what sits behind it.",
    topics: [
      {
        title: "How scope is set",
        body: "Scope is written down at the end of Understand, as a list of assets: how many, in what format, at what aspect ratio, at what length, in which languages. Nothing is scoped by hours. If an asset is not on that list it is not in the scope, and both of us can check that in one place rather than remembering the call differently.",
      },
      {
        title: "What a revision round covers",
        body: "A round is one consolidated set of comments from you, answered by one revised version from us. A standard scope includes two. Changes to timing, wording, music, colour, ordering and captions are revisions. So is fixing anything we got wrong — that never counts against a round, however many passes it takes.",
      },
      {
        title: "What counts as new scope",
        body: "A new asset, a new format or aspect ratio, a new language, a different length, or a change of direction after the script was signed off. None of these are refused. They are quoted, and you decide before we start. The point of naming them is that you find out at the moment it happens rather than on the invoice.",
      },
      {
        title: "When requirements change mid-project",
        body: "Tell us as early as you can. If production has not started, a change usually costs nothing. If it has, we say what is already built, what has to be rebuilt and what that costs, and you choose. We do not carry on quietly against a brief you have moved past.",
      },
    ],
  },
  faq: {
    // TODO(client): expanded copy — draft, pending approval (eyebrow, heading, and the
    // two new questions and answers). The other two entries are the client's own,
    // question and answer, reused verbatim from the brief's FAQ block.
    eyebrow: "Questions",
    heading: "Questions about the process.",
    block: {
      items: [
        {
          question: "How long does a project usually take?",
          answer:
            "It depends on what is being made, and the range is wide: a set of social cuts from footage you already have can be finished inside a week, while a training series with a script and motion graphics takes four to six. You get a date at the end of the Create step, once the scope is a list rather than a description.",
        },
        ...reusedFaqItems,
        {
          question: "Who do we deal with day to day?",
          answer:
            "One contact for the whole project, from the first call to delivery. Specialists join for their own part — editor, designer, motion — but you are not managing them and you are not re-explaining the brief to each one.",
        },
      ],
    },
  },
  closingCta: {
    // TODO(client): expanded copy — draft, pending approval (heading and body). The CTA
    // label and the closing line are the client's own, reused from the homepage.
    heading: "Ready to start at step one?",
    body: "Tell us what you are trying to produce and who it is for. The first call is the Understand step — it costs nothing, and you leave it with a written brief.",
    cta: createCta("Start a Conversation", "/contact"),
    closingLine: "Project today. Creative partner tomorrow.",
  },
};
