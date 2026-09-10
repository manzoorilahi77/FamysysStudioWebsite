import {
  InvalidBusinessEmailError,
  InvalidCompanySizeError,
  InvalidCompanyWebsiteError,
  InvalidContactRoleError,
  InvalidDemoRequestError,
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
 * POST, or a browser with the client-side pass unavailable. The forms' own message comes
 * from `validateContactRequest`; the two agree on wording where they overlap.
 *
 * MOST OF THESE ARE NOW UNREACHABLE FROM THE FORMS, and are kept because the endpoint is
 * public. Only the email is required and only the email is checked in the browser, so a
 * name, a company, a size or a brief can only fail here if something posted directly:
 * an answer longer than its column, or a company size that is not one of the four bands.
 * Each still gets a message that says what is wrong rather than a bare 422.
 */
export const MALFORMED_EMAIL_MESSAGE = "Enter a valid email address, like name@company.com";

/**
 * What to tell the sender about an address that was refused. Shared by the browser's pass
 * and the server's, so the two cannot word the same problem differently.
 *
 * A malformed address gets an example rather than the address repeated back — the sender
 * can see what they typed. A likely typo gets the corrected address, which is the one
 * thing more useful than an error.
 */
export function emailErrorMessage(error: InvalidBusinessEmailError): string {
  if (error.failure === "likely-typo" && error.suggestion !== undefined) {
    return `Check the address — did you mean ${error.suggestion}?`;
  }
  if (error.failure === "too-long") {
    return "That email address is too long. Use a shorter one";
  }
  return MALFORMED_EMAIL_MESSAGE;
}

export function toDemoRequestFieldErrors(error: unknown): DemoRequestFieldErrors | undefined {
  if (error instanceof InvalidFullNameError) {
    return { fullName: "That name is too long." };
  }
  if (error instanceof InvalidBusinessEmailError) {
    return { email: emailErrorMessage(error) };
  }
  if (error instanceof InvalidDemoRequestError) {
    return { companyName: "That company name is too long." };
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
    return { brief: "That is longer than we can store. Please shorten it." };
  }
  return undefined;
}
