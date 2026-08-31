import { describe, expect, it } from "vitest";
import { howWeWorkPage } from "../../infrastructure/content/static/how-we-work.content";
import { FakeProcessRepository } from "./__fakes__/FakeProcessRepository";
import { GetHowWeWorkPage } from "./GetHowWeWorkPage";

describe("GetHowWeWorkPage", () => {
  it("returns the page from the repository", async () => {
    const repository = new FakeProcessRepository(howWeWorkPage);
    const useCase = new GetHowWeWorkPage(repository);

    const result = await useCase.execute();

    expect(result).toBe(howWeWorkPage);
    expect(repository.pageCalls).toBe(1);
  });

  it("propagates a repository failure", async () => {
    const repository = new FakeProcessRepository(howWeWorkPage);
    repository.error = new Error("how we work page unavailable");
    const useCase = new GetHowWeWorkPage(repository);

    await expect(useCase.execute()).rejects.toThrow("how we work page unavailable");
  });
});
