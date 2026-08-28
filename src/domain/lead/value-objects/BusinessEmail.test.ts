import { describe, expect, it } from "vitest";
import { InvalidBusinessEmailError } from "../errors/LeadErrors";
import { BusinessEmail } from "./BusinessEmail";

describe("BusinessEmail", () => {
  it("creates a BusinessEmail from a valid business address and lowercases it", () => {
    const email = BusinessEmail.create("Jane.Doe@Acme.com");

    expect(email.value).toBe("jane.doe@acme.com");
    expect(email.domain).toBe("acme.com");
  });

  it.each(["gmail.com", "yahoo.com", "hotmail.com", "icloud.com"])(
    "throws InvalidBusinessEmailError for the free-mail domain %s",
    (domain) => {
      expect(() => BusinessEmail.create(`person@${domain}`)).toThrow(InvalidBusinessEmailError);
    },
  );

  it.each([
    ["missing @", "not-an-email"],
    ["missing domain", "person@"],
    ["missing local part", "@acme.com"],
    ["no TLD", "person@acme"],
    ["empty string", ""],
  ])("throws InvalidBusinessEmailError for %s", (_label, value) => {
    expect(() => BusinessEmail.create(value)).toThrow(InvalidBusinessEmailError);
  });
});
