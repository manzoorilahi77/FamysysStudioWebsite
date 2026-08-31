import type { WaysToWorkPage } from "../../../domain/engagement/entities/WaysToWorkPage";
import type { EngagementRepository } from "../../../domain/engagement/repositories/EngagementRepository";

export class FakeEngagementRepository implements EngagementRepository {
  pageCalls = 0;
  error: Error | undefined;

  constructor(private readonly page: WaysToWorkPage) {}

  async getWaysToWorkPage(): Promise<WaysToWorkPage> {
    this.pageCalls += 1;
    if (this.error) {
      throw this.error;
    }
    return this.page;
  }
}
