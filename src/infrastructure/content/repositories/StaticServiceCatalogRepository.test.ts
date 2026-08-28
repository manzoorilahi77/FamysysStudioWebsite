import { describe, expect, it } from "vitest";
import { StaticServiceCatalogRepository } from "./StaticServiceCatalogRepository";

describe("StaticServiceCatalogRepository", () => {
  it("has 4 categories totalling 20 service offerings", async () => {
    const repository = new StaticServiceCatalogRepository();

    const categories = await repository.getCategories();
    const totalOfferings = categories.reduce((sum, category) => sum + category.offerings.length, 0);

    expect(categories).toHaveLength(4);
    expect(totalOfferings).toBe(20);
  });

  it("gives every offering a non-empty description", async () => {
    const repository = new StaticServiceCatalogRepository();

    const categories = await repository.getCategories();
    const allOfferings = categories.flatMap((category) => category.offerings);

    expect(allOfferings.every((offering) => offering.description.trim().length > 0)).toBe(true);
  });
});
