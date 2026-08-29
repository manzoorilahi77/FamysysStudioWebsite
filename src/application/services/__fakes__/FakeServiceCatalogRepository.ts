import type { ServiceOffering } from "../../../domain/services/entities/ServiceOffering";
import type { ServiceCatalogRepository } from "../../../domain/services/repositories/ServiceCatalogRepository";

export class FakeServiceCatalogRepository implements ServiceCatalogRepository {
  calls = 0;
  error: Error | undefined;

  constructor(private readonly capabilities: ReadonlyArray<ServiceOffering>) {}

  async getCapabilities(): Promise<ReadonlyArray<ServiceOffering>> {
    this.calls += 1;
    if (this.error) {
      throw this.error;
    }
    return this.capabilities;
  }
}
