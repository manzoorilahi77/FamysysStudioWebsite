// Content for the Creative Services page (/creative-services).
//
// TWO KINDS OF STRING LIVE HERE, and the difference matters:
//
//   APPROVED — the six capability names and their one-line descriptors. These are NOT
//   retyped in this file. Each detail below spreads its entry from `services.content.ts`,
//   so `title` and `description` are read from the client's approved copy and cannot
//   drift out of sync with the homepage. Do not add a literal title or description here.
//
//   DRAFT — everything else: the hero, the expanded paragraphs, the deliverable lists,
//   the pointer blocks, the new FAQ entry and the closing CTA. The brief supplies
//   homepage-length copy only, so this was written to fill a page. Every one of those
//   strings is marked `TODO(client): expanded copy — draft, pending approval` and is
//   listed in docs/content-todo.md for review. Nothing here is final.
//
// The three FAQ entries reused from the homepage are the client's own copy and are
// imported rather than restated, for the same reason as the titles.

import { createCta } from "../../../domain/shared/value-objects/Cta";
import { MediaRef } from "../../../domain/shared/value-objects/MediaRef";
import type { AspectRatio } from "../../../domain/shared/value-objects/MediaRef";
import { Slug } from "../../../domain/shared/value-objects/Slug";
import type { CapabilityDetail } from "../../../domain/services/entities/CapabilityDetail";
import type {
  CreativeServicesPage,
  EngagementSummary,
} from "../../../domain/services/entities/CreativeServicesPage";
import type { ServiceOffering } from "../../../domain/services/entities/ServiceOffering";
import { faqBlock, processBlock, waysToWorkBlock } from "./marketing.content";
import { capabilities } from "./services.content";
import { slugifyTitle } from "./slugify";

// TODO(client): every image below is stock photography from Unsplash, standing in until
// the studio's own work exists. Source ids are listed in docs/content-todo.md. The alt
// text describes what each stock frame actually shows, so it has to be rewritten
// alongside the images.
function servicesImage(file: string, alt: string, aspectRatio: AspectRatio): MediaRef {
  return MediaRef.create({ kind: "image", src: `/media/${file}.jpg`, alt, aspectRatio });
}

/** The nav already links these fragments — see slugify.ts for why it is shared. */
function capabilitySlug(title: string): Slug {
  return Slug.create(slugifyTitle(title));
}

interface DraftDetail {
  readonly expandedCopy: string;
  readonly deliverables: ReadonlyArray<string>;
  readonly imageFile: string;
  readonly imageAlt: string;
}

// TODO(client): expanded copy — draft, pending approval. Every `expandedCopy` string and
// every entry of every `deliverables` array in the block below is drafted, not supplied.
// The deliverables expand the client's own descriptor wording rather than replacing it:
// each list keeps the nouns the descriptor already names and says what is actually
// handed over. Keyed by the approved title so a renamed capability fails loudly.
const DRAFT_DETAILS: Readonly<Record<string, DraftDetail>> = {
  "Creative Design": {
    expandedCopy:
      "One consistent system — layout, type, colour — applied across everything a brand publishes, from a social post to a printed brochure. Handed over as editable source files, not locked exports.",
    deliverables: [
      "Social creatives sized for Instagram, LinkedIn and Facebook",
      "Presentation decks built on a reusable master",
      "Editable source files for every placement",
    ],
    imageFile: "service-creative-design",
    imageAlt: "Printed colour swatch books beside a tablet showing layout diagrams.",
  },
  "Video Production & Editing": {
    expandedCopy:
      "Editing and finishing for footage you already have — creator clips, phone recordings, event coverage. We cut, grade, caption and package it for the platform it's going to.",
    deliverables: [
      "Reels and Shorts cut to 9:16, captions burned in",
      "One long-form piece repurposed into a set of short clips",
      "Colour grading, sound and platform-ready delivery",
    ],
    imageFile: "service-video-production",
    imageAlt:
      "An interview set: a single chair on a lit backdrop, with a boom microphone overhead.",
  },
  "AI Video & Virtual Presenters": {
    expandedCopy:
      "Video built around a generated presenter instead of a filmed one — for content that would otherwise need a studio, a crew and a booked day. Send a script or a document; we choose the voice and assemble the rest.",
    deliverables: [
      "A choice of presenter, voice and language",
      "Multi-language versions from one script",
      "Same brand treatment and captions as any other video",
    ],
    imageFile: "service-ai-video",
    imageAlt: "A presenter in a grey jacket, standing to camera in front of an orange wall.",
  },
  "Explainer & Training Videos": {
    expandedCopy:
      "Video for material people have to understand, not just watch — how a product works, how a process runs. We start from what already exists: a deck, a manual, a recorded session.",
    deliverables: [
      "Modules with a consistent opening and closing summary",
      "Screen recordings with on-screen callouts",
      "Captions, transcripts and a summary sheet",
    ],
    imageFile: "service-explainer-training",
    imageAlt: "People seated around a table taking notes during a training session.",
  },
  "Motion Graphics & Advanced Creative": {
    expandedCopy:
      "The layer that sits on top of finished footage, or stands on its own where there's no footage at all — animated titles, moving diagrams, logo builds, effects work.",
    deliverables: [
      "Animated charts, diagrams and title sequences",
      "Object removal and screen replacement",
      "A reusable motion kit for later edits",
    ],
    imageFile: "service-motion-graphics",
    imageAlt: "A corridor of brightly coloured panels receding into the distance.",
  },
  "Product & Brand Visuals": {
    expandedCopy:
      "Still imagery for products and brands, without booking a studio for every shot. We build the scene once and generate the variations a campaign needs — backgrounds, formats, seasonal treatments.",
    deliverables: [
      "Product visuals on plain and lifestyle backgrounds",
      "A matched set across every placement size",
      "Retouching and format variants from one approved base",
    ],
    imageFile: "service-product-visuals",
    imageAlt: "A teal suede shoe styled on a pale pink set, propped up on bread rolls.",
  },
};

