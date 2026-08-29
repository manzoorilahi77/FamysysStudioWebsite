// The eight planned pieces from the V1 Homepage Content Brief, §Selected Work.
// NONE of these have been produced yet — every title and description below is
// the client's own planned brief for a piece that does not exist. The media is
// a generated placeholder. See docs/content-todo.md before publishing.

import { MediaRef } from "../../../domain/shared/value-objects/MediaRef";
import { Slug } from "../../../domain/shared/value-objects/Slug";
import type { CaseStudy } from "../../../domain/portfolio/entities/CaseStudy";

// TODO(client): none of these pieces has been produced. The titles and descriptions are
// the client's own planned briefs; every cover is stock photography from Unsplash chosen
// to suggest the subject, with source URLs listed in docs/content-todo.md. `coverAlt`
// describes the stock frame, not the piece, so it must be rewritten with the artwork.
interface PlannedPiece {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly coverAlt: string;
}

const PLANNED_PIECES: ReadonlyArray<PlannedPiece> = [
  {
    slug: "famysys-studio-capability-film",
    title: "Famysys Studio Capability Film",
    description: "Show what the Studio itself can do.",
    coverAlt: "A cinema lens photographed close up against a dark background.",
  },
  {
    slug: "famysys-it-services-portfolio-film",
    title: "Famysys IT Services Portfolio Film",
    description: "B2B/corporate credibility.",
    coverAlt: "A small team working together at laptops around a table.",
  },
  {
    slug: "food-restaurant-creative-campaign",
    title: "Food / Restaurant Creative Campaign",
    description: "Multiple AI videos + social creatives.",
    coverAlt: "A plated dish being served at a restaurant table.",
  },
  {
    slug: "ugc-transformation",
    title: "UGC Transformation",
    description: "Raw footage → finished professional content.",
    coverAlt: "Social media apps in a folder on a phone screen.",
  },
  {
    slug: "synthesia-business-explainer",
    title: "Synthesia Business Explainer",
    description: "Show presenter + visual storytelling.",
    coverAlt: "A business portrait of a presenter against a plain background.",
  },
  {
    slug: "training-video-series",
    title: "Training Video Series",
    description: "Show scalable training production.",
    coverAlt: "A speaker addressing a seated group in a training room.",
  },
  {
    slug: "product-visual-campaign",
    title: "Product Visual Campaign",
    description: "Product imagery → lifestyle → promotional content.",
    coverAlt: "A white smartwatch photographed on a plain grey background.",
  },
  {
    slug: "motion-graphics-showcase",
    title: "Motion Graphics Showcase",
    description: "Demonstrate progression toward premium creative.",
    coverAlt: "A multi-monitor editing rig with colourful graphics on screen.",
  },
];

export const caseStudies: ReadonlyArray<CaseStudy> = PLANNED_PIECES.map((piece, index) => ({
  slug: Slug.create(piece.slug),
  reference: String(index + 1).padStart(2, "0"),
  title: piece.title, // TODO(client): planned piece, not yet produced
  description: piece.description,
  media: MediaRef.create({
    kind: "image",
    src: `/media/case-${String(index + 1).padStart(2, "0")}.jpg`,
    alt: piece.coverAlt,
    aspectRatio: "4:3",
  }),
}));
