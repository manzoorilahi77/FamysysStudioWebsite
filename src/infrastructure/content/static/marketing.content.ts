// Every string in this file is the client's own copy, taken verbatim from their
// briefs — the V1 Homepage Content Brief, and (in `aboutBlock` at the foot of the
// file) the About brief. Do not paraphrase or "improve" it here — content changes
// come from the brief, not from the codebase. Anything the brief did not supply is
// recorded in docs/content-todo.md rather than invented.
//
// This file is the ONE place the client's own words live. Page content modules
// (creative-services, how-we-work, ways-to-work, selected-work, about) import from
// here rather than retyping, so an approved string has exactly one definition and
// the pages cannot drift from each other.

import { createCta } from "../../../domain/shared/value-objects/Cta";
import { MediaRef } from "../../../domain/shared/value-objects/MediaRef";
import type { AspectRatio } from "../../../domain/shared/value-objects/MediaRef";
import type { ClosingCtaBlock } from "../../../domain/marketing/entities/ClosingCtaBlock";
import type { DifferentiatorBlock } from "../../../domain/marketing/entities/DifferentiatorBlock";
import type { FaqBlock } from "../../../domain/marketing/entities/FaqBlock";
import type { FooterContent } from "../../../domain/marketing/entities/FooterContent";
import type { HeroContent } from "../../../domain/marketing/entities/HeroContent";
import type { ProcessBlock } from "../../../domain/marketing/entities/ProcessBlock";
import type { SectionIntro } from "../../../domain/marketing/entities/SectionIntro";
import type { WaysToWorkBlock } from "../../../domain/marketing/entities/EngagementTier";
import type { WhyFamysysBlock } from "../../../domain/marketing/entities/WhyFamysysBlock";
import type { WhatWeDoIntro } from "../../../domain/marketing/repositories/MarketingContentRepository";

// Mixed aspect ratios so the hero mosaic's staggered columns don't read as one repeated
// tile size. Eight slots, ready for real Famysys Studio stills one-for-one.
//
// TODO(client): every file below is stock photography from Unsplash, standing in until
// the studio's own production stills exist. Source URLs are listed in
// docs/content-todo.md. The alt text describes what each stock frame actually shows, so
// it has to be rewritten alongside the images.
interface MosaicTile {
  readonly file: string;
  readonly alt: string;
  readonly aspectRatio: AspectRatio;
}

const MOSAIC_TILES: ReadonlyArray<MosaicTile> = [
  { file: "mosaic-01", alt: "A clapperboard held up at the start of a take.", aspectRatio: "3:4" },
  { file: "mosaic-02", alt: "A video edit timeline filling a monitor.", aspectRatio: "1:1" },
  {
    file: "mosaic-03",
    alt: "A camera body and two lenses laid out on a dark surface.",
    aspectRatio: "4:3",
  },
  {
    file: "mosaic-04",
    alt: "Footage open in an editing application on a desktop display.",
    aspectRatio: "1:1",
  },
  {
    file: "mosaic-05",
    alt: "A camera rig filming a performer under coloured light.",
    aspectRatio: "3:4",
  },
  {
    file: "mosaic-06",
    alt: "A designer's desk with creative-suite app icons on a tablet.",
    aspectRatio: "4:3",
  },
  {
    file: "mosaic-07",
    alt: "A mirrorless camera beside a laptop showing a photo library.",
    aspectRatio: "1:1",
  },
  { file: "mosaic-08", alt: "A compact camera lit in blue and magenta.", aspectRatio: "3:4" },
];

export const heroContent: HeroContent = {
  heading: "Creative production, without the agency overhead.",
  body: "Design, video, AI-powered content, motion and product visuals — produced by a flexible creative team that helps businesses create high-quality content efficiently and at better value.",
  primaryCta: createCta("Start a Conversation", "/contact"),
  secondaryCta: createCta("Explore Our Services", "/creative-services"),
  supportingLine: "Project-based when you need it. Ongoing when you need more.",
  mosaicTiles: MOSAIC_TILES.map((tile) =>
    MediaRef.create({
      kind: "image",
      src: `/media/${tile.file}.jpg`,
      alt: tile.alt,
      aspectRatio: tile.aspectRatio,
    }),
  ),
};

export const whatWeDoIntro: WhatWeDoIntro = {
  intro: {
    eyebrow: "Our capabilities",
    heading: "One creative partner for your ongoing content needs.",
    body: "From a single promotional video to an ongoing stream of marketing content, Famysys Studio brings creative thinking, production expertise and AI-enabled workflows together under one roof.",
  },
  cta: createCta("Explore All Services", "/creative-services"),
};

// TODO(client): the four element images are Unsplash stock, standing in until the studio
// has its own frames for each. Source ids are listed in docs/content-todo.md. Each was
// picked against its element specifically — a stylus over artwork for Human Creativity, a
// design tool on screen for Intelligent AI Workflows, an edit workstation for Professional
// Production, an organised desk for Efficient Delivery — so a replacement has to match the
// same subject, and the `alt` has to be rewritten with it.
function differentiatorImage(file: string, alt: string): MediaRef {
  return MediaRef.create({ kind: "image", src: `/media/${file}.jpg`, alt, aspectRatio: "4:3" });
}

