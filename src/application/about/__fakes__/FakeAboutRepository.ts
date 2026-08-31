import type { AboutPage } from "../../../domain/about/entities/AboutPage";
import type { AboutRepository } from "../../../domain/about/repositories/AboutRepository";

export class FakeAboutRepository implements AboutRepository {
  pageCalls = 0;
  error: Error | undefined;

  constructor(private readonly page: AboutPage) {}

  async getAboutPage(): Promise<AboutPage> {
    this.pageCalls += 1;
    if (this.error) {
      throw this.error;
    }
    return this.page;
  }
}
