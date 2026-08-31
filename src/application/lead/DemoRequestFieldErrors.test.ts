import { describe, expect, it } from "vitest";
import {
  InvalidBusinessEmailError,
  InvalidCompanySizeError,
  InvalidCompanyWebsiteError,
  InvalidContactRoleError,
  InvalidDemoRequestError,
  InvalidFullNameError,
  InvalidProjectBriefError,
} from "../../domain/lead/errors/LeadErrors";
import { toDemoRequestFieldErrors } from "./DemoRequestFieldErrors";

describe("toDemoRequestFieldErrors", () => {
  it("maps InvalidFullNameError to the fullName field", () => {
    const result = toDemoRequestFieldErrors(
      new InvalidFullNameError("a first and last name are both required."),
    );

    expect(result?.fullName).toBeDefined();
  });

  it("maps a free-mail InvalidBusinessEmailError to the email field with an actionable message", () => {
    const result = toDemoRequestFieldErrors(
      new InvalidBusinessEmailError(
        "Please use your work email address instead of a personal gmail.com address.",
        "free-mail",
      ),
    );

    expect(result?.email).toMatch(/work email/i);
    expect(result?.email).not.toMatch(/Invalid business email/i);
  });

  it("maps a malformed InvalidBusinessEmailError without repeating the address back", () => {
    const result = toDemoRequestFieldErrors(
      new InvalidBusinessEmailError('"jane@acme" is not a valid email address.'),
    );

    expect(result?.email).toBe("That does not look like an email address");
  });

  it("maps InvalidCompanySizeError to the companySize field", () => {
    const result = toDemoRequestFieldErrors(new InvalidCompanySizeError("huge"));

    expect(result?.companySize).toBeDefined();
  });

  it("maps InvalidContactRoleError to the role field", () => {
    expect(toDemoRequestFieldErrors(new InvalidContactRoleError("CFO"))?.role).toBeDefined();
  });

  it("maps InvalidCompanyWebsiteError to the companyWebsite field", () => {
    const result = toDemoRequestFieldErrors(new InvalidCompanyWebsiteError("bad"));

    expect(result?.companyWebsite).toBe("That does not look like a website address");
  });

  it("maps InvalidProjectBriefError to the brief field", () => {
    expect(toDemoRequestFieldErrors(new InvalidProjectBriefError("empty"))?.brief).toBeDefined();
  });

  it("returns undefined for an error it doesn't recognize", () => {
    const result = toDemoRequestFieldErrors(new InvalidDemoRequestError("companyName is required."));

    expect(result).toBeUndefined();
  });
});
