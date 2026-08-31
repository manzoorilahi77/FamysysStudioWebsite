import { describe, expect, it } from "vitest";
import { aboutPage } from "../../infrastructure/content/static/about.content";
import { FakeAboutRepository } from "./__fakes__/FakeAboutRepository";
import { GetAboutPage } from "./GetAboutPage";

describe("GetAboutPage", () => {
  it("returns the page from the repository", async () => {
    const repository = new FakeAboutRepository(aboutPage);
    const useCase = new GetAboutPage(repository);

    const result = await useCase.execute();

    expect(result).toBe(aboutPage);
    expect(repository.pageCalls).toBe(1);
  });

  it("propagates a repository failure", async () => {
    const repository = new FakeAboutRepository(aboutPage);
    repository.error = new Error("about page unavailable");
    const useCase = new GetAboutPage(repository);

    await expect(useCase.execute()).rejects.toThrow("about page unavailable");
  });
});
