import type { ServiceOffering } from "../../../domain/services/entities/ServiceOffering";
import type { ServiceCatalogRepository } from "../../../domain/services/repositories/ServiceCatalogRepository";
import { capabilities } from "../static/services.content";

export class StaticServiceCatalogRepository implements ServiceCatalogRepository {
  async getCapabilities(): Promise<ReadonlyArray<ServiceOffering>> {
    return capabilities;
  }
}
