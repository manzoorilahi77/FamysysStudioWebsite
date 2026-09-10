import { DomainError } from "../../shared/errors/DomainError";

/**
 * `failure` separates the ways an address can be refused, because each needs its own
 * message and reading them back off the message string is how that goes wrong. Personal
 * providers are NOT among them — gmail.com and the rest are accepted, see `BusinessEmail`.
 *
 *   malformed    not the shape of an address: no @, no dot in the domain, a space
 *   too-long     longer than the column it is stored in
 *   likely-typo  well-formed, but at a misspelling of a common provider (gmai.com);
 *                `suggestion` carries the corrected address to offer back
 */
export type BusinessEmailFailure = "malformed" | "too-long" | "likely-typo";

export class InvalidBusinessEmailError extends DomainError {
  readonly code = "INVALID_BUSINESS_EMAIL";

  constructor(
    reason: string,
    readonly failure: BusinessEmailFailure = "malformed",
    readonly suggestion: string | undefined = undefined,
  ) {
    super(`Invalid business email: ${reason}`);
  }
}

export class InvalidCompanySizeError extends DomainError {
  readonly code = "INVALID_COMPANY_SIZE";

  constructor(value: string) {
    super(`"${value}" is not a recognized company size band.`);
  }
}

export class InvalidFullNameError extends DomainError {
  readonly code = "INVALID_FULL_NAME";

  constructor(reason: string) {
    super(`Invalid full name: ${reason}`);
  }
}

export class InvalidDemoRequestError extends DomainError {
  readonly code = "INVALID_DEMO_REQUEST";

  constructor(reason: string) {
    super(`Invalid demo request: ${reason}`);
  }
}

export class InvalidContactRoleError extends DomainError {
  readonly code = "INVALID_CONTACT_ROLE";

  constructor(value: string) {
    super(`"${value}" is not a recognized role.`);
  }
}

export class InvalidProjectBriefError extends DomainError {
  readonly code = "INVALID_PROJECT_BRIEF";

  constructor(reason: string) {
    super(`Invalid project brief: ${reason}`);
  }
}

export class InvalidCompanyWebsiteError extends DomainError {
  readonly code = "INVALID_COMPANY_WEBSITE";

  constructor(reason: string) {
    super(`Invalid company website: ${reason}`);
  }
}
