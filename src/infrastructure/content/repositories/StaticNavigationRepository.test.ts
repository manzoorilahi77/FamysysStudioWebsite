import { describe, expect, it } from "vitest";
import { processBlock } from "../static/marketing.content";
import { StaticNavigationRepository } from "./StaticNavigationRepository";

describe("StaticNavigationRepository", () => {
  it("returns a correctly-shaped NavigationMenu", async () => {
    const repository = new StaticNavigationRepository();

    const menu = await repository.getPrimaryMenu();

    // FOUR, not five. The bar is five ELEMENTS — two pages, the wordmark, two pages —
    // and How We Work moved into the Ways to Work With Us panel as an aside. The call to
    // action is still on the menu; it is the mobile drawer that renders it now, not the
    // bar.
    expect(menu.primaryLinks).toHaveLength(4);
    expect(menu.primaryCta.label.toString()).toBe("Contact");
  });

  it("links every page of the real 7-page site", async () => {
    const repository = new StaticNavigationRepository();

    const menu = await repository.getPrimaryMenu();
    const allHrefs = new Set([
      ...menu.primaryLinks.map((entry) => entry.link.href.value),
      ...menu.primaryLinks.flatMap((entry) =>
        entry.panel.columns.flatMap((column) => column.items.map((item) => item.href.value)),
      ),
      // /how-we-work is reached through the Ways to Work With Us panel's aside now, and
      // this is the assertion that would have caught it going missing: the seven-page site
      // still has to be reachable from the menu, whatever shape the bar is in.
      ...menu.primaryLinks.flatMap((entry) =>
        entry.panel.aside ? [entry.panel.aside.link.href.value] : [],
      ),
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

  it("gives three of the four items a panel, and leaves About a plain link", async () => {
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
    expect(menu.primaryLinks.map((entry) => entry.link.label.value)).toEqual([
      "Creative Services",
      "Ways to Work With Us",
      "Selected Work",
      "About",
    ]);
  });

  // How We Work was a top-level bar item and is now a block inside the Ways to Work With
  // Us panel. It has to be a BLOCK and not a bare link — a page demoted to one line of
  // link text at the bottom of someone else's menu is a page on its way to being
  // forgotten — so this asserts the label, the summary and the five step names are all
  // there, and that the five are the studio's own five rather than five written for the
  // menu.
  it("carries How We Work as an aside on the Ways to Work With Us panel", async () => {
    const repository = new StaticNavigationRepository();

    const menu = await repository.getPrimaryMenu();
    const asides = menu.primaryLinks.filter((entry) => entry.panel.aside !== undefined);
    const aside = asides[0]?.panel.aside;

    expect(asides.map((entry) => entry.link.label.value)).toEqual(["Ways to Work With Us"]);
    expect(aside?.label).toBe("How We Work");
    expect(aside?.link.href.value).toBe("/how-we-work");
    expect(aside?.summary).toBe(processBlock.heading);
    expect(aside?.steps).toEqual(["Understand", "Create", "Produce", "Refine", "Deliver"]);
    expect(aside?.steps).toEqual(processBlock.steps.map((step) => step.title));
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
    // Cards now, not a column of link text: the four engagements each carry the picture
    // and the one-line descriptor /ways-to-work-with-us already gives them, and each links
    // to its own tier on that page rather than to the top of it.
    const labels = (ways?.panel.features ?? []).map((feature) => feature.label.value);

    expect(ways?.panel.columns).toHaveLength(0);
    expect(labels).toEqual(["Launch", "Grow", "Scale", "Custom Creative Partnership"]);
    expect(ways?.panel.features.every((feature) => feature.media.src.value.length > 0)).toBe(true);
    expect(
      ways?.panel.features.every((feature) =>
        feature.href.value.startsWith("/ways-to-work-with-us#"),
      ),
    ).toBe(true);
  });

  it("shows work covers, not link text, in the Selected Work panel", async () => {
    const repository = new StaticNavigationRepository();

    const menu = await repository.getPrimaryMenu();
    const work = menu.primaryLinks.find((entry) => entry.link.label.value === "Selected Work");

    expect(work?.panel.columns).toHaveLength(0);
    expect(work?.panel.features).toHaveLength(4);
    expect(work?.panel.features.every((feature) => feature.media.src.value.length > 0)).toBe(true);
  });

  it("gives every panel a footer link, and every row and card a description", async () => {
    const repository = new StaticNavigationRepository();

    const menu = await repository.getPrimaryMenu();
    const panels = menu.primaryLinks
      .map((entry) => entry.panel)
      .filter((panel) => panel.columns.length > 0 || panel.features.length > 0);
    const items = panels.flatMap((panel) => panel.columns.flatMap((column) => column.items));
    // Cards carry a description too, and it is required rather than optional: four
    // pictures with four names under them is a shelf, and the line underneath is what
    // makes each one legible before it is clicked.
    const cards = panels.flatMap((panel) => panel.features);

    expect(panels.every((panel) => panel.footerLink !== undefined)).toBe(true);
    expect(items.every((item) => item.description.trim().length > 0)).toBe(true);
    expect(cards.every((card) => card.description.trim().length > 0)).toBe(true);
  });
});
