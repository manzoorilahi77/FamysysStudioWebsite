// Content for the Ways to Work With Us page (/ways-to-work-with-us).
//
// TWO KINDS OF STRING LIVE HERE, and the difference matters:
//
//   APPROVED — the four tier names, their labels ("Essential Content" and the rest),
//   their summaries, and both of the brief's per-tier lists. NONE of these is retyped in
//   this file. Each detail below spreads its tier from `waysToWorkBlock`, the hero takes
//   that block's own heading and intro paragraph, and the two list labels come from
//   `TIER_FIELD_LABELS`. So every one of those strings keeps exactly one definition and
//   cannot drift from the homepage. Do not add a literal tier name, label, descriptor,
//   summary, "Ideal for" or "Typical work includes" here.
//
//   DRAFT — everything else: the expanded paragraphs, the two comparison rows the brief
//   does not supply, the how-to-choose questions, the scoping block, the two new FAQ
//   entries and the closing CTA. Every one is marked
//   `TODO(client): expanded copy — draft, pending approval` and listed in
//   docs/content-todo.md. Nothing here is final.
//
// NO PRICING, ANYWHERE. The brief is explicit: custom quotation only. Nothing below
// carries a figure, a range, a "starting from", a day rate, or a feature-gated
// comparison that would imply a cost ladder. `StaticEngagementRepository.test.ts`
// asserts that no DRAFTED string on this page mentions price, pricing or cost — the
// client's own FAQ answer about quotations is the only place either word appears.
//
// NO COMMITMENTS, EITHER. The brief supplies no turnaround, revision count, minimum
// term, notice period or capacity guarantee, and this is the page where inventing one
// does the most damage. The scoping block deliberately describes a sequence without
// saying how long any of it takes.

import { createCta } from "../../../domain/shared/value-objects/Cta";
import { MediaRef } from "../../../domain/shared/value-objects/MediaRef";
import type { AspectRatio } from "../../../domain/shared/value-objects/MediaRef";
import { Slug } from "../../../domain/shared/value-objects/Slug";
import type { FaqItem } from "../../../domain/marketing/entities/FaqBlock";
import type {
  CustomPartnership,
  EngagementTier,
} from "../../../domain/marketing/entities/EngagementTier";
import type {
  CustomPartnershipDetail,
  EngagementTierDetail,
} from "../../../domain/engagement/entities/EngagementTierDetail";
import type { WaysToWorkPage } from "../../../domain/engagement/entities/WaysToWorkPage";
import { TIER_FIELD_LABELS, faqBlock, waysToWorkBlock } from "./marketing.content";

// TODO(client): every image below is stock photography from Unsplash, standing in until
// the studio's own work exists. Source ids are listed in docs/content-todo.md. The alt
// text describes what each stock frame actually shows, so it has to be rewritten
// alongside the images. Each was chosen for a scale the studio actually operates at —
// one light, one phone, one pair of hands, two people at a table — and a replacement
// must not promise a crew this business does not have.
function tierImage(file: string, alt: string, aspectRatio: AspectRatio): MediaRef {
  return MediaRef.create({ kind: "image", src: `/media/${file}.jpg`, alt, aspectRatio });
}

function tierSlug(name: string): Slug {
  return Slug.create(
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, ""),
  );
}

/**
 * Splits one of the brief's list sentences — "A, B, C and D." — into its items.
 *
 * This is NOT a rewrite of approved copy: `joinListSentence` below reverses it exactly,
 * and a test round-trips every list through both and asserts the original string comes
 * back character for character. If the brief ever supplies a sentence this cannot
 * reproduce, that test fails rather than the page quietly reflowing the client's words.
 */
export function splitListSentence(sentence: string): ReadonlyArray<string> {
  const withoutPeriod = sentence.replace(/\.$/, "");
  const parts = withoutPeriod.split(", ");
  const last = parts.pop() ?? "";
  const tailIndex = last.lastIndexOf(" and ");
  if (tailIndex === -1) {
    return [...parts, last];
  }
  return [...parts, last.slice(0, tailIndex), last.slice(tailIndex + " and ".length)];
}

