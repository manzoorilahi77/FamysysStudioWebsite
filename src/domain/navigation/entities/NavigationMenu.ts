import type { NavEntry } from "./NavPanel";
import type { NavItem } from "./NavItem";

export interface NavigationMenu {
  readonly primaryLinks: ReadonlyArray<NavEntry>;
  readonly signIn: NavItem;
  readonly primaryCta: NavItem;
}
