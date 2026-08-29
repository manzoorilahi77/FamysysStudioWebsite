import { createCta } from "../../../domain/shared/value-objects/Cta";
import { MediaRef } from "../../../domain/shared/value-objects/MediaRef";
import type { AspectRatio } from "../../../domain/shared/value-objects/MediaRef";
import type { ClosingCtaBlock } from "../../../domain/marketing/entities/ClosingCtaBlock";
import type { FooterContent } from "../../../domain/marketing/entities/FooterContent";
import type { HeroContent } from "../../../domain/marketing/entities/HeroContent";
import type { ManifestoBlock } from "../../../domain/marketing/entities/ManifestoBlock";
import type { PositioningBlock } from "../../../domain/marketing/entities/PositioningBlock";
import type { ProcessBlock } from "../../../domain/marketing/entities/ProcessBlock";
import type { SectionIntro } from "../../../domain/marketing/entities/SectionIntro";
import type { TalentBlock } from "../../../domain/marketing/entities/TalentBlock";
import type { ValuePillar } from "../../../domain/marketing/entities/ValuePillar";
import type {
  DifferentiatorsBlock,
  WorkSection,
} from "../../../domain/marketing/repositories/MarketingContentRepository";

const MOSAIC_ASPECT_RATIOS: ReadonlyArray<AspectRatio> = [
  "3:4",
  "1:1",
  "4:3",
  "1:1",
  "3:4",
  "4:3",
  "1:1",
  "3:4",
];

export const heroContent: HeroContent = {
  eyebrow: "Famysys Studio",
  headlineLines: ["Video, produced on an engineering cadence."],
  subhead:
    "Fixed scope, fixed schedule, one point of accountability from brief to delivery.",
  primaryCta: createCta("Book a call", "/contact"),
  secondaryCta: createCta("See the reel", "/work"),
  media: MediaRef.create({
    kind: "video",
    src: "/media/hero-loop.mp4",
    poster: "/media/hero-loop-poster.svg",
    alt: "Looping placeholder reel for the Famysys Studio hero",
    aspectRatio: "16:9",
  }),
  // Fidelity-loop pass 1, gap #1: the hero's drifting media mosaic. Mixed aspect ratios so the
  // staggered columns don't read as one repeated tile size.
  mosaicTiles: MOSAIC_ASPECT_RATIOS.map((aspectRatio, index) =>
    MediaRef.create({
      kind: "image",
      src: `/media/mosaic-${String(index + 1).padStart(2, "0")}.svg`,
      alt: `Placeholder reel still ${index + 1}`, // TODO(client): replace with real production stills/clips before publishing
      aspectRatio,
    }),
  ),
};

export const manifestoBlock: ManifestoBlock = {
  eyebrow: "What we believe",
  statementLines: ["The first video is easy.", "The fortieth is the test."],
  supportingParagraph:
    "Any studio can produce one exceptional piece. Few can hold the same bar across fifty briefs in a quarter, on schedules they don't control. That consistency, not any single reel, is what we build for.",
  cta: createCta("See how we work", "/how-we-work"),
};

export const valuePillars: ReadonlyArray<ValuePillar> = [
  {
    title: "Studio-grade craft",
    description:
      "Senior editors and colorists on every project, not just the pitch reel. The same eye that wins the pitch finishes the cut.",
  },
  {
    title: "Built for volume",
    description:
      "Parallel production pipelines mean fifty deliverables in a month don't wait behind one editor's calendar.",
  },
  {
    title: "One team, end to end",
    description:
      "Strategy, production, and delivery sit inside one team. No handoff between the people who plan the work and the people who make it.",
  },
];

export const pillarsIntro: SectionIntro = {
  eyebrow: "How we're built",
  heading: "Three commitments, not a slogan.",
};

export const marqueeEyebrow = "Studios and in-house teams already shipping with us";

export const positioningBlock: PositioningBlock = {
  eyebrow: "Where we sit",
  heading: "Studio discipline, agency reach.",
  supportingParagraph:
    "We run production like an engineering team runs a release: scoped, scheduled, and reviewed before it ships. Clients get agency-grade creative without the agency-grade unpredictability.",
  media: MediaRef.create({
    kind: "video",
    src: "/media/positioning.mp4",
    poster: "/media/positioning-poster.svg",
    alt: "Looping placeholder reel illustrating the studio's positioning",
    aspectRatio: "3:4",
  }),
};

