import type { NavigationMenu } from "../entities/NavigationMenu";

export interface NavigationRepository {
  getPrimaryMenu(): Promise<NavigationMenu>;
}
