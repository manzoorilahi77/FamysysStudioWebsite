import { InvalidBusinessEmailError } from "../../domain/lead/errors/LeadErrors";
import { BusinessEmail } from "../../domain/lead/value-objects/BusinessEmail";
import { emailErrorMessage } from "./DemoRequestFieldErrors";
import type { SubmitDemoRequestInput } from "./SubmitDemoRequest";

/**
 * THE FIVE FIELDS BOTH FORMS ASK, exactly as typed — raw strings, nothing coerced.
 *
 * It was eight, and /contact asked all of them while the homepage's closing form asked
 * four. The two forms are the same five questions now: who you are, how to reach you, who
 * you work for, how big they are, and what you are trying to make. First and last name
 * were one question split into two so the form could say which half was missing, which
 * stops being worth anything once neither half is required; `companyWebsite` and `role`
 * are simply no longer asked.
 */
export interface ContactRequestInput {
  readonly fullName: string;
  readonly email: string;
  readonly companyName: string;
  readonly companySize: string;
  readonly brief: string;
}

export type ContactField = keyof ContactRequestInput;

export type ContactFieldErrors = Partial<Record<ContactField, string>>;

/**
 * The order the fields appear in the form. Focus moves to the first invalid field on a
 * failed submit, and "first" has to mean first on the page rather than first in whatever
 * order an object's keys happen to enumerate. Reused by the forms to walk their errors and
 * to render their rows, so the two cannot disagree about the order.
 */
export const CONTACT_FIELD_ORDER: ReadonlyArray<ContactField> = [
  "fullName",
  "email",
  "companyName",
  "companySize",
  "brief",
];

/** The only field a sender has to answer, and so the only one either form can complain about. */
export const REQUIRED_FIELD: ContactField = "email";

const REQUIRED_MESSAGE = "Enter an email address so we can reply";

/**
 * ONE FIELD IS CHECKED, AND IT IS THE ONLY ONE THAT HAS TO BE.
 *
 * This used to report on all eight — three "Required" messages for empty text fields, two
 * for unchosen selects, one for the brief, and format checks on the email and the website.
 * The form asked a lot before it would take anything, and every one of those messages was
 * a reason for someone with a real project to close the tab.
 *
 * An email address is different in kind from the rest: without it the enquiry cannot be
 * answered, so a submission that lacks one is not a lead the studio has to work harder to
 * read — it is a lead that has already been lost. Everything else is worth having and
 * worth nobody's departure, so a blank name, company, size or brief passes here without
 * comment and is stored as NULL.
 *
 * ANY WELL-FORMED ADDRESS IS ACCEPTED, personal ones included. The free-mail rule that
 * refused gmail.com, outlook.com and the rest is gone: the studio would rather hear from
 * someone at a personal address than not hear from them. See `BusinessEmail`.
 *
 * This is the CLIENT-side pass. The route still runs `SubmitDemoRequest`, which stays the
 * authority — this exists so the sender gets the message without a round trip, not so the
 * server can trust the browser.
 */
export function validateContactRequest(input: ContactRequestInput): ContactFieldErrors {
  return emailError(input.email);
}

function emailError(value: string): ContactFieldErrors {
  if (!value.trim()) {
    return { email: REQUIRED_MESSAGE };
  }
  try {
    BusinessEmail.create(value);
    return {};
  } catch (error) {
    if (error instanceof InvalidBusinessEmailError) {
      return { email: emailErrorMessage(error) };
    }
    throw error;
  }
}

/**
 * The form's five answers as the use case's input.
 *
 * Every optional field is OMITTED rather than sent empty. `undefined` is a question the
 * sender left alone and "" would be an answer of nothing, and that distinction is what
 * decides whether the row stores NULL or a blank string — see `DbLeadRepository`.
 */
export function toSubmitDemoRequestInput(input: ContactRequestInput): SubmitDemoRequestInput {
  return {
    email: input.email,
    ...present("fullName", input.fullName),
    ...present("companyName", input.companyName),
    ...present("companySize", input.companySize),
    ...present("brief", input.brief),
  };
}

function present(key: string, value: string): Record<string, string> {
  const trimmed = value.trim();
  return trimmed ? { [key]: trimmed } : {};
}
