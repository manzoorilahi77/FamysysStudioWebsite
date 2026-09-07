import { describe, expect, it } from "vitest";
import { createCta } from "../../domain/shared/value-objects/Cta";
import { EMPTY_NAV_PANEL } from "../../domain/navigation/entities/NavPanel";
import type { NavigationMenu } from "../../domain/navigation/entities/NavigationMenu";
import { FakeNavigationRepository } from "./__fakes__/FakeNavigationRepository";
import { GetPrimaryNavigation } from "./GetPrimaryNavigation";

function fixtureMenu(): NavigationMenu {
  return {
    primaryLinks: [{ link: createCta("Services", "/services"), panel: EMPTY_NAV_PANEL }],
    primaryCta: createCta("Book a call", "/contact"),
  };
}

describe("GetPrimaryNavigation", () => {
  it("returns the menu from the repository", async () => {
    const menu = fixtureMenu();
    const repository = new FakeNavigationRepository(menu);
    const useCase = new GetPrimaryNavigation(repository);

    const result = await useCase.execute();

    expect(result).toBe(menu);
    expect(repository.calls).toBe(1);
  });

  it("propagates a repository failure", async () => {
    const repository = new FakeNavigationRepository(fixtureMenu());
    repository.error = new Error("network down");
    const useCase = new GetPrimaryNavigation(repository);

    await expect(useCase.execute()).rejects.toThrow("network down");
  });
});
