import { InvalidBusinessEmailError } from "../errors/LeadErrors";

/**
 * `inquiries.email` is VARCHAR(191). Past it the write fails at the database, and the
 * sender would see a 503 they cannot act on instead of a message they can.
 */
export const EMAIL_MAX_LENGTH = 191;

/**
 * THE SHAPE OF AN ADDRESS A REPLY CAN BE SENT TO — checked properly, not just "has an @".
 *
 *   local part   letters, digits and . _ % + ' -, with no dot at either end and no two dots
 *                together (jane.doe, o'brien, first+tag)
 *   @            exactly one
 *   domain       one or more dot-separated labels of letters, digits and inner hyphens
 *   TLD          two or more letters (.com, .co.uk, .studio), or an xn-- internationalised one
 *
 * So "shaf#gmail.com", "shaf@gmail", "shaf@@gmail.com", "shaf@gmail..com" and
 * "shaf @gmail.com" are all refused. Deliberately narrower than RFC 5322, which admits
 * quoted local parts and IP-literal domains that no one types into a contact form and that
 * mail providers would bounce anyway.
 */
const EMAIL_PATTERN =
  /^[a-z0-9_%+'-]+(?:\.[a-z0-9_%+'-]+)*@(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:[a-z]{2,63}|xn--[a-z0-9-]{2,59})$/;

/**
 * Misspellings of the providers people actually use, and what they meant. Every one of
 * these is well-formed, so the pattern cannot catch it — and every one of them means the
 * acknowledgement bounces and the studio's reply never arrives. Offering the fix costs the
 * sender one click; not offering it costs the enquiry.
 */
const LIKELY_TYPOS: Readonly<Record<string, string>> = {
  "gmai.com": "gmail.com",
  "gmial.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.cm": "gmail.com",
  "gmail.om": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "hotmail.co": "hotmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "outlok.com": "outlook.com",
  "outloo.com": "outlook.com",
  "iclod.com": "icloud.com",
  "icoud.com": "icloud.com",
};

/**
 * THE ADDRESS AN ENQUIRY CAN BE ANSWERED AT. Any well-formed address, personal ones included.
 *
 * It used to refuse gmail.com, outlook.com and a dozen other consumer providers, on the
 * theory that a brief worth taking arrives from a company domain. The studio would rather
 * hear from a founder writing from Gmail than not hear from them, so what is checked now is
 * only whether a reply could reach the address. The name stays for the call sites.
 */
export class BusinessEmail {
  private constructor(
    readonly value: string,
    readonly domain: string,
  ) {}

  static create(value: string): BusinessEmail {
    const trimmed = value.trim().toLowerCase();
    if (trimmed.length > EMAIL_MAX_LENGTH) {
      throw new InvalidBusinessEmailError(
        `address exceeds ${EMAIL_MAX_LENGTH} characters.`,
        "too-long",
      );
    }
    if (!EMAIL_PATTERN.test(trimmed)) {
      throw new InvalidBusinessEmailError(`"${value}" is not a valid email address.`);
    }

    const at = trimmed.lastIndexOf("@");
    const local = trimmed.slice(0, at);
    const domain = trimmed.slice(at + 1);
    const corrected = correctedDomain(domain);
    if (corrected !== undefined) {
      throw new InvalidBusinessEmailError(
        `"${domain}" looks like a misspelling of ${corrected}.`,
        "likely-typo",
        `${local}@${corrected}`,
      );
    }
    return new BusinessEmail(trimmed, domain);
  }

  toString(): string {
    return this.value;
  }
}

/** A known misspelling's fix, or ".con" — which is not a TLD — as ".com". */
function correctedDomain(domain: string): string | undefined {
  const known = LIKELY_TYPOS[domain];
  if (known !== undefined) return known;
  return domain.endsWith(".con") ? `${domain.slice(0, -".con".length)}.com` : undefined;
}
