import { DomainError } from "./DomainError";

export class InvalidSlugError extends DomainError {
  readonly code = "INVALID_SLUG";

  constructor(value: string) {
    super(`"${value}" is not a valid slug — use lowercase letters, digits, and hyphens only.`);
  }
}

export class InvalidUrlError extends DomainError {
  readonly code = "INVALID_URL";

  constructor(value: string) {
    super(`"${value}" is not a valid URL — expected an absolute URL or a root-relative path.`);
  }
}

export class InvalidHexColorError extends DomainError {
  readonly code = "INVALID_HEX_COLOR";

  constructor(value: string) {
    super(`"${value}" is not a valid hex color — expected #RGB, #RRGGBB, or #RRGGBBAA.`);
  }
}

export class InvalidCtaLabelError extends DomainError {
  readonly code = "INVALID_CTA_LABEL";

  constructor(reason: string) {
    super(`Invalid CTA label: ${reason}`);
  }
}

export class InvalidMediaRefError extends DomainError {
  readonly code = "INVALID_MEDIA_REF";

  constructor(reason: string) {
    super(`Invalid media reference: ${reason}`);
  }
}