export const metricsIntro: SectionIntro = {
  eyebrow: "Success in numbers",
  heading: "What a quarter with Famysys Studio looks like.",
};

export const servicesIntro: SectionIntro = {
  eyebrow: "What we make",
  heading: "Every offering, one production process.",
};

export const workSection: WorkSection = {
  intro: {
    eyebrow: "Selected work",
    heading: "Different briefs, different constraints.",
  },
  exploreCta: createCta("Explore all our work", "/work"),
};

export const comparisonIntro: SectionIntro = {
  eyebrow: "How we compare",
  heading: "Same question, five different answers.",
};

export const testimonialsIntro: SectionIntro = {
  eyebrow: "What clients say",
  heading: "Ask the people who've already shipped with us.",
};

export const processBlock: ProcessBlock = {
  eyebrow: "How a project runs",
  heading: "Four steps. Every project, every time.",
  steps: [
    {
      title: "Brief",
      description:
        "We turn your goal into a scoped, scheduled brief before anyone books a camera.",
    },
    {
      title: "Build",
      description: "Production runs against that scope — no rediscovering requirements mid-shoot.",
    },
    {
      title: "Review",
      description: "One structured review round, with feedback collected in one place, not three.",
    },
    {
      title: "Deliver",
      description: "Final files land on the date set at brief, in the formats you specified.",
    },
  ],
};

export const differentiatorsBlock: DifferentiatorsBlock = {
  intro: {
    eyebrow: "Why Famysys",
    heading: "Four things that don't change between projects.",
  },
  items: [
    {
      title: "One review round, one turnaround window",
      description:
        "Feedback comes back once, against a turnaround window set at brief — not an open-ended back-and-forth that eats the schedule.",
    },
    {
      title: "Fixed scope, fixed price",
      description: "The brief is the contract. Scope changes get a conversation, not a surprise invoice.",
    },
    {
      title: "You own the raw footage",
      description: "Every frame we shoot is yours after delivery — archived and handed over, not held back for a future edit fee.",
    },
    {
      title: "Every format, delivered once",
      description: "Vertical, square, broadcast — cut once, exported to every spec you need, not billed as separate deliverables.",
    },
  ],
};

export const talentBlock: TalentBlock = {
  eyebrow: "Who you'll work with",
  heading: "A team you can name, not a roster you're assigned.",
  supportingParagraph:
    "Every engagement runs through a small group of senior editors, colorists, and producers — the same people from the first call to the last delivery.",
  tiles: Array.from({ length: 9 }, (_, index) =>
    MediaRef.create({
      kind: "image",
      src: `/media/talent-${String(index + 1).padStart(2, "0")}.svg`,
      alt: `Placeholder portrait tile ${index + 1}`, // TODO(client): replace with real team portraits before publishing
      aspectRatio: "1:1",
    }),
  ),
  // Fidelity-loop pass 1, gap #6: generic discipline labels for the tile chips — not names,
  // see docs/content-todo.md §4.15 for why real names aren't available yet.
  roles: [
    "Senior Editor",
    "Colorist",
    "Producer",
    "Motion Design",
    "Sound Design",
    "Cinematographer",
    "VFX Artist",
    "Creative Lead",
    "Animator",
  ],
};

export const closingCta: ClosingCtaBlock = {
  headlineLines: ["Let's put a number on your next quarter."],
  supportingParagraph:
    "Tell us what you need to ship. We'll come back with a scoped plan and a fixed price before we start.",
};

export const footerContent: FooterContent = {
  tagline: "Video design and creative production, run like an engineering team.",
  contactEmail: "hello@famysys.com", // TODO(client): fabricated placeholder — confirm real contact address
  legalLinks: [createCta("Privacy policy", "/privacy"), createCta("Terms of use", "/terms")],
  socialLinks: [
    createCta("Twitter", "https://twitter.com/famysysstudio"), // TODO(client): fabricated placeholder — confirm real handle or remove
    createCta("LinkedIn", "https://www.linkedin.com/company/famysys-studio"), // TODO(client): fabricated placeholder — confirm real handle or remove
    createCta("Instagram", "https://www.instagram.com/famysysstudio"), // TODO(client): fabricated placeholder — confirm real handle or remove
  ],
};
