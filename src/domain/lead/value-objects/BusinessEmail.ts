import { InvalidBusinessEmailError } from "../errors/LeadErrors";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FREE_MAIL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "aol.com",
  "icloud.com",
  "protonmail.com",
  "proton.me",
  "gmx.com",
  "mail.com",
  "live.com",
  "yandex.com",
  "zoho.com",
  "hey.com",
  "fastmail.com",
]);

export class BusinessEmail {
  private constructor(
    readonly value: string,
    readonly domain: string,
  ) {}

  static create(value: string): BusinessEmail {
    const trimmed = value.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(trimmed)) {
      throw new InvalidBusinessEmailError(`"${value}" is not a valid email address.`);
    }
    const domain = trimmed.split("@")[1] ?? "";
    if (FREE_MAIL_DOMAINS.has(domain)) {
      throw new InvalidBusinessEmailError(
        `"${domain}" is a free-mail domain — a business email is required.`,
      );
    }
    return new BusinessEmail(trimmed, domain);
  }

  toString(): string {
    return this.value;
  }
}
