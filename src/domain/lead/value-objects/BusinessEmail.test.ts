import { describe, expect, it } from "vitest";
import { InvalidBusinessEmailError } from "../errors/LeadErrors";
import { BusinessEmail, EMAIL_MAX_LENGTH } from "./BusinessEmail";

function refusal(value: string): InvalidBusinessEmailError {
  try {
    BusinessEmail.create(value);
  } catch (error: unknown) {
    if (error instanceof InvalidBusinessEmailError) return error;
    throw error;
  }
  throw new Error(`Expected "${value}" to be refused.`);
}

describe("BusinessEmail", () => {
  it("creates a BusinessEmail from a valid business address and lowercases it", () => {
    const email = BusinessEmail.create("Jane.Doe@Acme.com");

    expect(email.value).toBe("jane.doe@acme.com");
    expect(email.domain).toBe("acme.com");
  });

  /** Personal addresses used to be refused. An enquiry from Gmail is still an enquiry. */
  it.each(["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com"])(
    "accepts a personal address at %s",
    (domain) => {
      expect(BusinessEmail.create(`Person@${domain}`).value).toBe(`person@${domain}`);
    },
  );

  it.each([
    "o'brien@acme.co.uk",
    "first.last+tag@studio.acme.io",
    "a_b-c%d@sub-domain.example.studio",
    "  padded@acme.com  ",
  ])("accepts the well-formed address %j", (value) => {
    expect(() => BusinessEmail.create(value)).not.toThrow();
  });

  it.each([
    ["missing @", "shaf#gmail.com"],
    ["missing domain", "person@"],
    ["missing local part", "@acme.com"],
    ["no TLD", "person@acme"],
    ["a one-letter TLD", "person@acme.c"],
    ["two @", "shaf@@gmail.com"],
    ["a space", "shaf @gmail.com"],
    ["two dots together", "shaf@gmail..com"],
    ["a leading dot", ".shaf@gmail.com"],
    ["a dot before the @", "shaf.@gmail.com"],
    ["a hyphen starting a label", "shaf@-gmail.com"],
    ["a comma", "shaf@gmail,com"],
    ["empty string", ""],
  ])("refuses an address with %s as malformed", (_label, value) => {
    expect(refusal(value).failure).toBe("malformed");
  });

  it("refuses an address longer than the column it is stored in", () => {
    const local = "a".repeat(EMAIL_MAX_LENGTH);

    expect(refusal(`${local}@acme.com`).failure).toBe("too-long");
  });

  it.each([
    ["shaf@gmai.com", "shaf@gmail.com"],
    ["shaf@gmial.com", "shaf@gmail.com"],
    ["shaf@gmail.co", "shaf@gmail.com"],
    ["shaf@hotmial.com", "shaf@hotmail.com"],
    ["jane@acme.con", "jane@acme.com"],
  ])("refuses %s as a likely typo and suggests %s", (value, suggestion) => {
    const error = refusal(value);

    expect(error.failure).toBe("likely-typo");
    expect(error.suggestion).toBe(suggestion);
  });
});
