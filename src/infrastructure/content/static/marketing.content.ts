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

// The hero's accordion: six bands, one open at a time, standing for the six services the
// studio sells — the same six /creative-services sets out, in the same order the page does
// not depend on. Six and not eight: the strip is a column beside the headline rather than
// a wall behind it.
//
// IT WAS FIVE, and the note here said a sixth would leave no open band tall enough to read.
// That was true of the strip it was written against, which stopped growing at 520px: six
// bands there gave the open one 267px and each closed one 48px. The strip now runs to 58%
// of the viewport height — 626px at 1080 — where six bands give the open one 288px, more
// than the five ever had, and each closed one 63px against a 24px label. The band that was
// missing is the one the studio's own thesis names, and the right-hand side had a strip of
// empty ground under it that a sixth band is the honest way to fill.
//
// Aspect ratio is `3:4` on every band because the accordion sizes them itself: a band is
// a flex child of a fixed-height column and its image is `object-fit: cover`. The value
// is carried anyway because `MediaRef` requires one and the CMS media library lists it.
//
// TODO(client): every file below is stock photography, standing in until the studio's own
// production stills exist. Source URLs are listed in docs/content-todo.md. The alt text
// describes what each stock frame actually shows, so it has to be rewritten alongside the
// images.
interface HeroBandSource {
  readonly file: string;
  readonly label: string;
  readonly alt: string;
}

const HERO_BANDS: ReadonlyArray<HeroBandSource> = [
  {
    file: "hero-band-camera",
    label: "Camera & rig",
    alt: "A camera rig filming a performer under coloured light.",
  },
  {
    file: "hero-band-colour",
    label: "Colour",
    alt: "A colourist's desk with a grade open across two displays.",
  },
  {
    file: "hero-band-motion",
    label: "Motion",
    alt: "A motion graphic of a wave form rendered in long light trails.",
  },
  {
    file: "hero-band-design",
    label: "Design",
    alt: "A designer's desk with creative-suite app icons on a tablet.",
  },
  {
    file: "hero-band-content",
    label: "Content",
    alt: "A clapperboard held up at the start of a take.",
  },
  {
    // The one band whose picture is not a `hero-band-` file: /creative-services already
    // carries a frame for this service and its alt text is the client's own description of
    // it, so the band takes both rather than inventing a sixth stock image to say the same
    // thing. See `imageFile`/`imageAlt` for AI Video in creative-services.content.ts.
    file: "service-ai-video",
    label: "AI",
    alt: "A presenter in a grey jacket, standing to camera in front of an orange wall.",
  },
];

export const heroContent: HeroContent = {
  heading: "Creative production, without the agency overhead.",
  // TODO(client): SHORTENED FROM THE BRIEF, pending approval — the one string in this file
  // that is not the client's verbatim copy. The brief's sentence is 183 characters and set
  // four lines under the headline at every width, which is a paragraph where the hero wants
  // a line. This is 111, the longest that holds TWO lines from 390 up to 2560 (112 breaks
  // to three at 390 — measured, not estimated).
  //
  // Every idea in the original survives, in the client's own words: the five deliverables
  // are verbatim, so are "a flexible creative team" and "at better value". What went is
  // "produced by" (now "from") and the clause "that helps businesses create high-quality
  // content efficiently and", which restated the list it followed. The full original is
  // kept in docs/content-todo.md so a reviewer can compare the two.
  body: "Design, video, AI-powered content, motion and product visuals — from a flexible creative team, at better value.",
  primaryCta: createCta("Start a Conversation", "/contact"),
  secondaryCta: createCta("Explore Our Services", "/creative-services"),
  supportingLine: "Project-based when you need it. Ongoing when you need more.",
  bands: HERO_BANDS.map((band) => ({
    label: band.label,
    media: MediaRef.create({
      kind: "image",
      src: `/media/${band.file}.jpg`,
      alt: band.alt,
      aspectRatio: "3:4",
    }),
  })),
};

