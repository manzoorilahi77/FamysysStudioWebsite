// Content for the Selected Work page (/selected-work).
//
// READ THIS BEFORE EDITING. None of the eight pieces below has been produced. The
// titles and the one-line intents are the client's own planned briefs; everything else
// on the page was written to make an honest page out of a plan.
//
// TWO KINDS OF STRING LIVE HERE:
//
//   APPROVED — the eight titles, their intent lines and their two-digit references; the
//   hero's heading and intro; and the six capability names. These are NOT retyped here.
//   Each detail spreads its entry from `caseStudies`, the hero reads `workIntro`, and
//   every capability reference is looked up in `capabilities` and throws if the name has
//   changed. Do not add a literal title, intent line or capability name to this file.
//
//   DRAFT — everything else: the framing block, both expanded paragraphs per piece, the
//   filter labels, the status wording, the progression block, the cross-link block and
//   the closing CTA. Every one is marked
//   `TODO(client): expanded copy — draft, pending approval` and listed in
//   docs/content-todo.md.
//
// NOTHING INVENTED. No client name, no brand, no outcome, no metric, no view count, no
// testimonial, no date, no duration, no budget, no team credit, no award appears in any
// string in this file — and `StaticPortfolioRepository.test.ts` asserts it, alongside a
// browser check that asserts the same thing against the RENDERED page. A "what we are
// building" page is only honest while it stays a description of intent.

import { createCta } from "../../../domain/shared/value-objects/Cta";
import { MediaRef } from "../../../domain/shared/value-objects/MediaRef";
import type { AspectRatio } from "../../../domain/shared/value-objects/MediaRef";
import type { CaseStudy } from "../../../domain/portfolio/entities/CaseStudy";
import type {
  CaseStudyDetail,
  WorkCapabilityRef,
} from "../../../domain/portfolio/entities/CaseStudyDetail";
import type {
  ProgressionStage,
  SelectedWorkPage,
  WorkCategory,
} from "../../../domain/portfolio/entities/SelectedWorkPage";
import { workIntro } from "./marketing.content";
import { caseStudies } from "./portfolio.content";
import { capabilities } from "./services.content";
import { slugifyTitle } from "./slugify";

// TODO(client): every image below is stock photography from Unsplash, standing in until
// the piece it represents has been produced. Source ids are listed in
// docs/content-todo.md. The alt text describes what the stock frame actually shows — not
// what the piece will show — so it has to be rewritten the day the real cover lands.
function workImage(file: string, alt: string, aspectRatio: AspectRatio): MediaRef {
  return MediaRef.create({ kind: "image", src: `/media/${file}.jpg`, alt, aspectRatio });
}

/**
 * A capability the piece exercises, resolved against the six the client actually offers.
 * The lookup is the point: the filter taxonomy is not invented here, it IS the capability
 * list, and a renamed capability fails the build rather than leaving a chip pointing at a
 * fragment that no longer exists on /creative-services.
 */
function capabilityRef(title: string): WorkCapabilityRef {
  const offering = capabilities.find((candidate) => candidate.title === title);
  if (!offering) {
    throw new Error(
      `"${title}" is not one of the client's six capabilities, so no piece can exercise it.`,
    );
  }
  return { title: offering.title, href: `/creative-services#${slugifyTitle(offering.title)}` };
}

interface DraftPiece {
  readonly demonstrates: string;
  readonly whyThisPiece: string;
  readonly capabilityTitles: ReadonlyArray<string>;
  readonly imageFile: string;
  readonly imageAlt: string;
  readonly aspectRatio: AspectRatio;
}

