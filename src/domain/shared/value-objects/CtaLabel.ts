import { InvalidCtaLabelError } from "../errors/ValueObjectErrors";

const MAX_LENGTH = 40;

export class CtaLabel {
  private constructor(readonly value: string) {}

  static create(value: string): CtaLabel {
    const trimmed = value.trim();
    if (!trimmed) {
      throw new InvalidCtaLabelError("label cannot be empty.");
    }
    if (trimmed.length > MAX_LENGTH) {
      throw new InvalidCtaLabelError(`label exceeds ${MAX_LENGTH} characters.`);
    }
    return new CtaLabel(trimmed);
  }

  toString(): string {
    return this.value;
  }
}
