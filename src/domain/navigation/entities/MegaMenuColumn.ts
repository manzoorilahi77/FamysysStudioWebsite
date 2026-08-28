import type { NavItem } from "./NavItem";

export interface MegaMenuLink extends NavItem {
  readonly description: string;
}

export interface MegaMenuColumn {
  readonly title: string;
  readonly items: ReadonlyArray<MegaMenuLink>;
}
