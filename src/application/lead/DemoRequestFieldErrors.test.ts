import { describe, expect, it } from "vitest";
import {
  InvalidBusinessEmailError,
  InvalidCompanySizeError,
  InvalidDemoRequestError,
  InvalidFullNameError,
} from "../../domain/lead/errors/LeadErrors";
import { toDemoRequestFieldErrors } from "./DemoRequestFieldErrors";

describe("toDemoRequestFieldErrors", () => {
  it("maps InvalidFullNameError to the fullName field", () => {
    const result = toDemoRequestFieldErrors(new InvalidFullNameError("a first and last name are both required."));

    expect(result?.fullName).toBeDefined();
  });

  it("maps InvalidBusinessEmailError to the email field with an actionable message", () => {
    const result = toDemoRequestFieldErrors(
      new InvalidBusinessEmailError("Please use your work email address instead of a personal gmail.com address."),
    );

    expect(result?.email).toMatch(/work email/i);
    expect(result?.email).not.toMatch(/Invalid business email/i);
  });

  it("maps InvalidCompanySizeError to the companySize field", () => {
    const result = toDemoRequestFieldErrors(new InvalidCompanySizeError("huge"));

    expect(result?.companySize).toBeDefined();
  });

  it("returns undefined for an error it doesn't recognize", () => {
    const result = toDemoRequestFieldErrors(new InvalidDemoRequestError("companyName is required."));

    expect(result).toBeUndefined();
  });
});
