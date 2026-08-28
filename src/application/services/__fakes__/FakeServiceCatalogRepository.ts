import type { ServiceCategory } from "../../../domain/services/entities/ServiceCategory";
import type { ServiceCatalogRepository } from "../../../domain/services/repositories/ServiceCatalogRepository";

export class FakeServiceCatalogRepository implements ServiceCatalogRepository {
  calls = 0;
  error: Error | undefined;

  constructor(private readonly categories: ReadonlyArray<ServiceCategory>) {}

  async getCategories(): Promise<ReadonlyArray<ServiceCategory>> {
    this.calls += 1;
    if (this.error) {
      throw this.error;
    }
    return this.categories;
  }
}
