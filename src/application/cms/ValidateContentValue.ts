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

/**
 * WHERE A MEDIA FILE IS ALLOWED TO BE.
 *
 * `Url` alone would accept `https://someone-elses-cdn.example/tracker.gif` and
 * `/etc/passwd` — both are well-formed, and neither is a file this site serves. The site
 * serves `public/media`, the uploader writes there and nowhere else, and a path that does
 * not start `/media/` is either a mistake or an attempt, so it is refused either way.
 *
 * A traversal check on top, because `/media/../../secret` starts with `/media/` and is not
 * under it.
 */
const MEDIA_ROOT = "/media/";
const MEDIA_PATH_MESSAGE =
  'A media file has to be a path under "/media/" — the folder this site serves its own files from.';

/** Alt text is checked against an image; a file path is checked against whatever it is. */
function kindForExtension(path: string): "image" | "video" {
  return /\.(mp4|webm|mov|m4v)$/i.test(path) ? "video" : "image";
}

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

/**
 * WHAT ELSE IS ON THE MEDIA BLOCK THIS VALUE BELONGS TO — as it will be AFTER this save,
 * not as it is stored now.
 *
 * A video and its poster are one decision made in two fields, and neither can be judged
 * alone: a video path is invalid without a still, and clearing a still is invalid while the
 * file is a video. Validating against what is stored would then reject the only save that
 * could ever be legal — the one that sets both at once.
 */
export interface MediaContext {
  /** The picture an alt text describes. */
  readonly path?: string;
  /** The file this block will hold, when validating its poster. */
  readonly src?: string;
  /** The still this block will hold, when validating its file. */
  readonly poster?: string;
}

/** `null` when the value is acceptable, otherwise the message to put under the field. */
export function validateContentValue(
  target: CmsValue,
  candidate: string,
  media: MediaContext = {},
): string | null {
  if (/[\r\n]/.test(candidate)) {
    return NO_LINE_BREAKS;
  }
  // Every other kind is copy or a link, and an empty one of those is a mistake. A poster is
  // the exception: an image slot has no still, and a field nobody can fill would be a form
  // that cannot be saved.
  if (candidate.trim().length === 0 && target.kind !== "mediaPoster") {
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
      case "mediaSrc": {
        const badPath = mediaPathProblem(candidate);
        if (badPath) return badPath;

        // Through `MediaRef` rather than `Url` alone, so the file is judged by the rule the
        // site builds the reference with — which is where "a video needs a poster" lives.
        const kind = kindForExtension(candidate);
        MediaRef.create({
          kind,
          src: candidate,
          alt: "checked separately",
          aspectRatio: ALT_CHECK_ASPECT_RATIO,
          ...(kind === "video" && media.poster ? { poster: media.poster } : {}),
        });
        return null;
      }
      case "mediaPoster": {
        const stillNeeded = media.src !== undefined && kindForExtension(media.src) === "video";
        if (candidate.trim().length === 0) {
          return stillNeeded
            ? "This slot holds a video, and a video needs a poster still. Replace the file with an image to clear it."
            : null;
        }
        const badPath = mediaPathProblem(candidate);
        if (badPath) return badPath;
        if (kindForExtension(candidate) === "video") {
          return "A poster is the still shown before a video plays, so it has to be an image.";
        }
        Url.create(candidate);
        return null;
      }
      case "mediaAlt":
        MediaRef.create({
          kind: "image",
          src: media.path ?? "/media/placeholder.jpg",
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

function mediaPathProblem(candidate: string): string | null {
  return !candidate.startsWith(MEDIA_ROOT) || candidate.includes("..") ? MEDIA_PATH_MESSAGE : null;
}
