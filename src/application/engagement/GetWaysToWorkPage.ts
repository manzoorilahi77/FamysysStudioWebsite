import type { WaysToWorkPage } from "../../domain/engagement/entities/WaysToWorkPage";
import type { EngagementRepository } from "../../domain/engagement/repositories/EngagementRepository";

export class GetWaysToWorkPage {
  constructor(private readonly repository: EngagementRepository) {}

  async execute(): Promise<WaysToWorkPage> {
    return this.repository.getWaysToWorkPage();
  }
}
