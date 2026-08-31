import { describe, expect, it } from "vitest";
import { BusinessEmail } from "../value-objects/BusinessEmail";
import { CompanySize } from "../value-objects/CompanySize";
import { FullName } from "../value-objects/FullName";
import { InvalidDemoRequestError } from "../errors/LeadErrors";
import { DemoRequest } from "./DemoRequest";

function validProps(overrides: Partial<{ companyName: string }> = {}) {
  return {
    fullName: FullName.create("Jane Doe"),
    email: BusinessEmail.create("jane@acme.com"),
    companyName: overrides.companyName ?? "Acme Inc.",
    companySize: CompanySize.create("50–200"),
  };
}

describe("DemoRequest", () => {
  it("creates a DemoRequest and trims the company name", () => {
    const request = DemoRequest.create(validProps({ companyName: "  Acme Inc.  " }));

    expect(request.companyName).toBe("Acme Inc.");
    expect(request.fullName.value).toBe("Jane Doe");
    expect(request.email.value).toBe("jane@acme.com");
    expect(request.companySize.band).toBe("50–200");
  });

  it("throws InvalidDemoRequestError when companyName is empty", () => {
    expect(() => DemoRequest.create(validProps({ companyName: "   " }))).toThrow(
      InvalidDemoRequestError,
    );
  });
});
