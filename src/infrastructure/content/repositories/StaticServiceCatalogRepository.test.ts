import { describe, expect, it } from "vitest";
import { StaticServiceCatalogRepository } from "./StaticServiceCatalogRepository";

describe("StaticServiceCatalogRepository", () => {
  it("returns the 6 capabilities from the brief, in order", async () => {
    const repository = new StaticServiceCatalogRepository();

    const capabilities = await repository.getCapabilities();

    expect(capabilities.map((capability) => capability.title)).toEqual([
      "Creative Design",
      "Video Production & Editing",
      "AI Video & Virtual Presenters",
      "Explainer & Training Videos",
      "Motion Graphics & Advanced Creative",
      "Product & Brand Visuals",
    ]);
  });

  it("gives every capability a non-empty description", async () => {
    const repository = new StaticServiceCatalogRepository();

    const capabilities = await repository.getCapabilities();

    expect(capabilities.every((capability) => capability.description.trim().length > 0)).toBe(true);
  });
});
