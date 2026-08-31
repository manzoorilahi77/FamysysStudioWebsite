import { describe, expect, it } from "vitest";
import { contactPage } from "../../infrastructure/content/static/contact.content";
import { FakeContactRepository } from "./__fakes__/FakeContactRepository";
import { GetContactPage } from "./GetContactPage";

describe("GetContactPage", () => {
  it("returns the page from the repository", async () => {
    const repository = new FakeContactRepository(contactPage);
    const useCase = new GetContactPage(repository);

    const result = await useCase.execute();

    expect(result).toBe(contactPage);
    expect(repository.pageCalls).toBe(1);
  });

  it("propagates a repository failure", async () => {
    const repository = new FakeContactRepository(contactPage);
    repository.error = new Error("contact page unavailable");
    const useCase = new GetContactPage(repository);

    await expect(useCase.execute()).rejects.toThrow("contact page unavailable");
  });
});