export const differentiatorBlock: DifferentiatorBlock = {
  heading: "The right mix of creativity, technology and people.",
  body: "AI has changed how creative work can be produced. But great creative work still requires judgment, storytelling, design sense and human quality control.",
  leadIn: "At Famysys Studio, we combine:",
  elements: [
    {
      title: "Human Creativity",
      description: "Ideas, storytelling, art direction and creative judgment.",
      media: differentiatorImage(
        "element-01",
        "A hand holding a stylus over a tablet, resting on printed digital-painting artwork.",
      ),
    },
    {
      title: "Intelligent AI Workflows",
      description:
        "AI used where it genuinely improves speed, flexibility and production possibilities.",
      media: differentiatorImage(
        "element-02",
        "An ultrawide monitor on a studio desk showing a design tool full of layout artboards.",
      ),
    },
    {
      title: "Professional Production",
      description: "Design, editing, motion, compositing and finishing.",
      media: differentiatorImage(
        "element-03",
        "Overhead view of an editor working at a three-screen workstation in a darkened room.",
      ),
    },
    {
      title: "Efficient Delivery",
      description:
        "Structured workflows designed to deliver quality without unnecessary agency overhead.",
      media: differentiatorImage(
        "element-04",
        "A tidy desk with a laptop and monitor, both showing content dashboards, in daylight.",
      ),
    },
  ],
  closingStatement: "AI is our production advantage — not our identity.",
};

export const processBlock: ProcessBlock = {
  heading: "From idea to finished creative.",
  steps: [
    {
      title: "Understand",
      description:
        "We understand what you're trying to communicate, who it's for and what success looks like.",
    },
    {
      title: "Create",
      description: "We develop the concept, script, design direction or production approach.",
    },
    {
      title: "Produce",
      description:
        "Our team combines creative tools, AI and human production expertise to build the content.",
    },
    {
      title: "Refine",
      description: "We review, refine and incorporate feedback within the agreed scope.",
    },
    {
      title: "Deliver",
      description: "You receive polished, platform-ready creative assets.",
    },
  ],
};

// No public pricing anywhere — every engagement is scoped around the actual
// requirement (brief, §Ways to Work With Us).
export const waysToWorkBlock: WaysToWorkBlock = {
  heading: "Flexible ways to work with Famysys Studio.",
  body: "Whether you need one creative asset or an ongoing production partner, we can adapt to your requirements.",
  tiers: [
    {
      name: "Launch",
      descriptor: "Essential Content",
      summary: "For businesses looking to establish or refresh their regular creative output.",
      idealFor: "Small businesses, local businesses, startups and growing brands.",
      typicalWork:
        "Social creatives, short-form content, promotional assets and basic video production.",
      cta: createCta("Talk to us", "/contact"),
    },
    {
      name: "Grow",
      descriptor: "Growth Content",
      summary: "For businesses that need a more consistent flow of video and creative content.",
      idealFor:
        "Growing businesses, brands, training companies and businesses actively investing in digital marketing.",
      typicalWork:
        "Short-form video, UGC editing, AI-assisted video, social creatives, motion and content adaptations.",
      cta: createCta("Talk to us", "/contact"),
    },
    {
      name: "Scale",
      descriptor: "Advanced Creative",
      summary: "For businesses with larger or more sophisticated ongoing creative requirements.",
      idealFor: "Established businesses, B2B companies, product brands and marketing teams.",
      typicalWork:
        "Advanced video, explainers, training content, motion graphics, product visuals and multi-format creative production.",
      cta: createCta("Talk to us", "/contact"),
    },
  ],
  custom: {
    name: "Custom Creative Partnership",
    descriptor: "Your flexible creative production team.",
    summary:
      "For businesses that need ongoing creative support across multiple formats and services.",
    invitation: "Tell us what you need. We'll help structure the right production model.",
    cta: createCta("Talk to us about your requirements", "/contact"),
  },
};

/**
 * The brief's own field names for the two facts it gives about every tier. The Ways to
 * Work With Us page labels the same two rows in its comparison and reads them from here
 * rather than restating them.
 *
 * `WaysToWork.tsx` on the homepage still carries these two as component literals. It
 * cannot import this module — presentation/ may not reach infrastructure/ (see the
 * boundary rules) — so removing that duplication means threading them through as props
 * from `app/page.tsx`, which is a homepage change and not this page's to make. Logged in
 * docs/content-todo.md.
 */
export const TIER_FIELD_LABELS = {
  idealFor: "Ideal for",
  typicalWork: "Typical work includes",
} as const;

export const workIntro: SectionIntro = {
  eyebrow: "Selected Creative Work",
  heading: "Selected Creative Work",
  body: "A growing collection of work created by Famysys Studio across design, video, AI-powered production and creative content.",
};

