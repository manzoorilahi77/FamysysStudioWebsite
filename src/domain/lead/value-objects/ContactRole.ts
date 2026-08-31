import { InvalidContactRoleError } from "../errors/LeadErrors";

/**
 * Who is sending the brief.
 *
 * NOT the parent's list. famysys.com asks CEO / COO / CFO / CIO-CTO / VP / Other, which
 * is shaped for an enterprise IT buyer approving an engineering engagement. The Studio
 * sells creative production, and the person who commissions it is a marketing, brand or
 * content owner — often at a company small enough to have no C-suite to route through.
 * Reusing the parent's list would have made two thirds of it unanswerable and pushed most
 * real senders into "Other", which is the same as not asking.
 *
 * Six options, like the parent's, and the last is still "Other" — an unanswerable
 * required select is worse than a coarse one. TODO(client): the six below are a read of
 * who the Studio expects to hear from, not something the brief supplies. See
 * docs/content-todo.md.
 */
const ROLES = [
  "Founder / Owner",
  "Marketing Lead",
  "Brand or Creative Lead",
  "Content or Social Lead",
  "Agency or Partner",
  "Other",
] as const;

export type ContactRoleName = (typeof ROLES)[number];

export class ContactRole {
  private constructor(readonly name: ContactRoleName) {}

  static create(value: string): ContactRole {
    if (!ROLES.includes(value as ContactRoleName)) {
      throw new InvalidContactRoleError(value);
    }
    return new ContactRole(value as ContactRoleName);
  }

  static options(): ReadonlyArray<ContactRoleName> {
    return ROLES;
  }

  toString(): string {
    return this.name;
  }
}
