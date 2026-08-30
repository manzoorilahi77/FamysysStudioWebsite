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
      ...menu.primaryLinks.map((entry) => entry.link.href.value),
      ...menu.primaryLinks.flatMap((entry) =>
        entry.panel.columns.flatMap((column) => column.items.map((item) => item.href.value)),
      ),
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

  it("gives exactly three items a panel, and leaves the rest plain links", async () => {
    const repository = new StaticNavigationRepository();

    const menu = await repository.getPrimaryMenu();
    const withPanels = menu.primaryLinks.filter(
      (entry) => entry.panel.columns.length > 0 || entry.panel.features.length > 0,
    );

    expect(withPanels.map((entry) => entry.link.label.value)).toEqual([
      "Creative Services",
      "Ways to Work With Us",
      "Selected Work",
    ]);
  });

  it("surfaces all 6 capabilities in the Creative Services panel", async () => {
    const repository = new StaticNavigationRepository();

    const menu = await repository.getPrimaryMenu();
    const services = menu.primaryLinks.find(
      (entry) => entry.link.label.value === "Creative Services",
    );
    const labels = (services?.panel.columns ?? []).flatMap((column) =>
      column.items.map((item) => item.label.value),
    );

    for (const capability of [
      "Creative Design",
      "Video Production & Editing",
      "AI Video & Virtual Presenters",
      "Explainer & Training Videos",
      "Motion Graphics & Advanced Creative",
      "Product & Brand Visuals",
    ]) {
      expect(labels).toContain(capability);
    }
  });

  it("lists every engagement tier, including the custom partnership", async () => {
    const repository = new StaticNavigationRepository();

    const menu = await repository.getPrimaryMenu();
    const ways = menu.primaryLinks.find(
      (entry) => entry.link.label.value === "Ways to Work With Us",
    );
    const labels = (ways?.panel.columns ?? []).flatMap((column) =>
      column.items.map((item) => item.label.value),
    );

    expect(labels).toEqual(["Launch", "Grow", "Scale", "Custom Creative Partnership"]);
  });

  it("shows work covers, not link text, in the Selected Work panel", async () => {
    const repository = new StaticNavigationRepository();

    const menu = await repository.getPrimaryMenu();
    const work = menu.primaryLinks.find((entry) => entry.link.label.value === "Selected Work");

    expect(work?.panel.columns).toHaveLength(0);
    expect(work?.panel.features).toHaveLength(4);
    expect(work?.panel.features.every((feature) => feature.media.src.value.length > 0)).toBe(true);
  });

  it("gives every panel a footer link and every link item a description", async () => {
    const repository = new StaticNavigationRepository();

    const menu = await repository.getPrimaryMenu();
    const panels = menu.primaryLinks
      .map((entry) => entry.panel)
      .filter((panel) => panel.columns.length > 0 || panel.features.length > 0);
    const items = panels.flatMap((panel) => panel.columns.flatMap((column) => column.items));

    expect(panels.every((panel) => panel.footerLink !== undefined)).toBe(true);
    expect(items.every((item) => item.description.trim().length > 0)).toBe(true);
  });
});
