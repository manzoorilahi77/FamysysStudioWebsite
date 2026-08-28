import type { NavigationMenu } from "../../../domain/navigation/entities/NavigationMenu";
import type { NavigationRepository } from "../../../domain/navigation/repositories/NavigationRepository";

export class FakeNavigationRepository implements NavigationRepository {
  calls = 0;
  error: Error | undefined;

  constructor(private readonly menu: NavigationMenu) {}

  async getPrimaryMenu(): Promise<NavigationMenu> {
    this.calls += 1;
    if (this.error) {
      throw this.error;
    }
    return this.menu;
  }
}
