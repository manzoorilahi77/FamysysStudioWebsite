import { DomainError } from "../errors/DomainError";

export class InvalidWebsiteOriginError extends DomainError {
  readonly code = "INVALID_WEBSITE_ORIGIN";

  constructor(value: string, allowedOrigins: ReadonlyArray<string>) {
    super(
      `"${value}" is not on the list of sites this deck is allowed to display live. It has ` +
        `to be the exact address of one of: ${allowedOrigins.join(", ")}. Anything else ` +
        "would save here but show as a blank frame on the live page, so it is refused now " +
        "instead — use a screenshot image for a site that isn't on this list, or ask a " +
        "developer to add its origin to the allowlist.",
    );
  }
}

export class AllowedWebsiteUrl {
  private constructor(private readonly value: string) {}

  static create(value: string, allowedOrigins: ReadonlyArray<string>): AllowedWebsiteUrl {
    const trimmed = value.trim();
    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      throw new InvalidWebsiteOriginError(value, allowedOrigins);
    }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new InvalidWebsiteOriginError(value, allowedOrigins);
    }
    if (!allowedOrigins.includes(parsed.origin)) {
      throw new InvalidWebsiteOriginError(value, allowedOrigins);
    }
    return new AllowedWebsiteUrl(trimmed);
  }

  toString(): string {
    return this.value;
  }
}
