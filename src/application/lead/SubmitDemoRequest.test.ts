import { describe, expect, it } from "vitest";
import {
  InvalidBusinessEmailError,
  InvalidCompanySizeError,
  InvalidDemoRequestError,
  InvalidFullNameError,
} from "../../domain/lead/errors/LeadErrors";
import { FakeLeadRepository } from "./__fakes__/FakeLeadRepository";
import { SubmitDemoRequest, type SubmitDemoRequestInput } from "./SubmitDemoRequest";

function validInput(overrides: Partial<SubmitDemoRequestInput> = {}): SubmitDemoRequestInput {
  return {
    email: "jane@acme.com",
    fullName: "Jane Doe",
    companyName: "Acme Inc.",
    companySize: "50–200",
    brief: "A launch film for a new product.",
    ...overrides,
  };
}

describe("SubmitDemoRequest", () => {
  it("submits a DemoRequest built from a fully answered form", async () => {
    const repository = new FakeLeadRepository();
    const useCase = new SubmitDemoRequest(repository);

    await useCase.execute(validInput());

    expect(repository.calls).toBe(1);
    expect(repository.received?.fullName?.value).toBe("Jane Doe");
    expect(repository.received?.email.value).toBe("jane@acme.com");
    expect(repository.received?.companyName).toBe("Acme Inc.");
    expect(repository.received?.companySize?.band).toBe("50–200");
    expect(repository.received?.brief?.value).toBe("A launch film for a new product.");
  });

  it("resolves to the stored id and the request it wrote, which is what the mail is built from", async () => {
    const repository = new FakeLeadRepository();
    repository.nextId = "42";

    const submitted = await new SubmitDemoRequest(repository).execute(validInput());

    expect(submitted.id).toBe("42");
    expect(submitted.request).toBe(repository.received);
  });

  /** An email and nothing else is a submission, not a validation failure. */
  it("submits a DemoRequest from an email alone", async () => {
    const repository = new FakeLeadRepository();
    const useCase = new SubmitDemoRequest(repository);

    await useCase.execute({ email: "jane@acme.com" });

    expect(repository.calls).toBe(1);
    expect(repository.received?.fullName).toBeUndefined();
    expect(repository.received?.companyName).toBeUndefined();
    expect(repository.received?.companySize).toBeUndefined();
    expect(repository.received?.brief).toBeUndefined();
  });

  /**
   * Whitespace is a skipped question, not a wrong answer. It used to be the latter — "  "
   * reached the value object and threw — which mattered when the field was required and
   * would now turn an untouched field into a rejected submission.
   */
  it.each(["fullName", "companyName", "companySize", "brief"] as const)(
    "treats a whitespace-only %s as unanswered rather than as an error",
    async (field) => {
      const repository = new FakeLeadRepository();
      const useCase = new SubmitDemoRequest(repository);

      await useCase.execute(validInput({ [field]: "   " }));

      expect(repository.calls).toBe(1);
      expect(repository.received?.[field]).toBeUndefined();
    },
  );

  it("keeps a single-word name rather than insisting on two", async () => {
    const repository = new FakeLeadRepository();
    const useCase = new SubmitDemoRequest(repository);

    await useCase.execute(validInput({ fullName: "Prince" }));

    expect(repository.received?.fullName?.value).toBe("Prince");
  });

  it("keeps a one-character brief rather than insisting on two", async () => {
    const repository = new FakeLeadRepository();
    const useCase = new SubmitDemoRequest(repository);

    await useCase.execute(validInput({ brief: "?" }));

    expect(repository.received?.brief?.value).toBe("?");
  });

  it("propagates a repository failure", async () => {
    const repository = new FakeLeadRepository();
    repository.error = new Error("lead sink unavailable");
    const useCase = new SubmitDemoRequest(repository);

    await expect(useCase.execute(validInput())).rejects.toThrow("lead sink unavailable");
  });

  it("throws InvalidBusinessEmailError for a malformed email and never calls submit", async () => {
    const repository = new FakeLeadRepository();
    const useCase = new SubmitDemoRequest(repository);

    await expect(useCase.execute(validInput({ email: "not-an-email" }))).rejects.toThrow(
      InvalidBusinessEmailError,
    );
    expect(repository.calls).toBe(0);
  });

  it("submits an enquiry from a personal address such as gmail.com", async () => {
    const repository = new FakeLeadRepository();
    const useCase = new SubmitDemoRequest(repository);

    await useCase.execute(validInput({ email: "jane@gmail.com" }));

    expect(repository.received?.email.value).toBe("jane@gmail.com");
  });

  it("throws InvalidBusinessEmailError for a missing email and never calls submit", async () => {
    const repository = new FakeLeadRepository();
    const useCase = new SubmitDemoRequest(repository);

    await expect(useCase.execute({ email: "" })).rejects.toThrow(InvalidBusinessEmailError);
    expect(repository.calls).toBe(0);
  });

  /**
   * The remaining refusals are boundaries a form cannot reach: an answer longer than its
   * column, or a size that is not one of the four bands the select offers. Each is only
   * arrivable by posting to the endpoint directly.
   */
  it("throws InvalidCompanySizeError for a band the select does not offer", async () => {
    const repository = new FakeLeadRepository();
    const useCase = new SubmitDemoRequest(repository);

    await expect(useCase.execute(validInput({ companySize: "huge" }))).rejects.toThrow(
      InvalidCompanySizeError,
    );
    expect(repository.calls).toBe(0);
  });

  it("throws InvalidFullNameError for a name longer than its column", async () => {
    const repository = new FakeLeadRepository();
    const useCase = new SubmitDemoRequest(repository);

    await expect(useCase.execute(validInput({ fullName: "a".repeat(101) }))).rejects.toThrow(
      InvalidFullNameError,
    );
    expect(repository.calls).toBe(0);
  });

  it("throws InvalidDemoRequestError for a company name longer than its column", async () => {
    const repository = new FakeLeadRepository();
    const useCase = new SubmitDemoRequest(repository);

    await expect(useCase.execute(validInput({ companyName: "a".repeat(192) }))).rejects.toThrow(
      InvalidDemoRequestError,
    );
    expect(repository.calls).toBe(0);
  });
});
