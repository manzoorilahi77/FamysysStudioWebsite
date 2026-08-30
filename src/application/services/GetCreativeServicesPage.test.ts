import { describe, expect, it } from "vitest";
import { creativeServicesPage } from "../../infrastructure/content/static/creative-services.content";
import { FakeServiceCatalogRepository } from "./__fakes__/FakeServiceCatalogRepository";
import { GetCreativeServicesPage } from "./GetCreativeServicesPage";

describe("GetCreativeServicesPage", () => {
  it("returns the page from the repository", async () => {
    const repository = new FakeServiceCatalogRepository([], creativeServicesPage);
    const useCase = new GetCreativeServicesPage(repository);

    const result = await useCase.execute();

    expect(result).toBe(creativeServicesPage);
    expect(repository.pageCalls).toBe(1);
  });

  it("propagates a repository failure", async () => {
    const repository = new FakeServiceCatalogRepository([], creativeServicesPage);
    repository.error = new Error("services page unavailable");
    const useCase = new GetCreativeServicesPage(repository);

    await expect(useCase.execute()).rejects.toThrow("services page unavailable");
  });
});
