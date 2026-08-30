import type { CreativeServicesPage } from "../entities/CreativeServicesPage";
import type { ServiceOffering } from "../entities/ServiceOffering";

export interface ServiceCatalogRepository {
  getCapabilities(): Promise<ReadonlyArray<ServiceOffering>>;
  getCreativeServicesPage(): Promise<CreativeServicesPage>;
}
