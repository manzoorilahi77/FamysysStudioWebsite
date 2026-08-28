import { createCta } from "../../../domain/shared/value-objects/Cta";
import { MediaRef } from "../../../domain/shared/value-objects/MediaRef";
import type { HeroContent } from "../../../domain/marketing/entities/HeroContent";
import type { ManifestoBlock } from "../../../domain/marketing/entities/ManifestoBlock";
import type { ValuePillar } from "../../../domain/marketing/entities/ValuePillar";

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
