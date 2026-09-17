import { DomainError } from "../errors/DomainError";
import { DECK_PREVIEW_ORIGINS } from "../../../shared/site/deckPreviewOrigins";

export class InvalidWebsiteOriginError extends DomainError {
  readonly code = "INVALID_WEBSITE_ORIGIN";

  constructor(value: string) {
    super(
      `"${value}" is not on the list of sites this deck is allowed to display live. It has ` +
        `to be the exact address of one of: ${DECK_PREVIEW_ORIGINS.join(", ")}. Anything else ` +
        "would save here but show as a blank frame on the live page, so it is refused now " +
        "instead — use a screenshot image for a site that isn't on this list, or ask a " +
        "developer to add its origin to the allowlist.",
    );
  }
}

export class AllowedWebsiteUrl {
  private constructor(private readonly value: string) {}

  static create(value: string): AllowedWebsiteUrl {
    const trimmed = value.trim();
    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      throw new InvalidWebsiteOriginError(value);
    }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new InvalidWebsiteOriginError(value);
    }
    if (!DECK_PREVIEW_ORIGINS.includes(parsed.origin)) {
      throw new InvalidWebsiteOriginError(value);
    }
    return new AllowedWebsiteUrl(trimmed);
  }

  toString(): string {
    return this.value;
  }
}
