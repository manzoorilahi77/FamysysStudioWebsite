import { describe, expect, it } from "vitest";
import { InvalidCompanyWebsiteError } from "../errors/LeadErrors";
import { CompanyWebsite } from "./CompanyWebsite";

describe("CompanyWebsite", () => {
  it("assumes https when the sender omits the scheme", () => {
    expect(CompanyWebsite.create("acme.com").value).toBe("https://acme.com/");
  });

  it("keeps an explicit http scheme rather than upgrading it", () => {
    expect(CompanyWebsite.create("http://acme.com").value).toBe("http://acme.com/");
  });

  it("keeps a path", () => {
    expect(CompanyWebsite.create("https://acme.com/work").value).toBe("https://acme.com/work");
  });

  it("accepts a subdomain and a multi-part suffix", () => {
    expect(CompanyWebsite.create("studio.acme.co.uk").value).toBe("https://studio.acme.co.uk/");
  });

  it.each([
    "acme",
    "not a website",
    "htp://acme.com",
    "mailto:hi@acme.com",
    "javascript:alert(1)",
    "data:text/html,hi",
    // Parses as credentials `admin:pw` against host acme.com. Refused rather than stored.
    "https://admin:pw@acme.com",
  ])("throws InvalidCompanyWebsiteError for %s", (value) => {
    expect(() => CompanyWebsite.create(value)).toThrow(InvalidCompanyWebsiteError);
  });

  it("keeps a host and port together rather than reading the port as a scheme", () => {
    expect(CompanyWebsite.create("acme.com:8080/work").value).toBe("https://acme.com:8080/work");
  });

  it("throws InvalidCompanyWebsiteError past the length ceiling", () => {
    expect(() => CompanyWebsite.create(`acme.com/${"x".repeat(2000)}`)).toThrow(
      InvalidCompanyWebsiteError,
    );
  });
});
