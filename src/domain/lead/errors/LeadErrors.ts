import { DomainError } from "../../shared/errors/DomainError";

/**
 * `failure` separates the two failures this error covers, because they need different
 * messages and reading them back off the message string is how that goes wrong. A
 * malformed address is the sender mistyping; a free-mail address is a valid address the
 * studio declines to take a brief at, and its message has to say what to do instead.
 */
export type BusinessEmailFailure = "malformed" | "free-mail";

export class InvalidBusinessEmailError extends DomainError {
  readonly code = "INVALID_BUSINESS_EMAIL";

  constructor(
    reason: string,
    readonly failure: BusinessEmailFailure = "malformed",
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
