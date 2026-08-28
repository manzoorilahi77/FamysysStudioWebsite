import { createCta } from "../../../domain/shared/value-objects/Cta";
import type { MegaMenuColumn, MegaMenuLink } from "../../../domain/navigation/entities/MegaMenuColumn";
import type { NavigationMenu } from "../../../domain/navigation/entities/NavigationMenu";

function megaLink(label: string, href: string, description: string): MegaMenuLink {
  return { ...createCta(label, href), description };
}

const videoProduction: MegaMenuColumn = {
  title: "Video production",
  items: [
    megaLink("Brand films", "/services/brand-films", "Long-form brand storytelling."),
    megaLink("Product films", "/services/product-films", "Launch and feature-explainer films."),
    megaLink("Explainers", "/services/explainers", "Short-form product and process walkthroughs."),
    megaLink(
      "Testimonial films",
      "/services/testimonial-films",
      "Customer stories, shot on location.",
    ),
    megaLink("Event coverage", "/services/event-coverage", "Multi-camera capture and same-week edits."),
  ],
};

const motionAndAnimation: MegaMenuColumn = {
  title: "Motion & animation",
  items: [
    megaLink("Motion graphics", "/services/motion-graphics", "Data, UI, and brand animation."),
    megaLink("2D animation", "/services/2d-animation", "Character and illustrative animation."),
    megaLink("3D & CGI", "/services/3d-cgi", "Product renders and dimensional environments."),
    megaLink("Title sequences", "/services/title-sequences", "Opening and closing brand moments."),
    megaLink("Kinetic type", "/services/kinetic-type", "Typography-led motion for dense copy."),
  ],
};

const postAndFinishing: MegaMenuColumn = {
  title: "Post & finishing",
  items: [
    megaLink("Editing", "/services/editing", "Assembly through final cut."),
    megaLink("Colour grade", "/services/colour-grade", "Look development and delivery grading."),
    megaLink("Sound design", "/services/sound-design", "Mix, score, and sound effects."),
    megaLink("VFX & cleanup", "/services/vfx-cleanup", "Compositing, rig removal, and paint work."),
    megaLink("Localisation", "/services/localisation", "Subtitling, dubbing, and market versioning."),
  ],
};

const creativeAndStrategy: MegaMenuColumn = {
  title: "Creative & strategy",
  items: [
    megaLink(
      "Concept development",
      "/services/concept-development",
      "Creative territories before a camera rolls.",
    ),
    megaLink("Scriptwriting", "/services/scriptwriting", "Scripts written for how they'll be shot."),
    megaLink("Storyboarding", "/services/storyboarding", "Shot-by-shot plans for approval before production."),
    megaLink(
      "Creative direction",
      "/services/creative-direction",
      "One point of creative accountability across a series.",
    ),
    megaLink("Casting", "/services/casting", "Talent sourcing and on-camera screen tests."),
  ],
};

export const navigationContent: NavigationMenu = {
  primaryLinks: [
    createCta("Services", "/services"),
    createCta("Our work", "/work"),
    createCta("Why us", "/why-us"),
    createCta("Resources", "/resources"),
    createCta("Pricing", "/pricing"),
  ],
  megaMenu: [videoProduction, motionAndAnimation, postAndFinishing, creativeAndStrategy],
  signIn: createCta("Sign in", "/sign-in"),
  primaryCta: createCta("Book a call", "/contact"),
};
