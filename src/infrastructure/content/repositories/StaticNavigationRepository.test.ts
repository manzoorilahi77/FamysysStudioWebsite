import { describe, expect, it } from "vitest";
import { StaticNavigationRepository } from "./StaticNavigationRepository";

describe("StaticNavigationRepository", () => {
  it("returns a correctly-shaped NavigationMenu", async () => {
    const repository = new StaticNavigationRepository();

    const menu = await repository.getPrimaryMenu();

    expect(menu.primaryLinks).toHaveLength(5);
    expect(menu.primaryCta.label.toString()).toBe("Start a Conversation");
  });

  it("links every page of the real 7-page site", async () => {
    const repository = new StaticNavigationRepository();

    const menu = await repository.getPrimaryMenu();
    const allHrefs = new Set([
      ...menu.primaryLinks.map((link) => link.href.value),
      ...menu.megaMenu.flatMap((column) => column.items.map((item) => item.href.value)),
      menu.signIn.href.value,
      menu.primaryCta.href.value,
    ]);

    // The homepage is the only page that exists yet — these routes are
    // deliberate forward links to pages still to be built.
    for (const route of [
      "/creative-services",
      "/how-we-work",
      "/ways-to-work-with-us",
      "/selected-work",
      "/about",
      "/contact",
    ]) {
      expect(allHrefs).toContain(route);
    }
  });

  it("surfaces all 6 capabilities across the mega menu", async () => {
    const repository = new StaticNavigationRepository();

    const menu = await repository.getPrimaryMenu();
    const allLabels = menu.megaMenu.flatMap((column) => column.items.map((item) => item.label.value));

    for (const capability of [
      "Creative Design",
      "Video Production & Editing",
      "AI Video & Virtual Presenters",
      "Explainer & Training Videos",
      "Motion Graphics & Advanced Creative",
      "Product & Brand Visuals",
    ]) {
      expect(allLabels).toContain(capability);
    }
  });

  it("gives every mega menu item a non-empty description", async () => {
    const repository = new StaticNavigationRepository();

    const menu = await repository.getPrimaryMenu();
    const allItems = menu.megaMenu.flatMap((column) => column.items);

    expect(allItems.every((item) => item.description.trim().length > 0)).toBe(true);
  });
});
