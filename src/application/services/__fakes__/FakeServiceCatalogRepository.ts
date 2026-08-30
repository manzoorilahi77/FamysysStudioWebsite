import type { CreativeServicesPage } from "../../../domain/services/entities/CreativeServicesPage";
import type { ServiceOffering } from "../../../domain/services/entities/ServiceOffering";
import type { ServiceCatalogRepository } from "../../../domain/services/repositories/ServiceCatalogRepository";

export class FakeServiceCatalogRepository implements ServiceCatalogRepository {
  calls = 0;
  pageCalls = 0;
  error: Error | undefined;

  constructor(
    private readonly capabilities: ReadonlyArray<ServiceOffering>,
    private readonly page?: CreativeServicesPage,
  ) {}

  async getCapabilities(): Promise<ReadonlyArray<ServiceOffering>> {
    this.calls += 1;
    if (this.error) {
      throw this.error;
    }
    return this.capabilities;
  }

  async getCreativeServicesPage(): Promise<CreativeServicesPage> {
    this.pageCalls += 1;
    if (this.error) {
      throw this.error;
    }
    if (!this.page) {
      // Failing loudly beats returning an empty page: a test that reaches this line asked
      // for a fixture it never supplied, and a blank stand-in would let it pass anyway.
      throw new Error("FakeServiceCatalogRepository was constructed without a page fixture.");
    }
    return this.page;
  }
}