/** The inverse of `splitListSentence`, used only by its round-trip test. */
export function joinListSentence(items: ReadonlyArray<string>): string {
  if (items.length === 0) {
    return "";
  }
  if (items.length === 1) {
    return `${items[0]}.`;
  }
  const head = items.slice(0, -1);
  const tail = items[items.length - 1];
  return `${head.join(", ")} and ${tail}.`;
}

interface DraftTierDetail {
  readonly expandedCopy: string;
  readonly bestWhen: string;
  readonly engagementShape: string;
  readonly imageFile: string;
  readonly imageAlt: string;
}

// TODO(client): expanded copy — draft, pending approval. Every string in the block below
// is drafted. Keyed by the approved tier name so a renamed tier fails loudly rather than
// silently losing its detail.
//
// `bestWhen` and `engagementShape` describe SITUATIONS and SHAPES, never volumes, terms
// or turnarounds — "a recurring flow of short-form work" is a description; "four videos
// a month on a three-month minimum" would be a commitment the brief never made.
const DRAFT_TIERS: Readonly<Record<string, DraftTierDetail>> = {
  Launch: {
    expandedCopy:
      "The entry point, and not a lesser version of what follows. A local business that needs one promotional video, a startup that needs a first set of social creatives, a company that wants to see what the work looks like before committing to anything ongoing — all of that is Launch. It is scoped as a single project, delivered, and finished. If it turns into something continuing, it becomes Grow, and nothing produced here has to be redone for that to happen.",
    bestWhen:
      "You have one piece that has to exist, or you want to see the work before deciding anything about what comes after it.",
    engagementShape: "A single project, or one small batch, scoped and delivered on its own terms.",
    imageFile: "tier-launch",
    imageAlt:
      "A single studio light on a stand in a small room, with a desk and monitor out of focus behind it.",
  },
  Grow: {
    expandedCopy:
      "For businesses where the constraint has stopped being ideas and started being output. You know what you want to publish and roughly how often; what you do not have is the team or the hours to produce it at that rate. Grow is a continuing flow of short-form and social work — creator footage edited into finished pieces, long-form cut down into clips, social creatives produced against a plan rather than one request at a time.",
    bestWhen:
      "Publishing has become the bottleneck. The ideas exist and the finished pieces do not.",
    engagementShape:
      "A recurring flow of short-form and social work, planned as batches rather than requested piece by piece.",
    imageFile: "tier-grow",
    imageAlt: "A phone mounted on a tripod recording video in a shop, its timer running on screen.",
  },
  Scale: {
    expandedCopy:
      "For requirements that are not simply larger but more involved: an explainer that needs a script, a voice and motion graphics before it is anything; a training series that has to hold together across a dozen modules; a product campaign that has to arrive as stills, video and animation at once. Scale is where several of the six services run against the same brief at the same time — which is the part that is genuinely hard to assemble from freelancers hired separately.",
    bestWhen:
      "One idea has to appear in several formats at once, and holding them consistent matters as much as producing them.",
    engagementShape:
      "Multi-format production running across several services against a single brief.",
    imageFile: "tier-scale",
    imageAlt: "Hands drawing an illustration on a tablet with a stylus, a laptop open behind them.",
  },
};

function toTierDetail(tier: EngagementTier): EngagementTierDetail {
  const draft = DRAFT_TIERS[tier.name];
  if (!draft) {
    throw new Error(`No expanded copy drafted for tier "${tier.name}". Add it to DRAFT_TIERS.`);
  }
  return {
    // Name, descriptor, summary, idealFor, typicalWork and cta all come from the
    // client's approved block, never from this file.
    ...tier,
    slug: tierSlug(tier.name),
    expandedCopy: draft.expandedCopy,
    idealForItems: splitListSentence(tier.idealFor),
    typicalWorkItems: splitListSentence(tier.typicalWork),
    bestWhen: draft.bestWhen,
    engagementShape: draft.engagementShape,
    media: tierImage(draft.imageFile, draft.imageAlt, "4:3"),
  };
}

