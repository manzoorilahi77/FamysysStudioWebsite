import type { ServiceOffering } from "../entities/ServiceOffering";

export interface ServiceCatalogRepository {
  getCapabilities(): Promise<ReadonlyArray<ServiceOffering>>;
}