export const whatWeDoIntro: WhatWeDoIntro = {
  intro: {
    eyebrow: "Our capabilities",
    heading: "One creative partner for your ongoing content needs.",
    body: "One video or an ongoing content stream — creative thinking, production expertise and AI workflows, under one roof.",
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
  body: "AI changed how creative work gets made. It still takes judgment, storytelling and human quality control.",
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
  closingStatement: "AI is our production advantage not our identity",
};

export const processBlock: ProcessBlock = {
  heading: "From idea to finished creative.",
  // TODO(client): expanded copy — draft, pending approval. The homepage's five frames
  // show a step's numeral and name on the picture and keep its sentence behind them; this
  // is the button that opens the sentence where there is no pointer to hover with.
  revealLabel: "What happens here",
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
  // TODO(client): expanded copy — draft, pending approval. The two words the homepage's
  // four tiles need: one on the picture, one inside the panel it opens.
  openLabel: "Open",
  closeLabel: "Close",
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

// One frame per reason, and each is picked against its own claim rather than for being a
// nice studio photograph — the panel beside the ledger shows this image while that row is
// being read, so a mismatch is visible for as long as the reader is on the row. A
// replacement has to carry the same subject, and the `alt` has to be rewritten with it.
function reasonImage(file: string, alt: string): MediaRef {
  return MediaRef.create({ kind: "image", src: `/media/${file}.jpg`, alt, aspectRatio: "4:3" });
}

export const whyFamysysBlock: WhyFamysysBlock = {
  heading: "Professional creative support. Without unnecessary overhead.",
  body: "A third option between costly agencies and inconsistent freelancers — a flexible production team that grows with you.",
  reasons: [
    {
      title: "Flexible",
      description: "Start with a single project. Expand when you need more.",
      // The smallest complete setup there is: one phone, one tripod, one shop.
      media: reasonImage(
        "tier-grow",
        "A phone mounted on a tripod filming a rail of clothing in a small shop.",
      ),
    },
    {
      title: "Efficient",
      description:
        "AI and structured production workflows help us reduce unnecessary production overhead.",
      // The workflow itself, on screen — the claim is about tooling, not about people.
      media: reasonImage(
        "about-approach",
        "A colour-grading interface in close-up, showing colour wheels and a hue curve.",
      ),
    },
    {
      title: "Human-led",
      description: "Creative judgment, quality control and accountability remain with our team.",
      // Hands making a decision. The one reason whose subject has to be a person.
      media: reasonImage(
        "tier-scale",
        "Two hands drawing artwork on a tablet with a stylus, beside a laptop and a mug.",
      ),
    },
    {
      title: "Scalable",
      description:
        "Our production model is designed to grow from individual projects into ongoing creative partnerships.",
      // The other end of the same line the Flexible frame starts: a full stage and crew.
      media: reasonImage(
        "process-produce",
        "A film stage with rigged lighting, a camera crane and a crew of about a dozen at work.",
      ),
    },
    {
      title: "Value-driven",
      description:
        "Our goal is not simply to produce more cheaply — it is to deliver better creative value for the investment.",
      // Professional kit in an ordinary room: the result, without the overhead.
      media: reasonImage(
        "tier-launch",
        "A professional studio light on a stand, lighting a desk and monitor in a dark room.",
      ),
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
  // TODO(client): THIS IS THE PARENT'S ADDRESS, NOT CONFIRMED AS THE STUDIO'S.
  // hello@famysys.com is the address on famysys.com's own contact page. The Studio may
  // share the mailbox or may have its own; nothing in the brief says which, and the
  // footer prints it on all seven pages, so this is the single most-published unconfirmed
  // string on the site. See docs/content-todo.md.
  contactEmail: "hello@famysys.com",
  contactLink: createCta("Contact", "/contact"),
  // TODO(client): NO POSTAL ADDRESS UNTIL ONE IS CONFIRMED. The parent's footer prints
  // 10193 W Grand Parkway S., Ste. 103-229, Richmond, TX 77407, United States. Whether
  // the Studio operates from that address is not stated anywhere in the brief, and an
  // address is the one piece of footer content a reader may act on physically — post,
  // couriers, a visit. Null renders no address block at all rather than the parent's.
  addressLines: null,
  // TODO(client): drafted, pending approval. The parent's line is "AI-Native Digital
  // Engineering Partner", which describes an engineering firm; this is its Studio
  // equivalent, built from the brief's own three terms — human creativity, AI, efficient
  // production — and from "creative production partner", which is the client's phrase.
  descriptor: "AI-Enabled Creative Production Partner",
  // TODO(client): THE DOCUMENTS DO NOT EXIST YET. /terms and /privacy are not routes on
  // this site, so both links 404 until the pages are built — a deliberate, flagged
  // regression from the previous state, where the footer carried no legal row at all.
  // The parent's footer has this column and the Studio's structure now matches it; what
  // is missing is the two documents. Either supply them or the column comes back out.
  // See docs/content-todo.md.
  legalLinks: [
    createCta("Terms & Conditions", "/terms"),
    createCta("Privacy Policy", "/privacy"),
  ],
  // TODO(client): NO HANDLES SUPPLIED. The three names match the parent's column so the
  // structure is the parent's, but every href is null — deliberately, because the only
  // accounts that exist are the parent company's, and pointing the Studio's footer at
  // them would send a reader to a different business. See docs/content-todo.md.
  socialLinks: [
    { label: "LinkedIn", href: null },
    { label: "X", href: null },
    { label: "GitHub", href: null },
  ],
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