const tierDetails: ReadonlyArray<EngagementTierDetail> = waysToWorkBlock.tiers.map(toTierDetail);

function toCustomDetail(custom: CustomPartnership): CustomPartnershipDetail {
  return {
    ...custom,
    slug: tierSlug(custom.name),
    // TODO(client): expanded copy — draft, pending approval (paragraph, label and all
    // three items). The items describe the SHAPE of an arrangement deliberately: no
    // volume, no minimum term, no notice period, because the brief commits to none.
    expandedCopy:
      "Everything above assumes you already know what you need made. This does not. A Custom Creative Partnership is for businesses whose requirement moves — a changing mix of services, volumes that are not the same twice, work that arrives without much warning. Rather than fitting that into a tier, we build the production model around it: which services are in scope, how work reaches us, and how it comes back. It is the closest thing we offer to having a creative team, without hiring one.",
    coversLabel: "What a partnership usually covers",
    covers: [
      "Several of the six services running at once, rather than one at a time",
      "A requirement that changes shape month to month, rather than a fixed list of deliverables",
      "A production model agreed with you at the start, and revisited when the work moves",
    ],
    media: tierImage(
      "tier-custom",
      "Two people at a studio table comparing printed frames and colour swatches.",
      "16:9",
    ),
  };
}

const customDetail: CustomPartnershipDetail = toCustomDetail(waysToWorkBlock.custom);

/** The two homepage FAQ entries that answer engagement questions, reused verbatim. */
function reusedFaq(question: string): FaqItem {
  const item = faqBlock.items.find((candidate) => candidate.question === question);
  if (!item) {
    throw new Error(`FAQ entry "${question}" is no longer in the brief's FAQ block.`);
  }
  return item;
}

function tierByName(name: string): EngagementTierDetail {
  const tier = tierDetails.find((candidate) => candidate.name === name);
  if (!tier) {
    throw new Error(`Tier "${name}" is no longer in the brief's Ways to Work block.`);
  }
  return tier;
}

