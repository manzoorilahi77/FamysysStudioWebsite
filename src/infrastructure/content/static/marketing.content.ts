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

import { Url } from "../../../domain/shared/value-objects/Url";
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
// Every file below is stock photography from Unsplash, standing in until the studio's own
// production stills exist. Unsplash ids are listed in docs/content-todo.md. The six were
// chosen against the hero's ground — dark ink with the accent's teal and the glow's pink —
// so the strip reads as one palette rather than six stock frames. The alt text describes
// what each frame actually shows, so it has to be rewritten alongside the images.
//
// THE LABELS ARE THE MANAGER'S SIX (10 Sep 2026), one per band, in this order. They are not
// the six capability titles verbatim: "Reels & Shorts" is a deliverable of Video Production
// & Editing rather than a service of its own, and Explainer & Training Videos has no band.
// That trade was made knowingly — short-form is the request that arrives most often — and
// the phone shows bands 2, 4 and 5 (see HERO_MOBILE_BANDS in Hero.tsx), which is why Video
// Editing, AI Content Creation and Motion Graphics sit in those slots.
interface HeroBandSource {
  readonly file: string;
  readonly label: string;
  readonly alt: string;
}

const HERO_BANDS: ReadonlyArray<HeroBandSource> = [
  {
    file: "hero-band-graphic-design",
    label: "Graphic Design",
    alt: "A gloved hand drawing on a tablet with a stylus at a dark wooden desk, a keyboard in front.",
  },
  {
    file: "hero-band-video-editing",
    label: "Video Editing",
    alt: "A video editing timeline on a dark screen, its clips in bands of teal and pink.",
  },
  {
    file: "hero-band-reels",
    label: "Reels & Shorts",
    alt: "A phone held up to record vertical video, lit by purple stage light.",
  },
  {
    file: "hero-band-ai-content",
    label: "AI Content Creation",
    alt: "An abstract rendered form folding over itself in blue and violet light on black.",
  },
  {
    file: "hero-band-motion-graphics",
    label: "Motion Graphics",
    alt: "A ribbon of pink and blue light trails curving through darkness.",
  },
  {
    file: "hero-band-brand-visuals",
    label: "Brand Visuals",
    alt: "A glass perfume bottle on a reflective surface, lit in blue and pink.",
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
  // TODO(client): the brief supplies no footer tagline. The sentence below is the brief's
  // own central-idea sentence, not new copy. It is NO LONGER PRINTED IN THE FOOTER — the
  // block under the wordmark is the address and the email now — but /contact still reads
  // it for its "Or reach us directly" panel, which is why it is still here.
  tagline:
    "A professional creative production partner — combining human creativity, AI and efficient production.",
  // TODO(client): THIS IS THE PARENT'S MAILBOX, NOT CONFIRMED AS THE STUDIO'S.
  // hello@famysys.com is the address on famysys.com's own contact page. The Studio may
  // share the mailbox or may have its own; nothing in the brief says which, and the
  // footer prints it on all seven pages, so this is the single most-published unconfirmed
  // string on the site. See docs/content-todo.md.
  contactEmail: "hello@famysys.com",
  contactLink: createCta("Contact", "/contact"),
  // SUPPLIED BY THE CLIENT, 2026-09-10, as the address the footer is to print.
  //
  // TODO(client): CONFIRM THE ZIP. famysys.com's own footer prints this address with
  // 77407; the wording supplied for the Studio reads 77447. Richmond, TX is 774xx either
  // way and only one of the two is right, so the digit is transcribed as given and
  // flagged rather than silently corrected to the parent's. An address is the one piece
  // of footer content a reader may act on physically — post, couriers, a visit — and it
  // now renders on all seven pages. See docs/content-todo.md.
  addressLines: [
    "10193 W Grand Parkway S.",
    "Ste. 103-229, Richmond,",
    "Texas 77447 United States",
  ],
  // ALL THREE ARE PAGES NOW. /terms and /privacy are drafted against famysys.com's own
  // documents and marked for legal review clause by clause — see terms.content.ts,
  // privacy.content.ts and docs/content-todo.md; each prints a review-status line under
  // its date until the review is done. /faq gathers every question on the site, grouped
  // and open. internalLinks.test.ts asserts all three resolve and keeps its pending-route
  // exemption empty.
  legalLinks: [
    createCta("Terms & Conditions", "/terms"),
    createCta("Privacy Policy", "/privacy"),
    createCta("FAQ", "/faq"),
  ],
  // ONE LINK, TWO DIALOGS. LinkedIn is the company page the client supplied and opens in
  // a new tab. Instagram and YouTube have no account yet: each is `null` here and renders
  // as a button that opens the "coming soon" dialog below, naming the network — so the
  // column is honest about what exists without a dead link or a name that does nothing.
  // Supplying a handle is one edit: put the URL here and the dialog stops for that
  // network. See docs/content-todo.md.
  socialLinks: [
    {
      network: "linkedin",
      label: "LinkedIn",
      href: Url.create("https://www.linkedin.com/company/famysys/home/"),
    },
    { network: "instagram", label: "Instagram", href: null },
    { network: "youtube", label: "YouTube", href: null },
  ],
  // THE CAPABILITY DECK, IN THE PARENT'S OWN FOOTER POSITION — under the identity block,
  // beneath the email. famysys.com sets it as a bordered button with an arrow and a copy
  // control; here it is a plain link, at the client's direction (10 September 2026): the
  // Studio's footer is a list of links and a button in the middle of it would be the only
  // object in the band.
  //
  // THERE IS NO FILE YET, so `href` is null and the label opens the dialog below instead —
  // the same arrangement Instagram and YouTube use, for the same reason: a name that does
  // nothing when pressed reads as broken, and a link to nowhere is worse. The client has
  // said the URL will follow. Supplying it is one edit: put it here and the label becomes
  // a link that opens in a new tab, and the dialog stops.
  //
  // TODO(client): the deck's URL, once the deck exists.
  //
  // TODO(client): the label. famysys.com calls its own "Corporate Capability Deck"; the
  // Studio's is named "Capability Deck" here because "Corporate" is the parent's word for
  // a parent-company document, and this deck is the Studio's. Confirm which name the file
  // will carry, because the footer prints it on every page.
  capabilityDeck: {
    label: "Capability Deck",
    href: null,
    // TODO(client): expanded copy — draft, pending approval. Says what is true (the deck
    // is being prepared), and where the same material is meanwhile (this site). It does
    // not apologise and it does not promise a date, because no date has been given.
    pending: {
      eyebrow: "In preparation",
      body: "The deck is being put together. Until it is ready, what it will hold — the services, the way of working and the engagement models — is set out across this site.",
      closeLabel: "Close",
    },
  },
  // TODO(client): expanded copy — draft, pending approval (all three). The dialog prints
  // the network's own name as its heading, so the body speaks about "this channel" and
  // fits both. Plain and declarative, as the site's voice is: it says what is true and
  // where the work is meanwhile, and does not apologise for a channel not existing yet.
  socialPending: {
    eyebrow: "Coming soon",
    body: "This channel is being set up. Until it is live, the studio's work is on this site, and the LinkedIn page carries what is new.",
    closeLabel: "Close",
  },
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
