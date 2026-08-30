import type { CreativeServicesPage } from "../../../domain/services/entities/CreativeServicesPage";
import type { ServiceOffering } from "../../../domain/services/entities/ServiceOffering";
import type { ServiceCatalogRepository } from "../../../domain/services/repositories/ServiceCatalogRepository";
import { creativeServicesPage } from "../static/creative-services.content";
import { capabilities } from "../static/services.content";

export class StaticServiceCatalogRepository implements ServiceCatalogRepository {
  async getCapabilities(): Promise<ReadonlyArray<ServiceOffering>> {
    return capabilities;
  }

  async getCreativeServicesPage(): Promise<CreativeServicesPage> {
    return creativeServicesPage;
  }
}