// TODO(client): expanded copy — draft, pending approval. Every `demonstrates` and
// `whyThisPiece` string below is drafted, not supplied. Keyed by the approved title so a
// renamed piece fails loudly rather than silently losing its detail.
//
// The capability lists are a judgement, not a fact: the brief says what each piece is for
// but not which services it uses, so the mapping below is the studio's to confirm. It
// drives the filter chips and their counts, so a wrong mapping is visible on the page.
const DRAFT_PIECES: Readonly<Record<string, DraftPiece>> = {
  "Famysys Studio Capability Film": {
    demonstrates:
      "That the studio can carry a piece from script to grade without borrowing a crew. Framing, lighting, sound, edit and finish, in one film, with the studio itself as the subject.",
    whyThisPiece:
      "It is first because everything after it is easier to judge once a reader has seen the studio shoot itself. A studio unwilling to put its own name on a film has no standing to ask for yours.",
    capabilityTitles: ["Video Production & Editing", "Motion Graphics & Advanced Creative"],
    imageFile: "work-capability-film",
    imageAlt:
      "An empty photography studio: one softbox on a stand, a leaning mirror and a folding director's chair against a plain backdrop.",
    aspectRatio: "4:3",
  },
  "Famysys IT Services Portfolio Film": {
    demonstrates:
      "A corporate film that stays watchable. One interview setup, cut against screen capture and titles, with the argument carried by the edit rather than by music.",
    whyThisPiece:
      "Business buyers do not judge a studio on a showreel. They judge it on whether a film about a service they already understand is still worth finishing.",
    capabilityTitles: ["Video Production & Editing", "Motion Graphics & Advanced Creative"],
    imageFile: "work-it-services",
    imageAlt:
      "A man in an office talking and gesturing, with a colleague's hands and an open laptop in front of him.",
    aspectRatio: "3:4",
  },
  "Food / Restaurant Creative Campaign": {
    demonstrates:
      "One shoot turned into a campaign. Motion cuts for social, still frames for design, and AI-assisted variants for the placements a single shoot cannot cover on its own.",
    whyThisPiece:
      "Food is where a campaign is judged fastest — the appetite is there or it is not — and where the distance between a shoot and a campaign is easiest to see.",
    capabilityTitles: [
      "AI Video & Virtual Presenters",
      "Creative Design",
      "Product & Brand Visuals",
    ],
    imageFile: "work-food-campaign",
    imageAlt:
      "A pastry on a plate lit for a photograph, with a camera and a small reflector board set up beside it.",
    aspectRatio: "1:1",
  },
  "UGC Transformation": {
    demonstrates:
      "The distance between phone footage and a finished cut. The same clips before and after: colour matched across cameras, paced, captioned and finished.",
    whyThisPiece:
      "It is the request that arrives most often and the hardest to settle in words. Two versions of the same footage answer it without an argument.",
    capabilityTitles: ["Video Production & Editing"],
    imageFile: "work-ugc",
    imageAlt: "A hand holding a phone that is recording video, a street scene on its screen.",
    aspectRatio: "4:3",
  },
  "Synthesia Business Explainer": {
    demonstrates:
      "A presenter-led explainer built without a shoot day. A virtual presenter carries the script while graphics carry the detail.",
    whyThisPiece:
      "It puts a fair test on AI production. If the presenter holds attention through a full explainer, the tool has earned its place; if it does not, that is worth knowing before a project leans on it.",
    capabilityTitles: ["AI Video & Virtual Presenters", "Explainer & Training Videos"],
    imageFile: "work-synthesia",
    imageAlt:
      "A man sitting on the floor talking to a camera on a tripod, his face on its screen as he speaks.",
    // 4:3, where the other seven kept the ratio they were sourced at. The replacement is a
    // landscape frame and a 3:4 tile would have centre-cropped the camera out of it —
    // leaving a man talking to nothing, which is the one thing this piece has to show.
    aspectRatio: "4:3",
  },
  "Training Video Series": {
    demonstrates:
      "A series rather than a video. One template, one voice and one visual system, applied across modules so the last one looks like the first.",
    whyThisPiece:
      "Training is where volume breaks a production. A studio that can make one good module has proved nothing; a studio that can hold a set of them together has.",
    capabilityTitles: ["Explainer & Training Videos", "Video Production & Editing"],
    imageFile: "work-training",
    imageAlt:
      "A camera on a small tripod, a microphone and a laptop on a low table, with a seated person holding a second microphone.",
    aspectRatio: "4:3",
  },
  "Product Visual Campaign": {
    demonstrates:
      "One product photographed three ways — on seamless, in use, and cut into promotional layouts — so a single shoot supplies a catalogue, a campaign and a feed.",
    whyThisPiece:
      "Most product briefs arrive asking for photographs and end up needing assets. This piece is the argument for scoping the second thing first.",
    capabilityTitles: ["Product & Brand Visuals", "Creative Design"],
    imageFile: "work-product-visual",
    imageAlt:
      "A green glass bottle photographed from above on a plain surface, throwing a long lit shadow.",
    aspectRatio: "1:1",
  },
  "Motion Graphics Showcase": {
    demonstrates:
      "Motion as a finishing craft. Animated typography, transitions built for the cut they sit in, and compositing that is meant to go unnoticed.",
    whyThisPiece:
      "It is last because it is the level the other seven are climbing toward. Motion is what separates competent from premium, and it is the hardest of the eight to fake.",
    capabilityTitles: ["Motion Graphics & Advanced Creative", "Creative Design"],
    imageFile: "work-motion-graphics",
    imageAlt: "A video editing timeline on a screen, its clips in bands of green, pink and blue.",
    aspectRatio: "3:4",
  },
};

