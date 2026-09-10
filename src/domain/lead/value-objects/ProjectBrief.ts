import { InvalidProjectBriefError } from "../errors/LeadErrors";

const MAX_LENGTH = 4000;

/**
 * What the sender is trying to create — the one open field on both forms, and the only one
 * that carries the actual request.
 *
 * THERE IS NO FLOOR ANY MORE. It was two characters, which was already deliberately low
 * rather than an attempt to judge whether a brief was "good enough" — but the field is
 * optional now, and a one-character answer is a sender who typed something rather than a
 * sender who typed nothing. Blank answers never reach here; callers drop them first.
 *
 * The ceiling bounds the payload, not the thought: `inquiries.project_brief` is TEXT, so
 * 4000 characters is a cap on what an automated poster can push through the endpoint, not
 * a limit anyone writing in good faith will meet.
 */
export class ProjectBrief {
  private constructor(readonly value: string) {}

  static create(value: string): ProjectBrief {
    const trimmed = value.trim();
    if (!trimmed) {
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
