// The eight planned pieces from the V1 Homepage Content Brief, §Selected Work.
// NONE of these have been produced yet — every title and description below is
// the client's own planned brief for a piece that does not exist. The media is
// a generated placeholder. See docs/content-todo.md before publishing.

import { MediaRef } from "../../../domain/shared/value-objects/MediaRef";
import { Slug } from "../../../domain/shared/value-objects/Slug";
import type { CaseStudy } from "../../../domain/portfolio/entities/CaseStudy";

interface PlannedPiece {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
}

const PLANNED_PIECES: ReadonlyArray<PlannedPiece> = [
  {
    slug: "famysys-studio-capability-film",
    title: "Famysys Studio Capability Film",
    description: "Show what the Studio itself can do.",
  },
  {
    slug: "famysys-it-services-portfolio-film",
    title: "Famysys IT Services Portfolio Film",
    description: "B2B/corporate credibility.",
  },
  {
    slug: "food-restaurant-creative-campaign",
    title: "Food / Restaurant Creative Campaign",
    description: "Multiple AI videos + social creatives.",
  },
  {
    slug: "ugc-transformation",
    title: "UGC Transformation",
    description: "Raw footage → finished professional content.",
  },
  {
    slug: "synthesia-business-explainer",
    title: "Synthesia Business Explainer",
    description: "Show presenter + visual storytelling.",
  },
  {
    slug: "training-video-series",
    title: "Training Video Series",
    description: "Show scalable training production.",
  },
  {
    slug: "product-visual-campaign",
    title: "Product Visual Campaign",
    description: "Product imagery → lifestyle → promotional content.",
  },
  {
    slug: "motion-graphics-showcase",
    title: "Motion Graphics Showcase",
    description: "Demonstrate progression toward premium creative.",
  },
];

export const caseStudies: ReadonlyArray<CaseStudy> = PLANNED_PIECES.map((piece, index) => ({
  slug: Slug.create(piece.slug),
  reference: String(index + 1).padStart(2, "0"),
  title: piece.title, // TODO(client): planned piece, not yet produced
  description: piece.description,
  media: MediaRef.create({
    kind: "image",
    src: `/media/case-${String(index + 1).padStart(2, "0")}.svg`,
    alt: `Placeholder artwork for ${piece.title}`, // TODO(client): replace once the piece is produced
    aspectRatio: "4:3",
  }),
}));