function toDetail(offering: ServiceOffering): CapabilityDetail {
  const draft = DRAFT_DETAILS[offering.title];
  if (!draft) {
    throw new Error(
      `No expanded copy drafted for capability "${offering.title}". Add it to DRAFT_DETAILS.`,
    );
  }
  return {
    // The approved title and descriptor come from the catalog entry, never from this file.
    ...offering,
    slug: capabilitySlug(offering.title),
    expandedCopy: draft.expandedCopy,
    deliverables: draft.deliverables,
    media: servicesImage(draft.imageFile, draft.imageAlt, "4:3"),
    // TODO(client): expanded copy — draft, pending approval.
    cta: createCta("Talk to us about this", "/contact"),
  };
}

const capabilityDetails: ReadonlyArray<CapabilityDetail> = capabilities.map(toDetail);

// TODO(client): expanded copy — draft, pending approval. Every `line` below is drafted.
// The NAMES are not: they are read from the engagement tiers the Ways to Work With Us
// section already renders, so a renamed tier fails here rather than going stale.
const DRAFT_ENGAGEMENT_LINES: Readonly<Record<string, string>> = {
  Launch: "One project at a time, or a small first batch of assets.",
  Grow: "A steady monthly flow of short-form and social content.",
  Scale: "Larger, multi-format production running across several services.",
  "Custom Creative Partnership": "A production model structured around your own requirement.",
};

const engagementSummaries: ReadonlyArray<EngagementSummary> = [
  ...waysToWorkBlock.tiers.map((tier) => tier.name),
  waysToWorkBlock.custom.name,
].map((name) => {
  const line = DRAFT_ENGAGEMENT_LINES[name];
  if (!line) {
    throw new Error(`No summary line drafted for engagement tier "${name}".`);
  }
  return { name, line };
});

/** The three homepage FAQ entries that answer service questions, reused verbatim. */
const REUSED_FAQ_QUESTIONS: ReadonlyArray<string> = [
  "Do you only create AI-generated content?",
  "Can I give you my own raw video footage?",
  "Can you create content from our existing documents or presentations?",
];

const reusedFaqItems = REUSED_FAQ_QUESTIONS.map((question) => {
  const item = faqBlock.items.find((candidate) => candidate.question === question);
  if (!item) {
    throw new Error(`FAQ entry "${question}" is no longer in the brief's FAQ block.`);
  }
  return item;
});

export const creativeServicesPage: CreativeServicesPage = {
  hero: {
    // TODO(client): expanded copy — draft, pending approval (eyebrow, heading, body).
    eyebrow: "Creative Services",
    heading: "Six creative services, produced by one team.",
    body: "Design, video, AI-assisted production, motion and product visuals. Expand any one below for what's actually included.",
    cta: createCta("Start a Conversation", "/contact"),
    media: servicesImage(
      "service-hero-band",
      // TODO(client): stock photography — see docs/content-todo.md.
      "Hands drawing on a technical plan at a dark desk.",
      "16:9",
    ),
  },
  // TODO(client): expanded copy — draft, pending approval (both labels).
  indexLabel: "Jump to a service",
  deliverablesLabel: "What's included",
  capabilities: capabilityDetails,
  processPointer: {
    // TODO(client): expanded copy — draft, pending approval (eyebrow and process heading).
    eyebrow: "How we work",
    // The five steps are the client's own, reused verbatim; only the heading is written
    // for this page, so the sequence here can never drift from the homepage's.
    process: {
      heading: "Five steps, on every service.",
      // The reveal label belongs to the homepage's frames, which this page does not
      // render — it is carried through from the same source rather than restated, so
      // there is still exactly one definition of it.
      revealLabel: processBlock.revealLabel,
      steps: processBlock.steps,
    },
    cta: createCta("See how we work", "/how-we-work"),
  },
  engagementPointer: {
    // TODO(client): expanded copy — draft, pending approval (eyebrow, heading, body).
    // The four summary lines are drafted too — see DRAFT_ENGAGEMENT_LINES above.
    eyebrow: "Ways to engage",
    heading: "Pick the engagement that fits the volume.",
    body: "The same six services, bought four ways — from a single project to an ongoing partnership. Full breakdown on Ways to Work With Us.",
    summaries: engagementSummaries,
    cta: createCta("Compare every engagement", "/ways-to-work-with-us"),
  },
  faq: {
    // TODO(client): expanded copy — draft, pending approval (eyebrow and heading). The
    // homepage's FAQ heading is still an unfilled placeholder; this page proposes one
    // rather than repeating that gap.
    eyebrow: "Questions",
    heading: "Questions about these services.",
    group: "services-and-capability",
    block: {
      items: [
        ...reusedFaqItems,
        {
          // TODO(client): expanded copy — draft, pending approval. The only FAQ entry on
          // this page that is not the client's own; the other three are verbatim.
          question: "Can you work across more than one service at a time?",
          answer:
            "Yes. Most engagements combine two or three — a video edit that also needs motion graphics, or a product campaign that needs both stills and short-form video. We scope across the whole requirement rather than one service at a time.",
        },
      ],
    },
  },
  closingCta: {
    // TODO(client): expanded copy — draft, pending approval (heading and body). The CTA
    // label and the closing line are the client's own, reused from the homepage.
    heading: "Not sure which service you need?",
    body: "Describe what you are trying to produce. We will tell you which of these services it needs, and how we would scope it.",
    cta: createCta("Start a Conversation", "/contact"),
    closingLine: "Project today. Creative partner tomorrow.",
  },
};
