import { BusinessEmail } from "../../domain/lead/value-objects/BusinessEmail";
import { CompanySize } from "../../domain/lead/value-objects/CompanySize";
import { CompanyWebsite } from "../../domain/lead/value-objects/CompanyWebsite";
import { ContactRole } from "../../domain/lead/value-objects/ContactRole";
import { FullName } from "../../domain/lead/value-objects/FullName";
import { ProjectBrief } from "../../domain/lead/value-objects/ProjectBrief";
import { DemoRequest } from "../../domain/lead/entities/DemoRequest";
import type { LeadRepository } from "../../domain/lead/repositories/LeadRepository";

/**
 * EMAIL IS THE ONLY FIELD THIS REQUIRES. Everything else is whatever the sender chose to
 * fill in, and is absent rather than empty when they skipped it — an empty string is a
 * value someone typed, `undefined` is a question they left alone. See `DemoRequest`.
 *
 * `companyWebsite` and `role` are no longer collected by either form. They stay in the
 * input because the endpoint is public and older clients may still post them, and because
 * `inquiries` holds the columns and the panel's inbox still shows them for the rows that
 * have them. Nothing sends them today.
 */
export interface SubmitDemoRequestInput {
  readonly email: string;
  readonly fullName?: string | undefined;
  readonly companyName?: string | undefined;
  readonly companySize?: string | undefined;
  readonly companyWebsite?: string | undefined;
  readonly role?: string | undefined;
  readonly brief?: string | undefined;
}

/** The stored enquiry: its id, and the validated request that was written. */
export interface SubmittedDemoRequest {
  readonly id: string;
  readonly request: DemoRequest;
}

export class SubmitDemoRequest {
  constructor(private readonly repository: LeadRepository) {}

  async execute(input: SubmitDemoRequestInput): Promise<SubmittedDemoRequest> {
    const request = DemoRequest.create({
      email: BusinessEmail.create(input.email),
      fullName: optional(input.fullName, FullName.create),
      companyName: input.companyName,
      companySize: optional(input.companySize, CompanySize.create),
      companyWebsite: optional(input.companyWebsite, CompanyWebsite.create),
      role: optional(input.role, ContactRole.create),
      brief: optional(input.brief, ProjectBrief.create),
    });
    const id = await this.repository.submit(request);
    return { id, request };
  }
}

/**
 * A skipped field never reaches its value object, so the optionality lives here rather
 * than as an empty-string special case inside each one.
 *
 * BLANK COUNTS AS SKIPPED. It used to be that only `undefined` did, and "  " was treated
 * as an answer the sender got wrong. That was right when these fields were required and
 * the distinction carried weight; now that every one of them is optional, a field holding
 * nothing but spaces is a field the sender left alone, and rejecting it would be the form
 * inventing an error out of an answer it never needed.
 */
function optional<T>(value: string | undefined, create: (raw: string) => T): T | undefined {
  return value === undefined || !value.trim() ? undefined : create(value);
}
