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
 * The panel that hangs off a navigation item. Three of the five primary items carry
 * one; the rest are plain links.
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
}

export interface NavEntry {
  readonly link: NavItem;
  readonly panel: NavPanel;
}

export const EMPTY_NAV_PANEL: NavPanel = { columns: [], features: [] };
