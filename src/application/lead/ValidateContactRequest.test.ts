import { describe, expect, it } from "vitest";
import {
  CONTACT_FIELD_ORDER,
  toSubmitDemoRequestInput,
  validateContactRequest,
  type ContactRequestInput,
} from "./ValidateContactRequest";

function validInput(overrides: Partial<ContactRequestInput> = {}): ContactRequestInput {
  return {
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@acme.com",
    companyName: "Acme Inc.",
    companyWebsite: "",
    role: "Marketing Lead",
    companySize: "50–200",
    brief: "A launch film for a new product.",
    ...overrides,
  };
}

const EMPTY_INPUT: ContactRequestInput = {
  firstName: "",
  lastName: "",
  email: "",
  companyName: "",
  companyWebsite: "",
  role: "",
  companySize: "",
  brief: "",
};

describe("validateContactRequest", () => {
  it("returns no errors for a complete, valid submission", () => {
    expect(validateContactRequest(validInput())).toEqual({});
  });

  it("reports every required field at once when the form is submitted empty", () => {
    const errors = validateContactRequest(EMPTY_INPUT);

    expect(errors).toEqual({
      firstName: "Required",
      lastName: "Required",
      email: "Required",
      companyName: "Required",
      role: "Required",
      companySize: "Required",
      brief: "Required",
    });
  });

  it("passes the empty optional website on an otherwise empty submission", () => {
    expect(validateContactRequest(EMPTY_INPUT).companyWebsite).toBeUndefined();
  });

  it("reports a malformed email without repeating the address back", () => {
    const errors = validateContactRequest(validInput({ email: "jane@acme" }));

    expect(errors.email).toBe("That does not look like an email address");
  });

  it("reports a free-mail address with the actionable message, not a technical one", () => {
    const errors = validateContactRequest(validInput({ email: "jane@gmail.com" }));

    expect(errors.email).toBe(
      "Please use your work email address instead of a personal gmail.com address.",
    );
  });

  it("reports a malformed website but accepts a scheme-less one", () => {
    expect(validateContactRequest(validInput({ companyWebsite: "acme" })).companyWebsite).toBe(
      "That does not look like a website address",
    );
    expect(
      validateContactRequest(validInput({ companyWebsite: "acme.com" })).companyWebsite,
    ).toBeUndefined();
  });

  it("rejects a role or company size that is not one of the offered options", () => {
    const errors = validateContactRequest(
      validInput({ role: "CFO / Finance Lead", companySize: "11-50" }),
    );

    expect(errors.role).toBe("Required");
    expect(errors.companySize).toBe("Required");
  });

  it("orders the fields as they appear in the form, so the first error is the first on the page", () => {
    expect(CONTACT_FIELD_ORDER).toEqual([
      "firstName",
      "lastName",
      "email",
      "companyName",
      "companyWebsite",
      "role",
      "companySize",
      "brief",
    ]);
  });
});

describe("toSubmitDemoRequestInput", () => {
  it("composes the two name fields into the single name the use case takes", () => {
    expect(toSubmitDemoRequestInput(validInput()).fullName).toBe("Jane Doe");
  });

  it("omits an empty website rather than sending a blank string", () => {
    expect(toSubmitDemoRequestInput(validInput())).not.toHaveProperty("companyWebsite");
  });

  it("carries a supplied website through", () => {
    expect(toSubmitDemoRequestInput(validInput({ companyWebsite: " acme.com " }))).toMatchObject({
      companyWebsite: "acme.com",
    });
  });
});
