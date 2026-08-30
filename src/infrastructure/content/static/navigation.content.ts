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
import { waysToWorkBlock } from "./marketing.content";
import { caseStudies } from "./portfolio.content";

function megaLink(label: string, href: string, description: string): MegaMenuLink {
  return { ...createCta(label, href), description };
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
          `/creative-services#${slugify(offering.title)}`,
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

const waysToWorkPanel: NavPanel = {
  columns: [
    {
      title: "Ways to work with us",
      items: [
        ...waysToWorkBlock.tiers.map((tier) =>
          megaLink(tier.name, "/ways-to-work-with-us", tier.descriptor),
        ),
        megaLink(
          waysToWorkBlock.custom.name,
          "/ways-to-work-with-us",
          waysToWorkBlock.custom.descriptor,
        ),
      ],
    },
  ],
  features: [],
  footerLink: createCta("Compare every engagement", "/ways-to-work-with-us"),
};

/** Four covers is as many as fit one panel row without shrinking them to icons. */
const FEATURED_WORK_COUNT = 4;

const workFeatures: ReadonlyArray<NavPanelFeature> = caseStudies
  .slice(0, FEATURED_WORK_COUNT)
  .map((piece) => ({
    ...createCta(piece.title, `/selected-work#${piece.slug.value}`),
    media: piece.media,
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
