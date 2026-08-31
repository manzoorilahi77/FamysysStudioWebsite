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
    fullName: "Jane Doe",
    email: "jane@acme.com",
    companyName: "Acme Inc.",
    companySize: "50–200",
    ...overrides,
  };
}

describe("SubmitDemoRequest", () => {
  it("submits a DemoRequest built from valid input", async () => {
    const repository = new FakeLeadRepository();
    const useCase = new SubmitDemoRequest(repository);

    await useCase.execute(validInput());

    expect(repository.calls).toBe(1);
    expect(repository.received?.fullName.value).toBe("Jane Doe");
    expect(repository.received?.email.value).toBe("jane@acme.com");
    expect(repository.received?.companyName).toBe("Acme Inc.");
    expect(repository.received?.companySize.band).toBe("50–200");
  });

  it("propagates a repository failure", async () => {
    const repository = new FakeLeadRepository();
    repository.error = new Error("lead sink unavailable");
    const useCase = new SubmitDemoRequest(repository);

    await expect(useCase.execute(validInput())).rejects.toThrow("lead sink unavailable");
  });

  it("throws InvalidFullNameError for an invalid name and never calls submit", async () => {
    const repository = new FakeLeadRepository();
    const useCase = new SubmitDemoRequest(repository);

    await expect(useCase.execute(validInput({ fullName: "Jane" }))).rejects.toThrow(
      InvalidFullNameError,
    );
    expect(repository.calls).toBe(0);
  });

  it("throws InvalidBusinessEmailError for a malformed email and never calls submit", async () => {
    const repository = new FakeLeadRepository();
    const useCase = new SubmitDemoRequest(repository);

    await expect(useCase.execute(validInput({ email: "not-an-email" }))).rejects.toThrow(
      InvalidBusinessEmailError,
    );
    expect(repository.calls).toBe(0);
  });

  it("throws InvalidBusinessEmailError for a free-mail domain and never calls submit", async () => {
    const repository = new FakeLeadRepository();
    const useCase = new SubmitDemoRequest(repository);

    await expect(useCase.execute(validInput({ email: "jane@gmail.com" }))).rejects.toThrow(
      InvalidBusinessEmailError,
    );
    expect(repository.calls).toBe(0);
  });

  it("throws InvalidCompanySizeError for an unrecognized band and never calls submit", async () => {
    const repository = new FakeLeadRepository();
    const useCase = new SubmitDemoRequest(repository);

    await expect(useCase.execute(validInput({ companySize: "huge" }))).rejects.toThrow(
      InvalidCompanySizeError,
    );
    expect(repository.calls).toBe(0);
  });

  it("throws InvalidDemoRequestError for a blank company name and never calls submit", async () => {
    const repository = new FakeLeadRepository();
    const useCase = new SubmitDemoRequest(repository);

    await expect(useCase.execute(validInput({ companyName: "   " }))).rejects.toThrow(
      InvalidDemoRequestError,
    );
    expect(repository.calls).toBe(0);
  });
});
