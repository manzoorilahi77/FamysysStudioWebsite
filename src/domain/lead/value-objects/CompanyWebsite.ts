import { InvalidCompanyWebsiteError } from "../errors/LeadErrors";

const MAX_LENGTH = 2000;
const HOST_PATTERN = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;

/** A scheme written out in full, e.g. `https://` or the typo `htp://`. */
const EXPLICIT_SCHEME = /^([a-z][a-z0-9+.-]*):\/\//i;

/**
 * A colon before any slash that is not introducing a port — `mailto:`, `javascript:`,
 * `data:`. Checked only after `EXPLICIT_SCHEME` has been ruled out, since `https://…`
 * matches this too. The `(?!\d)` is what keeps `acme.com:8080` a host and a port.
 */
const SCHEMELESS_SCHEME = /^[^/]*:(?!\d)/;

/**
 * The contact form's one optional field.
 *
 * Its own value object rather than the shared `Url`: `Url` is the navigation href type
 * and accepts root-relative paths, which is meaningless for a company's website, while
 * accepting any scheme `new URL()` will parse.
 *
 * The rules here are shaped around what people actually type into this box. A scheme is
 * optional and `https://` is assumed when it is missing, because "acme.com" is the normal
 * answer and rejecting it would be the form being pedantic at the sender's expense. What
 * is required is a host with a dot in it, so a bare word is caught. Optionality is the
 * caller's business: an empty field never reaches here.
 *
 * Assuming a scheme is exactly where this can go wrong, and the guards below are the
 * reason the parsing is not a one-liner. `mailto:hi@acme.com` has no `://`, so a naive
 * prefix turns it into `https://mailto:hi@acme.com` — which parses cleanly, with a
 * hostname of `acme.com` and `mailto` / `hi` as credentials. It would have been stored as
 * a valid company website. Anything carrying credentials is refused outright for the same
 * reason.
 */
export class CompanyWebsite {
  private constructor(readonly value: string) {}

  static create(value: string): CompanyWebsite {
    const trimmed = value.trim();
    if (!trimmed || trimmed.length > MAX_LENGTH || /\s/.test(trimmed)) {
      throw reject(value);
    }

    const explicitScheme = EXPLICIT_SCHEME.exec(trimmed)?.[1]?.toLowerCase();
    if (explicitScheme) {
      if (explicitScheme !== "http" && explicitScheme !== "https") {
        throw reject(value);
      }
    } else if (SCHEMELESS_SCHEME.test(trimmed)) {
      throw reject(value);
    }

    const parsed = parse(explicitScheme ? trimmed : `https://${trimmed}`, value);

    if (parsed.username || parsed.password) {
      throw reject(value);
    }
    if (!HOST_PATTERN.test(parsed.hostname)) {
      throw reject(value);
    }

    return new CompanyWebsite(parsed.toString());
  }

  toString(): string {
    return this.value;
  }
}

function parse(candidate: string, original: string): URL {
  try {
    return new URL(candidate);
  } catch {
    throw reject(original);
  }
}

function reject(value: string): InvalidCompanyWebsiteError {
  return new InvalidCompanyWebsiteError(`"${value}" is not a valid website address.`);
}
