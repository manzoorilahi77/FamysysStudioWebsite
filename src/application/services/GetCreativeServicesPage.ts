import type { CreativeServicesPage } from "../../domain/services/entities/CreativeServicesPage";
import type { ServiceCatalogRepository } from "../../domain/services/repositories/ServiceCatalogRepository";

export class GetCreativeServicesPage {
  constructor(private readonly repository: ServiceCatalogRepository) {}

  async execute(): Promise<CreativeServicesPage> {
    return this.repository.getCreativeServicesPage();
  }
}
