import { DomainError } from "../../shared/errors/DomainError";

export class InvalidBusinessEmailError extends DomainError {
  readonly code = "INVALID_BUSINESS_EMAIL";

  constructor(reason: string) {
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
