import type { NavigationMenu } from "../../domain/navigation/entities/NavigationMenu";
import type { NavigationRepository } from "../../domain/navigation/repositories/NavigationRepository";

export class GetPrimaryNavigation {
  constructor(private readonly repository: NavigationRepository) {}

  async execute(): Promise<NavigationMenu> {
    return this.repository.getPrimaryMenu();
  }
}
