// The six capabilities from the V1 Homepage Content Brief, §What We Do — the
// client's own names and descriptions, verbatim.

import type { ServiceOffering } from "../../../domain/services/entities/ServiceOffering";

export const capabilities: ReadonlyArray<ServiceOffering> = [
  {
    title: "Creative Design",
    description: "Social creatives, marketing collateral, presentations, brochures, banners and digital assets.",
  },
  {
    title: "Video Production & Editing",
    description: "UGC editing, Reels, Shorts, promotional videos, business videos and content repurposing.",
  },
  {
    title: "AI Video & Virtual Presenters",
    description: "AI-generated videos, virtual presenters, AI UGC, visual storytelling and AI-assisted production.",
  },
  {
    title: "Explainer & Training Videos",
    description: "Business explainers, training content, course videos, onboarding and instructional content.",
  },
  {
    title: "Motion Graphics & Advanced Creative",
    description: "Motion graphics, animated typography, visual effects, compositing and creative enhancements.",
  },
  {
    title: "Product & Brand Visuals",
    description: "Product visuals, lifestyle imagery, promotional assets, campaign visuals and AI-assisted brand content.",
  },
];
