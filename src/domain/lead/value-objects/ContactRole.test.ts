import { describe, expect, it } from "vitest";
import { InvalidContactRoleError } from "../errors/LeadErrors";
import { ContactRole } from "./ContactRole";

describe("ContactRole", () => {
  it.each([
    "Founder / Owner",
    "Marketing Lead",
    "Brand or Creative Lead",
    "Content or Social Lead",
    "Agency or Partner",
    "Other",
  ])("creates a ContactRole for the valid role %s", (role) => {
    expect(ContactRole.create(role).name).toBe(role);
  });

  it("exposes the valid roles via options()", () => {
    expect(ContactRole.options()).toHaveLength(6);
    expect(ContactRole.options().at(-1)).toBe("Other");
  });

  it("does not carry the parent site's enterprise-IT roles", () => {
    for (const inherited of ["CEO / Founder", "CFO / Finance Lead", "CIO / CTO"]) {
      expect(() => ContactRole.create(inherited)).toThrow(InvalidContactRoleError);
    }
  });

  it.each(["", "Chief Vibes Officer", "founder / owner"])(
    "throws InvalidContactRoleError for the unrecognized role %s",
    (value) => {
      expect(() => ContactRole.create(value)).toThrow(InvalidContactRoleError);
    },
  );
});
