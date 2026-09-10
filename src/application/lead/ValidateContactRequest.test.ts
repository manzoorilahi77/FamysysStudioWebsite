import { describe, expect, it } from "vitest";
import {
  CONTACT_FIELD_ORDER,
  REQUIRED_FIELD,
  toSubmitDemoRequestInput,
  validateContactRequest,
  type ContactRequestInput,
} from "./ValidateContactRequest";

function validInput(overrides: Partial<ContactRequestInput> = {}): ContactRequestInput {
  return {
    fullName: "Jane Doe",
    email: "jane@acme.com",
    companyName: "Acme Inc.",
    companySize: "50–200",
    brief: "A launch film for a new product.",
    ...overrides,
  };
}

const EMPTY_INPUT: ContactRequestInput = {
  fullName: "",
  email: "",
  companyName: "",
  companySize: "",
  brief: "",
};

describe("validateContactRequest", () => {
  it("returns no errors for a complete, valid submission", () => {
    expect(validateContactRequest(validInput())).toEqual({});
  });

  /**
   * THE CENTRAL RULE, asserted as one thing rather than four. A submission carrying an
   * email and nothing else is a valid submission — that is the whole point of the change,
   * and the test that would catch it being quietly reverted a field at a time.
   */
  it("accepts an email on its own, with every other field left blank", () => {
    expect(validateContactRequest({ ...EMPTY_INPUT, email: "jane@acme.com" })).toEqual({});
  });

  it("reports only the email when the form is submitted completely empty", () => {
    expect(validateContactRequest(EMPTY_INPUT)).toEqual({
      email: "Enter an email address so we can reply",
    });
  });

  it.each([
    ["a name", { fullName: "" }],
    ["a company", { companyName: "" }],
    ["a company size", { companySize: "" }],
    ["a brief", { brief: "" }],
    ["whitespace in every optional field", { fullName: "  ", companyName: "  ", brief: "  " }],
  ])("does not complain about a missing %s", (_label, overrides) => {
    expect(validateContactRequest(validInput(overrides))).toEqual({});
  });

  /**
   * A size that is not one of the four bands cannot be produced by the select, so this is
   * only reachable by a direct post — and it is NOT reported to the sender, because the
   * field is optional and the form has nothing to ask them to fix. The server drops it.
   */
  it("ignores a company size that is not one of the offered bands", () => {
    expect(validateContactRequest(validInput({ companySize: "11-50" }))).toEqual({});
  });

  it.each(["jane@acme", "shaf#gmail.com", "shaf@gmail..com", "shaf @gmail.com"])(
    "reports the malformed email %j with an example, without repeating the address back",
    (email) => {
      expect(validateContactRequest(validInput({ email })).email).toBe(
        "Enter a valid email address, like name@company.com",
      );
    },
  );

  it("offers the corrected address for a likely typo", () => {
    expect(validateContactRequest(validInput({ email: "shaf@gmai.com" })).email).toBe(
      "Check the address — did you mean shaf@gmail.com?",
    );
  });

  it("accepts a personal address such as gmail.com", () => {
    expect(validateContactRequest(validInput({ email: "jane@gmail.com" }))).toEqual({});
  });

  it("orders the fields as they appear in the form, so the first error is the first on the page", () => {
    expect(CONTACT_FIELD_ORDER).toEqual([
      "fullName",
      "email",
      "companyName",
      "companySize",
      "brief",
    ]);
  });

  /** Both forms mark exactly this input `required`, so it has to stay the one this checks. */
  it("names the email as the single required field", () => {
    expect(REQUIRED_FIELD).toBe("email");
    expect(validateContactRequest({ ...EMPTY_INPUT })).toHaveProperty(REQUIRED_FIELD);
  });
});

describe("toSubmitDemoRequestInput", () => {
  it("carries every answered field through, trimmed", () => {
    expect(toSubmitDemoRequestInput(validInput({ fullName: "  Jane Doe  " }))).toEqual({
      fullName: "Jane Doe",
      email: "jane@acme.com",
      companyName: "Acme Inc.",
      companySize: "50–200",
      brief: "A launch film for a new product.",
    });
  });

  /**
   * An unanswered question is OMITTED rather than sent as "". That is what decides whether
   * the row stores NULL or a blank string, so it is asserted on the key rather than on the
   * value — `{ fullName: "" }` would pass a value check and still be the wrong payload.
   */
  it.each(["fullName", "companyName", "companySize", "brief"])(
    "omits %s entirely when it is left blank",
    (field) => {
      const payload = toSubmitDemoRequestInput({ ...EMPTY_INPUT, email: "jane@acme.com" });

      expect(payload).not.toHaveProperty(field);
    },
  );

  it("sends the email alone when nothing else was filled in", () => {
    expect(toSubmitDemoRequestInput({ ...EMPTY_INPUT, email: "jane@acme.com" })).toEqual({
      email: "jane@acme.com",
    });
  });
});