function toDetail(piece: CaseStudy): CaseStudyDetail {
  const draft = DRAFT_PIECES[piece.title];
  if (!draft) {
    throw new Error(`No expanded copy drafted for "${piece.title}". Add it to DRAFT_PIECES.`);
  }
  return {
    // The approved title, intent line and reference come from the portfolio entry, never
    // from this file.
    ...piece,
    demonstrates: draft.demonstrates,
    whyThisPiece: draft.whyThisPiece,
    capabilities: draft.capabilityTitles.map(capabilityRef),
    media: workImage(draft.imageFile, draft.imageAlt, draft.aspectRatio),
  };
}

const pieces: ReadonlyArray<CaseStudyDetail> = caseStudies.map(toDetail);

/**
 * The filter taxonomy, derived rather than declared: a capability becomes a chip only
 * because a piece exercises it, and the count is how many do. A category with nothing
 * behind it cannot exist, and one cannot go stale when a mapping changes.
 */
const categories: ReadonlyArray<WorkCategory> = capabilities
  .map((offering) => ({
    title: offering.title,
    count: pieces.filter((piece) =>
      piece.capabilities.some((capability) => capability.title === offering.title),
    ).length,
  }))
  .filter((category) => category.count > 0);

/** Resolves a stage's piece references, so a stage cannot point at a piece that is gone. */
function stage(title: string, body: string, slugs: ReadonlyArray<string>): ProgressionStage {
  for (const slug of slugs) {
    if (!pieces.some((piece) => piece.slug.value === slug)) {
      throw new Error(`Progression stage "${title}" references unknown piece "${slug}".`);
    }
  }
  return { title, body, pieceSlugs: slugs };
}

