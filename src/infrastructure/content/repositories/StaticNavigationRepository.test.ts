import { describe, expect, it } from "vitest";
import { StaticNavigationRepository } from "./StaticNavigationRepository";

describe("StaticNavigationRepository", () => {
  it("returns a correctly-shaped NavigationMenu", async () => {
    const repository = new StaticNavigationRepository();

    const menu = await repository.getPrimaryMenu();

    expect(menu.primaryLinks).toHaveLength(5);
    expect(menu.signIn.label.toString()).toBe("Sign in");
    expect(menu.primaryCta.label.toString()).toBe("Book a call");
  });

  it("has 4 mega menu columns totalling 20 offerings", async () => {
    const repository = new StaticNavigationRepository();

    const menu = await repository.getPrimaryMenu();
    const totalItems = menu.megaMenu.reduce((sum, column) => sum + column.items.length, 0);

    expect(menu.megaMenu).toHaveLength(4);
    expect(totalItems).toBe(20);
  });

  it("gives every mega menu item a non-empty description", async () => {
    const repository = new StaticNavigationRepository();

    const menu = await repository.getPrimaryMenu();
    const allItems = menu.megaMenu.flatMap((column) => column.items);

    expect(allItems.every((item) => item.description.trim().length > 0)).toBe(true);
  });
});
