import { describe, expect, it } from "vitest";
import { waysToWorkPage } from "../../infrastructure/content/static/ways-to-work.content";
import { FakeEngagementRepository } from "./__fakes__/FakeEngagementRepository";
import { GetWaysToWorkPage } from "./GetWaysToWorkPage";

describe("GetWaysToWorkPage", () => {
  it("returns the page from the repository", async () => {
    const repository = new FakeEngagementRepository(waysToWorkPage);
    const useCase = new GetWaysToWorkPage(repository);

    const result = await useCase.execute();

    expect(result).toBe(waysToWorkPage);
    expect(repository.pageCalls).toBe(1);
  });

  it("propagates a repository failure", async () => {
    const repository = new FakeEngagementRepository(waysToWorkPage);
    repository.error = new Error("ways to work page unavailable");
    const useCase = new GetWaysToWorkPage(repository);

    await expect(useCase.execute()).rejects.toThrow("ways to work page unavailable");
  });
});
