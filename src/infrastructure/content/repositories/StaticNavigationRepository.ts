import type { NavigationMenu } from "../../../domain/navigation/entities/NavigationMenu";
import type { NavigationRepository } from "../../../domain/navigation/repositories/NavigationRepository";
import { navigationContent } from "../static/navigation.content";

export class StaticNavigationRepository implements NavigationRepository {
  async getPrimaryMenu(): Promise<NavigationMenu> {
    return navigationContent;
  }
}
