import type { WaysToWorkPage } from "../../../domain/engagement/entities/WaysToWorkPage";
import type { EngagementRepository } from "../../../domain/engagement/repositories/EngagementRepository";
import { waysToWorkPage } from "../static/ways-to-work.content";

export class StaticEngagementRepository implements EngagementRepository {
  async getWaysToWorkPage(): Promise<WaysToWorkPage> {
    return waysToWorkPage;
  }
}
