import { InvalidUrlError } from "../errors/ValueObjectErrors";

const ROOT_RELATIVE_PATTERN = /^\/[^\s]*$/;

function isAbsoluteUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export class Url {
  private constructor(readonly value: string) {}

  static create(value: string): Url {
    const trimmed = value.trim();
    if (!trimmed || (!isAbsoluteUrl(trimmed) && !ROOT_RELATIVE_PATTERN.test(trimmed))) {
      throw new InvalidUrlError(value);
    }
    return new Url(trimmed);
  }

  get isExternal(): boolean {
    return !this.value.startsWith("/");
  }

  equals(other: Url): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
