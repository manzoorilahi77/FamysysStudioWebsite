import {
  InvalidBusinessEmailError,
  InvalidCompanySizeError,
  InvalidFullNameError,
} from "../../domain/lead/errors/LeadErrors";

export interface DemoRequestFieldErrors {
  readonly fullName?: string;
  readonly email?: string;
  readonly companyName?: string;
  readonly companySize?: string;
}

/** Translates a SubmitDemoRequest validation failure into a field-addressable, user-facing message. */
export function toDemoRequestFieldErrors(error: unknown): DemoRequestFieldErrors | undefined {
  if (error instanceof InvalidFullNameError) {
    return { fullName: "Enter your first and last name." };
  }
  if (error instanceof InvalidBusinessEmailError) {
    return { email: error.message.replace("Invalid business email: ", "") };
  }
  if (error instanceof InvalidCompanySizeError) {
    return { companySize: "Choose a company size from the list." };
  }
  return undefined;
}
