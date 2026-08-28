import { describe, expect, it } from "vitest";
import type { ServiceCategory } from "../../domain/services/entities/ServiceCategory";
import { FakeServiceCatalogRepository } from "./__fakes__/FakeServiceCatalogRepository";
import { GetServiceCatalog } from "./GetServiceCatalog";

function fixtureCategories(): ReadonlyArray<ServiceCategory> {
  return [
    {
      title: "Video production",
      offerings: [{ title: "Brand films", description: "Long-form brand storytelling." }],
    },
  ];
}

describe("GetServiceCatalog", () => {
  it("returns the categories from the repository", async () => {
    const categories = fixtureCategories();
    const repository = new FakeServiceCatalogRepository(categories);
    const useCase = new GetServiceCatalog(repository);

    const result = await useCase.execute();

    expect(result).toBe(categories);
    expect(repository.calls).toBe(1);
  });

  it("propagates a repository failure", async () => {
    const repository = new FakeServiceCatalogRepository(fixtureCategories());
    repository.error = new Error("catalog unavailable");
    const useCase = new GetServiceCatalog(repository);

    await expect(useCase.execute()).rejects.toThrow("catalog unavailable");
  });
});
