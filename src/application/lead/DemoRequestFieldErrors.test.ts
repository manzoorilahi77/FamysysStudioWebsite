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
      new InvalidFullNameError("name exceeds 100 characters."),
    );

    expect(result?.fullName).toBeDefined();
  });

  /**
   * The company name is a plain string rather than a value object, so its over-length
   * refusal arrives as the entity's own error and has to land on the right field rather
   * than falling through to the 503 branch.
   */
  it("maps InvalidDemoRequestError to the companyName field", () => {
    const result = toDemoRequestFieldErrors(
      new InvalidDemoRequestError("companyName exceeds 191 characters."),
    );

    expect(result?.companyName).toBeDefined();
  });

  it("maps a malformed InvalidBusinessEmailError to an example, without repeating the address back", () => {
    const result = toDemoRequestFieldErrors(
      new InvalidBusinessEmailError('"jane@acme" is not a valid email address.'),
    );

    expect(result?.email).toBe("Enter a valid email address, like name@company.com");
  });

  it("maps a likely typo to the corrected address", () => {
    const result = toDemoRequestFieldErrors(
      new InvalidBusinessEmailError("misspelt", "likely-typo", "shaf@gmail.com"),
    );

    expect(result?.email).toBe("Check the address — did you mean shaf@gmail.com?");
  });

  it("maps an over-long address to its own message", () => {
    const result = toDemoRequestFieldErrors(new InvalidBusinessEmailError("long", "too-long"));

    expect(result?.email).toMatch(/too long/);
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

  /**
   * `InvalidDemoRequestError` used to be the example here, because nothing mapped it. It
   * now carries the company name's over-length refusal, so the unrecognised case needs an
   * error from outside the lead domain — which is exactly what the route's 503 branch is
   * for: a database that refused the write is not a field the sender can fix.
   */
  it("returns undefined for an error it doesn't recognize", () => {
    expect(toDemoRequestFieldErrors(new Error("ER_LOCK_WAIT_TIMEOUT"))).toBeUndefined();
    expect(toDemoRequestFieldErrors(undefined)).toBeUndefined();
  });
});
