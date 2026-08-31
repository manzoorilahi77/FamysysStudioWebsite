import { InvalidProjectBriefError } from "../errors/LeadErrors";

const MIN_LENGTH = 2;
const MAX_LENGTH = 4000;

/**
 * What the sender is trying to create — the one open field on the contact form, and the
 * only one that carries the actual request.
 *
 * The floor is deliberately 2 characters rather than something that tries to judge
 * whether a brief is "good enough". A form that rejects a short answer teaches the sender
 * to pad it, and the studio would rather read two lines that are true than a paragraph
 * written to clear a validator. The ceiling exists to bound the payload, not the thought.
 */
export class ProjectBrief {
  private constructor(readonly value: string) {}

  static create(value: string): ProjectBrief {
    const trimmed = value.trim();
    if (trimmed.length < MIN_LENGTH) {
      throw new InvalidProjectBriefError("tell us what you are trying to create.");
    }
    if (trimmed.length > MAX_LENGTH) {
      throw new InvalidProjectBriefError(`brief exceeds ${MAX_LENGTH} characters.`);
    }
    return new ProjectBrief(trimmed);
  }

  toString(): string {
    return this.value;
  }
}
