import { InvalidFullNameError } from "../errors/LeadErrors";

const MAX_LENGTH = 100;

export class FullName {
  private constructor(readonly value: string) {}

  static create(value: string): FullName {
    const trimmed = value.trim().replace(/\s+/g, " ");
    if (!trimmed) {
      throw new InvalidFullNameError("name cannot be empty.");
    }
    if (trimmed.length > MAX_LENGTH) {
      throw new InvalidFullNameError(`name exceeds ${MAX_LENGTH} characters.`);
    }
    if (!trimmed.includes(" ")) {
      throw new InvalidFullNameError("a first and last name are both required.");
    }
    return new FullName(trimmed);
  }

  toString(): string {
    return this.value;
  }
}
