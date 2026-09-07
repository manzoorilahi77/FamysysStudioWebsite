// The real 7-page site from the V1 Homepage Content Brief: Home, Creative
// Services, How We Work, Ways to Work With Us, Selected Work, About Famysys
// Studio, Contact. Only the homepage exists so far — every route below is a
// deliberate forward link to a page still to be built.
//
// The BAR carries four of those seven pages, two either side of the wordmark, and three
// of the four open a panel — About is the only plain link. How We Work is the fifth page the bar used to name: it is now a
// block inside the Ways to Work With Us panel, below a hairline, because the process is
// not a sibling of the four things a reader can buy — it is the answer to the question the
// four of them raise. See `howWeWorkAside` below and `NavPanelAside`.
//
// Nothing in any panel is invented: the capability titles and descriptors, the engagement
// tiers, the work titles and the five process step names are all re-used from the same
// content the pages themselves render, so the menu can never drift away from what it
// points at.

import { createCta } from "../../../domain/shared/value-objects/Cta";
import type { MegaMenuLink } from "../../../domain/navigation/entities/MegaMenuColumn";
import type {
  NavEntry,
  NavPanel,
  NavPanelAside,
  NavPanelColumn,
  NavPanelFeature,
} from "../../../domain/navigation/entities/NavPanel";
import { EMPTY_NAV_PANEL } from "../../../domain/navigation/entities/NavPanel";
import type { NavigationMenu } from "../../../domain/navigation/entities/NavigationMenu";
import { capabilities } from "./services.content";
import { processBlock } from "./marketing.content";
import { caseStudies } from "./portfolio.content";
import { waysToWorkPage } from "./ways-to-work.content";
import { slugifyTitle } from "./slugify";

function megaLink(label: string, href: string, description: string): MegaMenuLink {
  return { ...createCta(label, href), description };
}

/** Two capabilities per column, three columns — the six from §What We Do, in order. */
const CAPABILITIES_PER_COLUMN = 2;

const capabilityColumns: ReadonlyArray<NavPanelColumn> = Array.from(
  { length: Math.ceil(capabilities.length / CAPABILITIES_PER_COLUMN) },
  (_unused, columnIndex) => {
    const slice = capabilities.slice(
      columnIndex * CAPABILITIES_PER_COLUMN,
      columnIndex * CAPABILITIES_PER_COLUMN + CAPABILITIES_PER_COLUMN,
    );
    return {
      // The panel's columns are a layout split, not six named groups — the brief
      // defines no service taxonomy — so only the first column is titled.
      title: columnIndex === 0 ? "Creative Services" : "",
      items: slice.map((offering) =>
        megaLink(
          offering.title,
          `/creative-services#${slugifyTitle(offering.title)}`,
          offering.description,
        ),
      ),
    };
  },
);

const creativeServicesPanel: NavPanel = {
  columns: capabilityColumns,
  features: [],
  footerLink: createCta("View all services", "/creative-services"),
};

/**
 * The four engagements as cards rather than as a list of four two-word labels.
 *
 * It was a single narrow column, 22rem wide under its own trigger, holding four short
 * names — a card two thirds empty hanging under a menu bar that is otherwise held to the
 * container line. The engagements already have a picture and a one-line descriptor on
 * /ways-to-work-with-us, so showing those is not new content: the name, the descriptor and
 * the image are all read from `waysToWorkPage`, which reads them from the client's own
 * block. The menu cannot drift from the page it points at, which is the same rule the
 * capability columns follow.
 *
 * Each card links to its own tier on that page rather than to the top of it.
 */
const engagementFeatures: ReadonlyArray<NavPanelFeature> = [
  ...waysToWorkPage.tiers.map((tier) => ({
    ...createCta(tier.name, `/ways-to-work-with-us#${tier.slug.value}`),
    media: tier.media,
    description: tier.descriptor,
  })),
  {
    ...createCta(
      waysToWorkPage.custom.name,
      `/ways-to-work-with-us#${waysToWorkPage.custom.slug.value}`,
    ),
    media: waysToWorkPage.custom.media,
    description: waysToWorkPage.custom.descriptor,
  },
];

/**
 * HOW WE WORK, INSIDE THE WAYS TO WORK PANEL. It was a top-level bar item; the bar is
 * four pages now, and the process belongs under the engagements rather than beside them —
 * a reader choosing between Launch and Scale is already asking how the work happens.
 *
 * Not a bare link. The label names it, `processBlock.heading` says what the sequence is
 * for in the studio's own approved words, and the five step names are the sequence — the
 * same five the homepage section and the /how-we-work page render, read from the same
 * constant rather than retyped here.
 */
const howWeWorkAside: NavPanelAside = {
  label: "How We Work",
  summary: processBlock.heading,
  steps: processBlock.steps.map((step) => step.title),
  link: createCta("See the five steps", "/how-we-work"),
};

const waysToWorkPanel: NavPanel = {
  columns: [],
  features: engagementFeatures,
  footerLink: createCta("Compare every engagement", "/ways-to-work-with-us"),
  aside: howWeWorkAside,
};

/** Four covers is as many as fit one panel row without shrinking them to icons. */
const FEATURED_WORK_COUNT = 4;

const workFeatures: ReadonlyArray<NavPanelFeature> = caseStudies
  .slice(0, FEATURED_WORK_COUNT)
  .map((piece) => ({
    ...createCta(piece.title, `/selected-work#${piece.slug.value}`),
    media: piece.media,
    // The client's own one-line brief for the piece, the same line /selected-work prints
    // under it. Nothing here is written for the menu.
    description: piece.description,
  }));

const selectedWorkPanel: NavPanel = {
  columns: [],
  features: workFeatures,
  footerLink: createCta("Explore all work", "/selected-work"),
};

const entries: ReadonlyArray<NavEntry> = [
  // ORDER IS THE BAR'S LAYOUT. The first two sit left of the wordmark and the last two
  // right of it — see START_LINK_COUNT in Header.tsx. Split by width rather than by
  // meaning: "Ways to Work With Us" is the longest label on the site and "About" the
  // shortest, so pairing each with its opposite is what keeps the two tracks even.
  { link: createCta("Creative Services", "/creative-services"), panel: creativeServicesPanel },
  { link: createCta("Ways to Work With Us", "/ways-to-work-with-us"), panel: waysToWorkPanel },
  { link: createCta("Selected Work", "/selected-work"), panel: selectedWorkPanel },
  { link: createCta("About", "/about"), panel: EMPTY_NAV_PANEL },
];

export const navigationContent: NavigationMenu = {
  primaryLinks: entries,
  // NOT ON THE BAR ANY MORE. The desktop bar is five elements — four page names and the
  // wordmark — and a filled button in the right track was the thing that made the two
  // sides uneven. The call to action still belongs to the menu: the MOBILE DRAWER ends
  // with it, and the footer and every page's closing block carry /contact besides.
  primaryCta: createCta("Start a Conversation", "/contact"),
};
