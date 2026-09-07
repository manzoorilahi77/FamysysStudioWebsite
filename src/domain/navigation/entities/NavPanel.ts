import type { MediaRef } from "../../shared/value-objects/MediaRef";
import type { MegaMenuLink } from "./MegaMenuColumn";
import type { NavItem } from "./NavItem";

/** A column of titled links inside a navigation panel. */
export interface NavPanelColumn {
  readonly title: string;
  readonly items: ReadonlyArray<MegaMenuLink>;
}

/**
 * A card entry: a picture, the thing's name, and one line saying what it is. Used by the
 * two panels that show things rather than link text — Selected Work's pieces and Ways to
 * Work With Us's engagements.
 *
 * `description` is required rather than optional. A row of four pictures with four names
 * under them is a shelf; the line underneath is what makes each one legible before it is
 * clicked, and every source these are built from already has one, so there is nothing to
 * invent and no reason to let a card ship without it.
 */
export interface NavPanelFeature extends NavItem {
  readonly media: MediaRef;
  readonly description: string;
}

/**
 * A block that hangs under a panel's own content, below a hairline: a short label, a
 * one-line summary, the sequence it names, and a link through to the page that holds it.
 *
 * There is one. How We Work stopped being a top-level bar item — the bar is five elements
 * now, two pages either side of the wordmark, and the process is not a sibling of the four
 * things a reader can buy — so it moved into the Ways to Work With Us panel, where the
 * question it answers is already being asked. A bare link there would have read as a
 * leftover; the label, the summary and the five step names are what make it a part of the
 * panel rather than a footnote to it.
 *
 * Nothing here is written for the menu: the summary and the step names are read from
 * `processBlock`, which is what the homepage section and the /how-we-work hero render.
 */
export interface NavPanelAside {
  readonly label: string;
  readonly summary: string;
  readonly steps: ReadonlyArray<string>;
  readonly link: NavItem;
}

/**
 * The panel that hangs off a navigation item. Three of the four primary items carry
 * one; About is the only plain link.
 *
 * Columns and features are always present and simply empty where a panel does not use
 * them, rather than the panel being a discriminated union. A union would force the
 * presentation mapper in `viewModels.ts` to branch on its tag, and that file is
 * deliberately kept free of branching. An item with no panel has both arrays empty,
 * which is also how the header decides whether to render a trigger at all.
 */
export interface NavPanel {
  readonly columns: ReadonlyArray<NavPanelColumn>;
  readonly features: ReadonlyArray<NavPanelFeature>;
  readonly footerLink?: NavItem;
  readonly aside?: NavPanelAside;
}

export interface NavEntry {
  readonly link: NavItem;
  readonly panel: NavPanel;
}

export const EMPTY_NAV_PANEL: NavPanel = { columns: [], features: [] };
