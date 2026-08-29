import { describe, expect, it } from "vitest";
import type { ServiceOffering } from "../../domain/services/entities/ServiceOffering";
import { FakeServiceCatalogRepository } from "./__fakes__/FakeServiceCatalogRepository";
import { GetServiceCatalog } from "./GetServiceCatalog";

function fixtureCapabilities(): ReadonlyArray<ServiceOffering> {
  return [
    {
      title: "Creative Design",
      description: "Social creatives, marketing collateral, presentations, brochures, banners and digital assets.",
    },
  ];
}

describe("GetServiceCatalog", () => {
  it("returns the capabilities from the repository", async () => {
    const capabilities = fixtureCapabilities();
    const repository = new FakeServiceCatalogRepository(capabilities);
    const useCase = new GetServiceCatalog(repository);

    const result = await useCase.execute();

    expect(result).toBe(capabilities);
    expect(repository.calls).toBe(1);
  });

  it("propagates a repository failure", async () => {
    const repository = new FakeServiceCatalogRepository(fixtureCapabilities());
    repository.error = new Error("catalog unavailable");
    const useCase = new GetServiceCatalog(repository);

    await expect(useCase.execute()).rejects.toThrow("catalog unavailable");
  });
});
