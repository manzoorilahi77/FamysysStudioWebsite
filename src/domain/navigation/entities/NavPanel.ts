import type { MediaRef } from "../../shared/value-objects/MediaRef";
import type { MegaMenuLink } from "./MegaMenuColumn";
import type { NavItem } from "./NavItem";

/** A column of titled links inside a navigation panel. */
export interface NavPanelColumn {
  readonly title: string;
  readonly items: ReadonlyArray<MegaMenuLink>;
}

/** A thumbnail entry — used by the Selected Work panel, which shows work, not link text. */
export interface NavPanelFeature extends NavItem {
  readonly media: MediaRef;
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
