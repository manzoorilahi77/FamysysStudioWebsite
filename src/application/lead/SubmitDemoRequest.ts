import { BusinessEmail } from "../../domain/lead/value-objects/BusinessEmail";
import { CompanySize } from "../../domain/lead/value-objects/CompanySize";
import { CompanyWebsite } from "../../domain/lead/value-objects/CompanyWebsite";
import { ContactRole } from "../../domain/lead/value-objects/ContactRole";
import { FullName } from "../../domain/lead/value-objects/FullName";
import { ProjectBrief } from "../../domain/lead/value-objects/ProjectBrief";
import { DemoRequest } from "../../domain/lead/entities/DemoRequest";
import type { LeadRepository } from "../../domain/lead/repositories/LeadRepository";

/**
 * The four required fields are what both forms ask. The last three are /contact's, and
 * are absent rather than empty when the homepage's closing form is the sender — an empty
 * string is a value the sender chose not to give, and undefined is a question that was
 * never asked. Only the first has a validation message worth showing.
 */
export interface SubmitDemoRequestInput {
  readonly fullName: string;
  readonly email: string;
  readonly companyName: string;
  readonly companySize: string;
  readonly companyWebsite?: string | undefined;
  readonly role?: string | undefined;
  readonly brief?: string | undefined;
}

export class SubmitDemoRequest {
  constructor(private readonly repository: LeadRepository) {}

  async execute(input: SubmitDemoRequestInput): Promise<void> {
    const request = DemoRequest.create({
      fullName: FullName.create(input.fullName),
      email: BusinessEmail.create(input.email),
      companyName: input.companyName,
      companySize: CompanySize.create(input.companySize),
      companyWebsite: optional(input.companyWebsite, CompanyWebsite.create),
      role: optional(input.role, ContactRole.create),
      brief: optional(input.brief, ProjectBrief.create),
    });
    await this.repository.submit(request);
  }
}

/**
 * An absent field never reaches its value object, so the optionality lives here rather
 * than as an empty-string special case inside each one. A field that IS present is
 * validated normally — "  " is a website the sender got wrong, not a website they skipped.
 */
function optional<T>(value: string | undefined, create: (raw: string) => T): T | undefined {
  return value === undefined ? undefined : create(value);
}