export const selectedWorkPage: SelectedWorkPage = {
  hero: {
    // TODO(client): expanded copy — draft, pending approval (eyebrow only). The heading
    // and the intro are the client's own Selected Work copy, read from
    // marketing.content.ts rather than retyped, so this page and the homepage cannot say
    // it differently.
    eyebrow: "What we are building",
    heading: workIntro.heading,
    body: workIntro.body,
    cta: createCta("Start a Conversation", "/contact"),
  },
  framing: {
    // TODO(client): expanded copy — draft, pending approval (every string below). This
    // block is what makes the rest of the page honest, and it is the first thing under
    // the hero on purpose. Do not cut it, and do not soften it into "coming soon".
    //
    // It was three paragraphs and is now one, at the manager's direction: the block has
    // one idea to carry and the other two paragraphs were elaborating it. The cut copy
    // is preserved verbatim in docs/content-todo.md rather than deleted. Two facts had
    // to survive the cut and did — that nothing here is finished, and that every cover
    // is a stand-in — because they are the only place the page says either in its own
    // running copy rather than in a chip or behind a dialog.
    eyebrow: "Where this stands",
    heading: "We decided not to put weak work online.",
    body: "We could have filled this page with footage made to other people's briefs. We chose eight of our own instead — none of them is finished, and every cover below is a stock frame.",
  },
  filter: {
    // TODO(client): expanded copy — draft, pending approval (both labels). The chip
    // titles are the client's six capability names and the counts are derived.
    label: "Filter by capability",
    allLabel: "All pieces",
    categories,
  },
  // TODO(client): expanded copy — draft, pending approval.
  gridLabel: "The eight pieces",
  // TODO(client): expanded copy — draft, pending approval. ONE wording, used on every
  // tile and in the detail view. A second wording would read as a second state.
  statusLabel: "Planned — not yet produced",
  statusExplanation:
    "This piece is planned. Nothing has been shot, and the frame above is stock photography standing in for work that does not exist yet.",
  pieces,
  detail: {
    // TODO(client): expanded copy — draft, pending approval (all five labels).
    demonstratesLabel: "What it demonstrates",
    whyLabel: "Why this piece",
    capabilitiesLabel: "Capabilities it exercises",
    mediaSlotLabel: "Where the finished piece will sit",
    closeLabel: "Close",
  },
  progression: {
    // TODO(client): expanded copy — draft, pending approval (every string below). The
    // ordering it describes is the brief's own: the list runs from a studio capability
    // film through to a motion graphics showcase, whose approved intent line is
    // "Demonstrate progression toward premium creative."
    eyebrow: "The order",
    heading: "Why these eight, and why in this order.",
    body: "The list is not a menu. It runs from proving the studio can shoot at all to proving it can finish at a level worth commissioning, and each group answers the question the group before it raises.",
    stages: [
      // One sentence each, at the manager's direction. The cards below carry a numeral,
      // an icon and the piece names, so a stage's copy has three other things saying the
      // same thing beside it; the longer versions are kept in docs/content-todo.md.
      stage("Prove the studio", "The first two films put the studio's own name on the work.", [
        "famysys-studio-capability-film",
        "famysys-it-services-portfolio-film",
      ]),
      stage(
        "Prove the range",
        "The middle three take one standard to a campaign, to footage somebody else shot, and to a presenter who does not exist.",
        ["food-restaurant-creative-campaign", "ugc-transformation", "synthesia-business-explainer"],
      ),
      stage("Prove it scales", "The last three move from a single piece to a system.", [
        "training-video-series",
        "product-visual-campaign",
        "motion-graphics-showcase",
      ]),
    ],
  },
  capabilityCrossLink: {
    // TODO(client): expanded copy — draft, pending approval (eyebrow and heading). The
    // six names and their fragments are read from the capability catalogue.
    //
    // No body, at the manager's direction: this is a navigation block, and six named
    // rows under a "Capabilities" eyebrow do not need two sentences telling a reader
    // that links lead somewhere. The cut sentences are in docs/content-todo.md.
    eyebrow: "Capabilities",
    heading: "Six capabilities, shown working.",
    links: capabilities.map((offering) => capabilityRef(offering.title)),
  },
  closingCta: {
    // TODO(client): expanded copy — draft, pending approval (heading and body). The CTA
    // label and the closing line are the client's own, reused from the homepage.
    heading: "Bring us the piece you actually need.",
    body: "The work above is what the studio is building for itself. What we build for you starts with a conversation about what it is for and who has to approve it.",
    cta: createCta("Start a Conversation", "/contact"),
    closingLine: "Project today. Creative partner tomorrow.",
  },
};
