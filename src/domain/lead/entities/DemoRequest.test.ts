import { describe, expect, it } from "vitest";
import { BusinessEmail } from "../value-objects/BusinessEmail";
import { CompanySize } from "../value-objects/CompanySize";
import { FullName } from "../value-objects/FullName";
import { InvalidDemoRequestError } from "../errors/LeadErrors";
import { DemoRequest } from "./DemoRequest";

const EMAIL = BusinessEmail.create("jane@acme.com");

describe("DemoRequest", () => {
  it("creates a DemoRequest and trims the company name", () => {
    const request = DemoRequest.create({
      email: EMAIL,
      fullName: FullName.create("Jane Doe"),
      companyName: "  Acme Inc.  ",
      companySize: CompanySize.create("50–200"),
    });

    expect(request.companyName).toBe("Acme Inc.");
    expect(request.fullName?.value).toBe("Jane Doe");
    expect(request.email.value).toBe("jane@acme.com");
    expect(request.companySize?.band).toBe("50–200");
  });

  /**
   * The change this type exists to express: an enquiry is an address and whatever else the
   * sender chose to say. Everything but the email is allowed to be absent.
   */
  it("creates a DemoRequest from an email alone", () => {
    const request = DemoRequest.create({ email: EMAIL });

    expect(request.email.value).toBe("jane@acme.com");
    expect(request.fullName).toBeUndefined();
    expect(request.companyName).toBeUndefined();
    expect(request.companySize).toBeUndefined();
    expect(request.brief).toBeUndefined();
  });

  /**
   * A blank company name becomes `undefined`, never "". The row stores NULL for a question
   * the sender skipped, and a blank string would read in the inbox as an answer of nothing.
   */
  it.each(["", "   "])("treats a blank company name (%p) as unanswered", (companyName) => {
    expect(DemoRequest.create({ email: EMAIL, companyName }).companyName).toBeUndefined();
  });

  /**
   * The one thing a company name can still fail on, and it is a boundary rather than a
   * judgement: `inquiries.company_name` is VARCHAR(191), so a longer value is a write that
   * fails at the database with a 503 instead of a message the sender can act on.
   */
  it("throws InvalidDemoRequestError for a company name longer than its column", () => {
    expect(() => DemoRequest.create({ email: EMAIL, companyName: "a".repeat(192) })).toThrow(
      InvalidDemoRequestError,
    );
  });

  it("accepts a company name exactly at the column width", () => {
    const name = "a".repeat(191);

    expect(DemoRequest.create({ email: EMAIL, companyName: name }).companyName).toBe(name);
  });
});
