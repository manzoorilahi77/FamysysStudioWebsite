import type { ServiceCategory } from "../../domain/services/entities/ServiceCategory";
import type { ServiceCatalogRepository } from "../../domain/services/repositories/ServiceCatalogRepository";

export class GetServiceCatalog {
  constructor(private readonly repository: ServiceCatalogRepository) {}

  async execute(): Promise<ReadonlyArray<ServiceCategory>> {
    return this.repository.getCategories();
  }
}