export const waysToWorkPage: WaysToWorkPage = {
  hero: {
    // TODO(client): expanded copy — draft, pending approval (eyebrow only). The heading
    // and the intro paragraph are the client's own, read from marketing.content.ts.
    eyebrow: "Ways to Work With Us",
    heading: waysToWorkBlock.heading,
    body: waysToWorkBlock.body,
    cta: createCta("Start a Conversation", "/contact"),
  },
  comparison: {
    // TODO(client): expanded copy — draft, pending approval (eyebrow, heading, body,
    // caption, and the "Best when" / "Engagement shape" row labels). The other two row
    // labels are the brief's own field names.
    eyebrow: "Compare",
    heading: "The three named tiers, side by side.",
    body: "The fourth — a Custom Creative Partnership — is deliberately not on this table. It is not a larger version of these three, so putting it in a column would misrepresent it. It has its own section below.",
    caption:
      "The three named engagement tiers compared across who they suit, what they typically produce, when they fit and how the engagement runs.",
    rowLabels: {
      idealFor: TIER_FIELD_LABELS.idealFor,
      typicalWork: TIER_FIELD_LABELS.typicalWork,
      bestWhen: "Best when",
      engagementShape: "Engagement shape",
    },
  },
  tiers: tierDetails,
  custom: customDetail,
  howToChoose: {
    // TODO(client): expanded copy — draft, pending approval (every string below). These
    // are questions a visitor answers about themselves, not qualifying questions asked
    // of them; each one resolves to exactly one tier so it can actually be acted on.
    eyebrow: "How to choose",
    heading: "Four questions that settle it.",
    body: "Answer these about your own situation rather than reading the tiers again. Each one points at a single engagement.",
    questions: [
      {
        question: "Do you need one asset, or a steady stream?",
        answer:
          "If it is one piece, or a small first batch to see how the work lands, start here. Nothing about starting here makes moving up harder later.",
        tierSlug: tierByName("Launch").slug.value,
        tierName: tierByName("Launch").name,
      },
      {
        question: "Is this a launch, or an ongoing programme?",
        answer:
          "A campaign with an end date is a project. Content that has to keep appearing belongs here instead — the point of it is the cadence, not any individual piece.",
        tierSlug: tierByName("Grow").slug.value,
        tierName: tierByName("Grow").name,
      },
      {
        question: "How many formats does one idea have to appear in?",
        answer:
          "One or two, and any of the tiers covers it. An idea that has to become a video, a set of stills, a motion sequence and a deck at once needs this one.",
        tierSlug: tierByName("Scale").slug.value,
        tierName: tierByName("Scale").name,
      },
      {
        question: "Are you buying finished work, or creative capacity?",
        answer:
          "If you know what needs making, one of the three named tiers covers it. If what you actually want is a creative team available across whatever comes up, that is this.",
        tierSlug: customDetail.slug.value,
        tierName: customDetail.name,
      },
    ],
  },
  scoping: {
    // TODO(client): expanded copy — draft, pending approval (every string below).
    // DELIBERATELY STATES NO DURATION: the brief gives none, and a turnaround written
    // here becomes a promise. If the studio wants to commit to one, that is a decision
    // to make on purpose rather than a sentence to inherit from a draft.
    eyebrow: "Scoping",
    heading: "What happens before a quotation.",
    body: "Every engagement is scoped around the actual requirement, so there is no figure to publish and nothing to configure. This is what sits between the first conversation and a number.",
    steps: [
      {
        title: "The first conversation",
        body: "You describe what you are trying to produce and who it is for. We ask what already exists, where the work will be published and who has to approve it. Nothing is quoted at this point, because nothing is scoped yet.",
      },
      {
        title: "What we need from you",
        body: "The requirement in whatever form it exists — a brief, a deck, a list of assets, or a description over a call. Brand guidelines, footage or source material you already hold. And the deadline, if there is one that is genuinely fixed.",
      },
      {
        title: "What you get back",
        body: "A written scope: every asset named, with its format, aspect ratio and length, and the engagement it sits inside. A quotation against that scope. And a note of anything we think is missing, unclear or likely to change.",
      },
      {
        title: "If the scope is wrong",
        body: "Say so, and we revise it and re-quote. It is a document at that stage, not an agreement. Agreeing the wrong scope quickly is a worse outcome than taking another pass to get it right.",
      },
    ],
  },
  faq: {
    // TODO(client): expanded copy — draft, pending approval (eyebrow, heading, and the
    // two new questions and answers). The cost question and the ongoing-support question
    // are the client's own, question and answer, reused verbatim from the brief.
    eyebrow: "Questions",
    heading: "Questions about engagements.",
    group: "pricing-and-engagement",
    block: {
      items: [
        reusedFaq("How much do your services cost?"),
        {
          question: "Can we move between these as we grow?",
          answer:
            "Yes, and it is the intended path. Launch exists partly so that a first project does not require deciding anything about what comes after it. Moving up does not restart anything: the brand work, the source files and the production setup all carry across.",
        },
        reusedFaq("Do you offer ongoing monthly support?"),
        {
          question: "What if none of the three named tiers fits?",
          answer:
            "Then it is a Custom Creative Partnership, which is not a fallback — it is where most ongoing work ends up. Describe the requirement and we will structure something around it rather than fitting it to a tier that was not built for it.",
        },
      ],
    },
  },
  closingCta: {
    // TODO(client): expanded copy — draft, pending approval (heading and body). The CTA
    // label and the closing line are the client's own, reused from the homepage.
    heading: "Not sure which of these you are?",
    body: "Describe the requirement in whatever detail you have. We will tell you which engagement it fits, or say plainly that it needs one of its own.",
    cta: createCta("Start a Conversation", "/contact"),
    closingLine: "Project today. Creative partner tomorrow.",
  },
};
