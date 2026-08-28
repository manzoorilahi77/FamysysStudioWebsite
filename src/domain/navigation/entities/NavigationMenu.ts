import type { MegaMenuColumn } from "./MegaMenuColumn";
import type { NavItem } from "./NavItem";

export interface NavigationMenu {
  readonly primaryLinks: ReadonlyArray<NavItem>;
  readonly megaMenu: ReadonlyArray<MegaMenuColumn>;
  readonly signIn: NavItem;
  readonly primaryCta: NavItem;
}
