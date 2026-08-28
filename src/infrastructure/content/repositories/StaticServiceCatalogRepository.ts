import type { ServiceCategory } from "../../../domain/services/entities/ServiceCategory";
import type { ServiceCatalogRepository } from "../../../domain/services/repositories/ServiceCatalogRepository";
import { serviceCategories } from "../static/services.content";

export class StaticServiceCatalogRepository implements ServiceCatalogRepository {
  async getCategories(): Promise<ReadonlyArray<ServiceCategory>> {
    return serviceCategories;
  }
}
