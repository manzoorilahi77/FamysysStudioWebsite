// The real 7-page site from the V1 Homepage Content Brief: Home, Creative
// Services, How We Work, Ways to Work With Us, Selected Work, About Famysys
// Studio, Contact. Only the homepage exists so far — every route below is a
// deliberate forward link to a page still to be built.

import { createCta } from "../../../domain/shared/value-objects/Cta";
import type { MegaMenuColumn, MegaMenuLink } from "../../../domain/navigation/entities/MegaMenuColumn";
import type { NavigationMenu } from "../../../domain/navigation/entities/NavigationMenu";

function megaLink(label: string, href: string, description: string): MegaMenuLink {
  return { ...createCta(label, href), description };
}

// The mega menu lists the six capabilities from §What We Do, split across two
// columns, plus the site's own pages — the brief defines no other service
// taxonomy, so nothing here is invented.
const capabilities: MegaMenuColumn = {
  title: "Creative Services",
  items: [
    megaLink(
      "Creative Design",
      "/creative-services#creative-design",
      "Social creatives, marketing collateral, presentations, brochures, banners and digital assets.",
    ),
    megaLink(
      "Video Production & Editing",
      "/creative-services#video-production-editing",
      "UGC editing, Reels, Shorts, promotional videos, business videos and content repurposing.",
    ),
    megaLink(
      "AI Video & Virtual Presenters",
      "/creative-services#ai-video-virtual-presenters",
      "AI-generated videos, virtual presenters, AI UGC, visual storytelling and AI-assisted production.",
    ),
  ],
};

const moreCapabilities: MegaMenuColumn = {
  title: "More capabilities",
  items: [
    megaLink(
      "Explainer & Training Videos",
      "/creative-services#explainer-training-videos",
      "Business explainers, training content, course videos, onboarding and instructional content.",
    ),
    megaLink(
      "Motion Graphics & Advanced Creative",
      "/creative-services#motion-graphics-advanced-creative",
      "Motion graphics, animated typography, visual effects, compositing and creative enhancements.",
    ),
    megaLink(
      "Product & Brand Visuals",
      "/creative-services#product-brand-visuals",
      "Product visuals, lifestyle imagery, promotional assets, campaign visuals and AI-assisted brand content.",
    ),
  ],
};

const howWeEngage: MegaMenuColumn = {
  title: "How we engage",
  items: [
    megaLink("How We Work", "/how-we-work", "From idea to finished creative."),
    megaLink(
      "Ways to Work With Us",
      "/ways-to-work-with-us",
      "Whether you need one creative asset or an ongoing production partner.",
    ),
  ],
};

const studio: MegaMenuColumn = {
  title: "Studio",
  items: [
    megaLink(
      "Selected Work",
      "/selected-work",
      "A growing collection of work created by Famysys Studio.",
    ),
    megaLink("About Famysys Studio", "/about", "Who we are and how the Studio is built."),
    megaLink("Contact", "/contact", "Tell us what you're trying to create."),
  ],
};

export const navigationContent: NavigationMenu = {
  primaryLinks: [
    createCta("Creative Services", "/creative-services"),
    createCta("How We Work", "/how-we-work"),
    createCta("Ways to Work With Us", "/ways-to-work-with-us"),
    createCta("Selected Work", "/selected-work"),
    createCta("About", "/about"),
  ],
  megaMenu: [capabilities, moreCapabilities, howWeEngage, studio],
  signIn: createCta("Contact", "/contact"),
  primaryCta: createCta("Start a Conversation", "/contact"),
};
