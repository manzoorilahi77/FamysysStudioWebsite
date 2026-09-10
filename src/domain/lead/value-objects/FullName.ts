import { InvalidFullNameError } from "../errors/LeadErrors";

const MAX_LENGTH = 100;

/**
 * A name as the sender typed it, with runs of whitespace collapsed.
 *
 * IT NO LONGER INSISTS ON TWO WORDS. The rule used to be "a first and last name are both
 * required", which rejected mononyms — a real naming convention for a large part of the
 * world — and, more mundanely, anyone who types the name their colleagues use. The name is
 * an optional field now (see `DemoRequest`), and a form that refuses to accept an answer
 * it did not have to ask for is the worst of both.
 *
 * THE CEILING STAYS, and it is not a judgement about the answer. `inquiries.full_name` is
 * VARCHAR(191); a value longer than the column is a write that fails at the database with
 * a 503 rather than a message the sender can act on. 100 is the narrower of the two and
 * comfortably past any real name.
 *
 * Never constructed from an empty string: callers drop a blank answer before they get
 * here, so an empty value reaching this is a bug rather than a sender's choice, and it
 * throws to say so.
 */
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
    return new FullName(trimmed);
  }

  toString(): string {
    return this.value;
  }
}