export const whyFamysysBlock: WhyFamysysBlock = {
  heading: "Professional creative support. Without unnecessary overhead.",
  body: "We believe businesses shouldn't have to choose between expensive agencies and inconsistent freelancers. Famysys Studio is being built to provide a third option: a flexible, technology-enabled creative production team that can grow with your requirements.",
  reasons: [
    {
      title: "Flexible",
      description: "Start with a single project. Expand when you need more.",
    },
    {
      title: "Efficient",
      description:
        "AI and structured production workflows help us reduce unnecessary production overhead.",
    },
    {
      title: "Human-led",
      description: "Creative judgment, quality control and accountability remain with our team.",
    },
    {
      title: "Scalable",
      description:
        "Our production model is designed to grow from individual projects into ongoing creative partnerships.",
    },
    {
      title: "Value-driven",
      description:
        "Our goal is not simply to produce more cheaply — it is to deliver better creative value for the investment.",
    },
  ],
};

export const faqBlock: FaqBlock = {
  items: [
    {
      question: "Do you work with small businesses?",
      answer:
        "Yes. We work with businesses ranging from small and growing companies to larger organizations. Our engagement can start with a single project and expand as your requirements grow.",
    },
    {
      question: "Do you only create AI-generated content?",
      answer:
        "No. AI is one of our production tools, not the entirety of our service. We combine AI with conventional design, editing, motion graphics, stock assets and human creative direction.",
    },
    {
      question: "Can I give you my own raw video footage?",
      answer:
        "Yes. We can transform customer-provided footage into polished social and marketing content, including editing, text overlays, animation, music, captions, intro/outro and CTAs.",
    },
    {
      question: "Can you create content from our existing documents or presentations?",
      answer:
        "Yes. We can transform suitable documents, presentations and training material into professional video and visual content.",
    },
    {
      question: "Do you offer ongoing monthly support?",
      answer:
        "Yes. We can work on individual projects or provide ongoing creative production support.",
    },
    {
      question: "How much do your services cost?",
      answer:
        "We currently provide custom quotations rather than public pricing. Requirements vary significantly by complexity, volume and production approach.",
      cta: createCta("Talk to us about your project", "/contact"),
    },
    {
      question: "Can you do a sample before we commit?",
      answer:
        "For suitable opportunities, we may provide a preview or limited sample to understand expectations and demonstrate our approach before moving into a paid engagement.",
    },
  ],
};

export const closingCta: ClosingCtaBlock = {
  heading: "Have a creative requirement? Let's talk.",
  body: "Tell us what you're trying to create. We'll help you determine the right approach, scope and production model.",
  cta: createCta("Start a Conversation", "/contact"),
  closingLine: "Project today. Creative partner tomorrow.",
};

export const footerContent: FooterContent = {
  // TODO(client): the brief supplies no footer tagline, contact address or social
  // handles — see docs/content-todo.md. The tagline below is the brief's own
  // central-idea sentence, not new copy.
  tagline:
    "A professional creative production partner — combining human creativity, AI and efficient production.",
  contactEmail: "hello@famysys.com", // TODO(client): confirm the real contact address
  // TODO(client): NO LEGAL LINKS UNTIL THE DOCUMENTS EXIST. These were
  // createCta("Privacy policy", "/privacy") and createCta("Terms of use", "/terms"),
  // and both 404ed from every page on the site. /contact completes the seven content
  // pages, so these were the last dead links left, and a link to a policy that does not
  // exist is worse than no link — on a page that asks for someone's name, company and
  // email, a broken "Privacy policy" is the wrong thing to be broken. Restore both the
  // moment the client supplies the text. See docs/content-todo.md.
  legalLinks: [],
  socialLinks: [], // TODO(client): no social handles supplied in the brief
};

/**
 * The client's own copy from the About brief.
 *
 * VERBATIM, quoted directly in the brief:
 *   - `heading`
 *   - `belief` — the studio's central statement, and the About page's thesis
 *
 * COMPLETED FROM THE BRIEF'S OWN PHRASES. The brief gives each of these as a phrase
 * inside a longer sentence rather than as a standalone one, and the surrounding words
 * below were added only to make each a sentence. The phrases themselves are the
 * client's:
 *   - `approach` — "combining creative talent, emerging AI technologies and structured
 *     production workflows"
 *   - `ecosystem` — "part of the Famysys ecosystem"
 *   - `ambition` — "a scalable professional creative production company serving
 *     businesses in India and global markets"
 *   - `startingDeliberately` — "starting deliberately — building our capabilities,
 *     refining our processes and investing heavily in our team and production systems"
 *
 * Those four are listed in docs/content-todo.md so the client can replace each with the
 * brief's own full sentence. Nothing here was invented: the About page states no
 * headcount, founding date, office, client count or award, because the brief supplies
 * none and the studio is, in its own words, still starting.
 */
export const aboutBlock = {
  heading: "Building the next generation of creative production.",
  belief:
    "Modern creative production should be more flexible, efficient and accessible without compromising professional quality.",
  approach:
    "Famysys Studio combines creative talent, emerging AI technologies and structured production workflows.",
  ecosystem: "Famysys Studio is part of the Famysys ecosystem.",
  ambition:
    "Our ambition is to build a scalable professional creative production company serving businesses in India and global markets.",
  startingDeliberately:
    "We are starting deliberately — building our capabilities, refining our processes and investing heavily in our team and production systems.",
} as const;
