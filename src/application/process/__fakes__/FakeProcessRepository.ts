import type { HowWeWorkPage } from "../../../domain/process/entities/HowWeWorkPage";
import type { ProcessRepository } from "../../../domain/process/repositories/ProcessRepository";

export class FakeProcessRepository implements ProcessRepository {
  pageCalls = 0;
  error: Error | undefined;

  constructor(private readonly page: HowWeWorkPage) {}

  async getHowWeWorkPage(): Promise<HowWeWorkPage> {
    this.pageCalls += 1;
    if (this.error) {
      throw this.error;
    }
    return this.page;
  }
}
