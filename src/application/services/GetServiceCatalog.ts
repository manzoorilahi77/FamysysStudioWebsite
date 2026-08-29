import type { ServiceOffering } from "../../domain/services/entities/ServiceOffering";
import type { ServiceCatalogRepository } from "../../domain/services/repositories/ServiceCatalogRepository";

export class GetServiceCatalog {
  constructor(private readonly repository: ServiceCatalogRepository) {}

  async execute(): Promise<ReadonlyArray<ServiceOffering>> {
    return this.repository.getCapabilities();
  }
}
