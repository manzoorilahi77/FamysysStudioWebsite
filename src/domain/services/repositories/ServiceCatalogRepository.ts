import type { ServiceCategory } from "../entities/ServiceCategory";

export interface ServiceCatalogRepository {
  getCategories(): Promise<ReadonlyArray<ServiceCategory>>;
}
