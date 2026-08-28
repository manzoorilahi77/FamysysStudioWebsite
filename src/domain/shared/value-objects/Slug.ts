import { InvalidSlugError } from "../errors/ValueObjectErrors";

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export class Slug {
  private constructor(readonly value: string) {}

  static create(value: string): Slug {
    if (!SLUG_PATTERN.test(value)) {
      throw new InvalidSlugError(value);
    }
    return new Slug(value);
  }

  equals(other: Slug): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
