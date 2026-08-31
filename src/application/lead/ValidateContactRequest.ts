import { InvalidBusinessEmailError } from "../../domain/lead/errors/LeadErrors";
import { BusinessEmail } from "../../domain/lead/value-objects/BusinessEmail";
import { CompanySize } from "../../domain/lead/value-objects/CompanySize";
import { CompanyWebsite } from "../../domain/lead/value-objects/CompanyWebsite";
import { ContactRole } from "../../domain/lead/value-objects/ContactRole";
import { ProjectBrief } from "../../domain/lead/value-objects/ProjectBrief";
import type { SubmitDemoRequestInput } from "./SubmitDemoRequest";

/** The contact form's eight fields, exactly as typed — raw strings, nothing coerced. */
export interface ContactRequestInput {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly companyName: string;
  readonly companyWebsite: string;
  readonly role: string;
  readonly companySize: string;
  readonly brief: string;
}

export type ContactField = keyof ContactRequestInput;

export type ContactFieldErrors = Partial<Record<ContactField, string>>;

/**
 * The order the fields appear in the form. Focus moves to the FIRST invalid field on a
 * failed submit, and "first" has to mean first on the page rather than first in whatever
 * order an object's keys happen to enumerate — otherwise focus lands somewhere the reader
 * has to hunt for. Reused by the form to walk its own errors.
 */
export const CONTACT_FIELD_ORDER: ReadonlyArray<ContactField> = [
  "firstName",
  "lastName",
  "email",
  "companyName",
  "companyWebsite",
  "role",
  "companySize",
  "brief",
];

const REQUIRED_MESSAGE = "Required";
const MALFORMED_EMAIL_MESSAGE = "That does not look like an email address";
const MALFORMED_WEBSITE_MESSAGE = "That does not look like a website address";

/**
 * Every field's verdict in one pass.
 *
 * `SubmitDemoRequest` builds its value objects one after another and throws on the first
 * failure, which is right for a use case — it either has a valid request or it does not.
 * It is wrong for a form, where a sender who submits an empty one has to see all eight
 * errors at once rather than discovering them one submit at a time. So this runs the same
 * value objects, independently, and collects.
 *
 * It is the client-side pass. The route still runs `SubmitDemoRequest`, which stays the
 * authority — this exists so the reader gets their errors without a round trip, not so
 * the server can trust the browser.
 */
export function validateContactRequest(input: ContactRequestInput): ContactFieldErrors {
  const errors: ContactFieldErrors = {
    ...requiredTextErrors(input),
    ...emailError(input.email),
    ...roleError(input.role),
    ...companySizeError(input.companySize),
    ...briefError(input.brief),
    ...websiteError(input.companyWebsite),
  };
  return errors;
}

/** The plain "did they type anything" fields. Their only failure is being empty. */
function requiredTextErrors(input: ContactRequestInput): ContactFieldErrors {
  const errors: ContactFieldErrors = {};
  if (!input.firstName.trim()) {
    errors.firstName = REQUIRED_MESSAGE;
  }
  if (!input.lastName.trim()) {
    errors.lastName = REQUIRED_MESSAGE;
  }
  if (!input.companyName.trim()) {
    errors.companyName = REQUIRED_MESSAGE;
  }
  return errors;
}

function emailError(value: string): ContactFieldErrors {
  if (!value.trim()) {
    return { email: REQUIRED_MESSAGE };
  }
  try {
    BusinessEmail.create(value);
    return {};
  } catch (error) {
    // A free-mail address is valid and deliberately refused, so the value object's own
    // message — which names the domain and says what to send instead — is the one to
    // show. A malformed address gets the short form; repeating the address back at
    // someone who mistyped it adds nothing.
    if (error instanceof InvalidBusinessEmailError && error.failure === "free-mail") {
      return { email: error.message.replace("Invalid business email: ", "") };
    }
    return { email: MALFORMED_EMAIL_MESSAGE };
  }
}

function roleError(value: string): ContactFieldErrors {
  if (!value.trim()) {
    return { role: REQUIRED_MESSAGE };
  }
  try {
    ContactRole.create(value);
    return {};
  } catch {
    return { role: REQUIRED_MESSAGE };
  }
}

function companySizeError(value: string): ContactFieldErrors {
  if (!value.trim()) {
    return { companySize: REQUIRED_MESSAGE };
  }
  try {
    CompanySize.create(value);
    return {};
  } catch {
    return { companySize: REQUIRED_MESSAGE };
  }
}

function briefError(value: string): ContactFieldErrors {
  if (!value.trim()) {
    return { brief: REQUIRED_MESSAGE };
  }
  try {
    ProjectBrief.create(value);
    return {};
  } catch {
    return { brief: REQUIRED_MESSAGE };
  }
}

/** The one optional field: empty passes, anything typed has to be a website. */
function websiteError(value: string): ContactFieldErrors {
  if (!value.trim()) {
    return {};
  }
  try {
    CompanyWebsite.create(value);
    return {};
  } catch {
    return { companyWebsite: MALFORMED_WEBSITE_MESSAGE };
  }
}

/**
 * The form's eight fields as the use case's four-plus-three.
 *
 * `fullName` is composed here rather than asked for, because the form splits the name to
 * be able to say which half is missing, and `FullName` wants the whole thing. The website
 * is omitted rather than sent empty — undefined is a question left blank, "" would be an
 * answer the value object would then have to reject.
 */
export function toSubmitDemoRequestInput(input: ContactRequestInput): SubmitDemoRequestInput {
  const website = input.companyWebsite.trim();
  return {
    fullName: `${input.firstName.trim()} ${input.lastName.trim()}`,
    email: input.email,
    companyName: input.companyName,
    companySize: input.companySize,
    role: input.role,
    brief: input.brief,
    ...(website ? { companyWebsite: website } : {}),
  };
}
