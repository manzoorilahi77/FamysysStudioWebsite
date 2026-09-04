import type { CmsValue } from "../../domain/cms/entities/CmsRecord";
import { DomainError } from "../../domain/shared/errors/DomainError";
import { CtaLabel } from "../../domain/shared/value-objects/CtaLabel";
import { MediaRef } from "../../domain/shared/value-objects/MediaRef";
import { Url } from "../../domain/shared/value-objects/Url";

/**
 * AN EDIT IS REJECTED BY THE SITE'S OWN RULES, NOT BY A SECOND SET WRITTEN FOR THE ADMIN.
 *
 * Every kind here runs the value object the content file itself would run at build time:
 * a CTA label through `CtaLabel`, a link through `Url`, alt text through `MediaRef`. That
 * matters more than it sounds — a 41-character CTA label saved past a laxer admin check
 * would write a file that throws the moment the dev server reloads it, and the editor
 * would see a broken site rather than a rejected field.
 *
 * The one rule that is NOT a value object is the line-break rule. Content strings are
 * single-line by construction, and a textarea makes it easy to press Return in one; the
 * escape would be written faithfully as `\n` and then render as a space. Rejecting is
 * honest, silently stripping is not.
 */

const NO_LINE_BREAKS = "Line breaks are not supported here — this is a single-line string.";
const EMPTY = "This cannot be empty.";

/** Aspect ratio is not editable, so any valid one exercises the rule that matters: alt is required. */
const ALT_CHECK_ASPECT_RATIO = "4:3" as const;

export interface ValidationFailure {
  readonly valueId: string;
  readonly message: string;
}

function messageFor(error: unknown): string {
  if (error instanceof DomainError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "This value was rejected.";
}

/** `null` when the value is acceptable, otherwise the message to put under the field. */
export function validateContentValue(
  target: CmsValue,
  candidate: string,
  mediaPath: string | undefined,
): string | null {
  if (/[\r\n]/.test(candidate)) {
    return NO_LINE_BREAKS;
  }
  if (candidate.trim().length === 0) {
    return EMPTY;
  }

  try {
    switch (target.kind) {
      case "ctaLabel":
        CtaLabel.create(candidate);
        return null;
      case "url":
        Url.create(candidate);
        return null;
      case "mediaAlt":
        MediaRef.create({
          kind: "image",
          src: mediaPath ?? "/media/placeholder.jpg",
          alt: candidate,
          aspectRatio: ALT_CHECK_ASPECT_RATIO,
        });
        return null;
      case "text":
        return null;
    }
  } catch (error: unknown) {
    return messageFor(error);
  }
}
