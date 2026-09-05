import { CONTENT_FILE } from "./contentSources";
import { pointerFactory } from "./records";

/**
 * EVERY TOP-LEVEL BINDING THE CMS CAN WRITE INTO, in one place.
 *
 * A pointer is only meaningful next to the file it addresses, and the mapping code that
 * builds a record is not where anyone should be retyping `"marketing.content.ts"`. These
 * factories are the whole vocabulary: `hero("body")` is the `body` property of
 * `heroContent` in marketing.content.ts, and nothing outside this file constructs a
 * pointer from raw strings.
 *
 * A binding missing here is a binding the CMS cannot edit. That is the case for anything
 * declared inside a function body other than the two named at the foot of this file, and
 * for anything assembled at build time — a `.map()`, a lookup, a spread. Those are shown
 * read-only, with the reason, rather than quietly omitted.
 */

const F = CONTENT_FILE;

// ---------------------------------------------------------------------------
// marketing.content.ts — the client's own briefs. Everything here is approved copy.
// ---------------------------------------------------------------------------
export const hero = pointerFactory(F.marketing, "heroContent");
export const heroBands = pointerFactory(F.marketing, "HERO_BANDS");
export const whatWeDo = pointerFactory(F.marketing, "whatWeDoIntro");
export const differentiator = pointerFactory(F.marketing, "differentiatorBlock");
export const processHome = pointerFactory(F.marketing, "processBlock");
export const waysToWorkHome = pointerFactory(F.marketing, "waysToWorkBlock");
export const tierFieldLabels = pointerFactory(F.marketing, "TIER_FIELD_LABELS");
export const workIntro = pointerFactory(F.marketing, "workIntro");
export const whyFamysys = pointerFactory(F.marketing, "whyFamysysBlock");
export const faq = pointerFactory(F.marketing, "faqBlock");
export const homeClosingCta = pointerFactory(F.marketing, "closingCta");
export const footer = pointerFactory(F.marketing, "footerContent");
export const aboutBlock = pointerFactory(F.marketing, "aboutBlock");

// ---------------------------------------------------------------------------
// portfolio.content.ts and services.content.ts — also the client's own.
// ---------------------------------------------------------------------------
export const plannedPieces = pointerFactory(F.portfolio, "PLANNED_PIECES");
export const capabilityCatalogue = pointerFactory(F.services, "capabilities");

// ---------------------------------------------------------------------------
// The five page modules. Their page export mirrors the entity, so a path here is
// usually the path the CMS already walked to read the value.
// ---------------------------------------------------------------------------
export const creativeServices = pointerFactory(F.creativeServices, "creativeServicesPage");
export const capabilityDrafts = pointerFactory(F.creativeServices, "DRAFT_DETAILS");
export const engagementLines = pointerFactory(F.creativeServices, "DRAFT_ENGAGEMENT_LINES");

export const howWeWork = pointerFactory(F.howWeWork, "howWeWorkPage");
export const stepDrafts = pointerFactory(F.howWeWork, "DRAFT_STEPS");
export const exampleStages = pointerFactory(F.howWeWork, "DRAFT_EXAMPLE_STAGES");

export const waysToWork = pointerFactory(F.waysToWork, "waysToWorkPage");
export const tierDrafts = pointerFactory(F.waysToWork, "DRAFT_TIERS");

export const selectedWork = pointerFactory(F.selectedWork, "selectedWorkPage");
export const pieceDrafts = pointerFactory(F.selectedWork, "DRAFT_PIECES");

export const about = pointerFactory(F.about, "aboutPage");
export const contact = pointerFactory(F.contact, "contactPage");

/** about.content.ts declares each `MediaRef` as its own constant; the alt is argument 0's `alt`. */
export function aboutMediaAlt(constant: string) {
  return pointerFactory(F.about, constant)(0, "alt");
}

// ---------------------------------------------------------------------------
// The two function bodies. See `findBinding` in contentAst.ts for why these work and
// why the list is closed.
// ---------------------------------------------------------------------------
/** The one CTA all six capabilities share, inside `toDetail`. */
export const capabilityCta = pointerFactory(F.creativeServices, "toDetail")("cta");
/** The Custom Creative Partnership, inside `toCustomDetail`. */
export const customPartnership = pointerFactory(F.waysToWork, "toCustomDetail");

// ---------------------------------------------------------------------------
// Reasons a value is shown but cannot be written. Each says where the string really
// lives, so an editor knows where it WOULD be changed rather than only that it cannot be
// changed here.
// ---------------------------------------------------------------------------
export const READ_ONLY = {
  derived: "Derived at build time from other content — change the content it is read from.",
  slug: "Generated from the title. Changing it would break every link that points at it.",
  count: "A count of the records below, not a string.",
  spread:
    "Assembled from a list at build time. Edit the entries themselves in their own collection.",
} as const;
