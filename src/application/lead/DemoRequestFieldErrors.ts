import {
  InvalidBusinessEmailError,
  InvalidCompanySizeError,
  InvalidCompanyWebsiteError,
  InvalidContactRoleError,
  InvalidFullNameError,
  InvalidProjectBriefError,
} from "../../domain/lead/errors/LeadErrors";

export interface DemoRequestFieldErrors {
  readonly fullName?: string;
  readonly email?: string;
  readonly companyName?: string;
  readonly companySize?: string;
  readonly companyWebsite?: string;
  readonly role?: string;
  readonly brief?: string;
}

/**
 * Translates a SubmitDemoRequest validation failure into a field-addressable, user-facing
 * message.
 *
 * This is the SERVER's translation, for a submission that reached the route — a direct
 * POST, or a browser with the client-side pass unavailable. The contact form's own
 * messages come from `validateContactRequest`, which reports all eight fields at once
 * instead of the first failure; the two agree on wording where they overlap.
 */
export function toDemoRequestFieldErrors(error: unknown): DemoRequestFieldErrors | undefined {
  if (error instanceof InvalidFullNameError) {
    return { fullName: "Enter your first and last name." };
  }
  if (error instanceof InvalidBusinessEmailError) {
    // A free-mail address is a valid address the studio declines to take a brief at, so
    // its message names the domain and says what to send instead. A malformed one gets
    // the short form rather than the address repeated back.
    return {
      email:
        error.failure === "free-mail"
          ? error.message.replace("Invalid business email: ", "")
          : "That does not look like an email address",
    };
  }
  if (error instanceof InvalidCompanySizeError) {
    return { companySize: "Choose a company size from the list." };
  }
  if (error instanceof InvalidContactRoleError) {
    return { role: "Choose a role from the list." };
  }
  if (error instanceof InvalidCompanyWebsiteError) {
    return { companyWebsite: "That does not look like a website address" };
  }
  if (error instanceof InvalidProjectBriefError) {
    return { brief: "Tell us what you are trying to create." };
  }
  return undefined;
}
