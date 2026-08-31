import { describe, expect, it } from "vitest";
import { caseStudies } from "../../infrastructure/content/static/portfolio.content";
import { selectedWorkPage } from "../../infrastructure/content/static/selected-work.content";
import { FakePortfolioRepository } from "./__fakes__/FakePortfolioRepository";
import { GetSelectedWorkPage } from "./GetSelectedWorkPage";

describe("GetSelectedWorkPage", () => {
  it("returns the page from the repository", async () => {
    const repository = new FakePortfolioRepository(caseStudies, selectedWorkPage);
    const useCase = new GetSelectedWorkPage(repository);

    const result = await useCase.execute();

    expect(result).toBe(selectedWorkPage);
    expect(repository.selectedWorkPageCalls).toBe(1);
    // The homepage's read is a separate method and must not be pulled in by this one.
    expect(repository.caseStudiesCalls).toBe(0);
  });

  it("propagates a repository failure", async () => {
    const repository = new FakePortfolioRepository(caseStudies, selectedWorkPage);
    repository.error = new Error("selected work page unavailable");
    const useCase = new GetSelectedWorkPage(repository);

    await expect(useCase.execute()).rejects.toThrow("selected work page unavailable");
  });
});
