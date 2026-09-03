// The real 7-page site from the V1 Homepage Content Brief: Home, Creative
// Services, How We Work, Ways to Work With Us, Selected Work, About Famysys
// Studio, Contact. Only the homepage exists so far — every route below is a
// deliberate forward link to a page still to be built.
//
// Three of the five primary items open a panel. Nothing in them is invented: the
// capability titles and descriptors, the engagement tiers and the work titles are all
// re-used from the same content the page itself renders, so the menu can never drift
// away from the sections it points at.

import { createCta } from "../../../domain/shared/value-objects/Cta";
import type { MegaMenuLink } from "../../../domain/navigation/entities/MegaMenuColumn";
import type {
  NavEntry,
  NavPanel,
  NavPanelColumn,
  NavPanelFeature,
} from "../../../domain/navigation/entities/NavPanel";
import { EMPTY_NAV_PANEL } from "../../../domain/navigation/entities/NavPanel";
import type { NavigationMenu } from "../../../domain/navigation/entities/NavigationMenu";
import { capabilities } from "./services.content";
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

const waysToWorkPanel: NavPanel = {
  columns: [],
  features: engagementFeatures,
  footerLink: createCta("Compare every engagement", "/ways-to-work-with-us"),
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
  { link: createCta("Creative Services", "/creative-services"), panel: creativeServicesPanel },
  { link: createCta("How We Work", "/how-we-work"), panel: EMPTY_NAV_PANEL },
  { link: createCta("Ways to Work With Us", "/ways-to-work-with-us"), panel: waysToWorkPanel },
  { link: createCta("Selected Work", "/selected-work"), panel: selectedWorkPanel },
  { link: createCta("About", "/about"), panel: EMPTY_NAV_PANEL },
];

export const navigationContent: NavigationMenu = {
  primaryLinks: entries,
  signIn: createCta("Contact", "/contact"),
  primaryCta: createCta("Start a Conversation", "/contact"),
};
