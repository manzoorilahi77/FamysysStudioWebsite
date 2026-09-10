"use client";

import { useCallback, useRef, useState } from "react";
import { ACCEPTED_EXTENSIONS } from "../../../application/cms/mediaTypes";
import type { CmsMedia } from "../../../domain/cms/entities/CmsRecord";
import { FRAME_OFFSETS, grabPosterFrame, isVideoFile } from "../lib/posterFrame";
import { ValueField } from "./ValueField";

/**
 * THE ACTUAL PICTURE, NOT ITS FILE NAME.
 *
 * Alt text is a description of something, and an editor cannot write one from
 * `service-hero-band.jpg`. So the file is rendered beside the field — the real image at the
 * real aspect ratio, or the video with its poster frame — and the alt text is edited next
 * to the thing it describes.
 *
 * A plain `<img>`, deliberately, not `next/image`: the optimiser is switched off for this
 * project (see next.config.ts) and these are thumbnails in a private tool, not page content.
 *
 * THE PREVIEW FOLLOWS THE DRAFT. Once a new file is chosen the panel shows THAT file, not
 * the one the site is serving, because the question in front of the editor is "is this the
 * right picture" and the old one cannot answer it. What the site still shows is named
 * underneath in words instead — the same shape as every text field on this screen, which
 * puts the draft in the box and the published value beside it.
 *
 * REPLACING IS AN UPLOAD, THEN AN EDIT, AND THEY ARE NOT THE SAME EVENT. The upload writes a
 * file and hands back a path; the path then sits in this field as an unsaved change like any
 * other. Nothing on the site moves until Save and then Publish. This is why the status line
 * says the site has not changed yet: an editor who uploads, sees the new picture appear, and
 * walks away has changed nothing, and needs to know that before they walk away.
 *
 * A VIDEO IS TWO UPLOADS AND ONE DECISION. `MediaRef` refuses a video with no poster still,
 * so choosing a video takes a frame out of it in this browser, uploads that as well, and
 * sets both fields together. If the still cannot be taken the whole replacement is refused
 * rather than half-applied: a video saved without its poster is a record the site would
 * throw on.
 *
 * THE PATH IS NOT TYPEABLE. There is no text box for it, and that is a deliberate omission
 * rather than a missing feature: a hand-typed path is a 404 that looks exactly like a
 * working field until someone loads the page. The only ways to set it are to upload a file
 * or to undo back to the published one.
 */

const ACCEPT = ACCEPTED_EXTENSIONS.map((extension) => `.${extension}`).join(",");

const BUTTON =
  "text-small inline-flex min-h-11 items-center justify-center rounded-sm px-4 py-2 transition-colors duration-[180ms] disabled:cursor-default";
const SECONDARY = `${BUTTON} border border-ink-12 text-ink hover:bg-ink-4 disabled:text-ink-40`;
const QUIET =
  "text-small inline-flex min-h-11 items-center px-2 py-2 text-graphite-70 transition-colors duration-[180ms] hover:text-accent disabled:text-ink-40";

interface MediaFieldProps {
  readonly media: CmsMedia;
  readonly altDraft: string;
  readonly altError: string | undefined;
  readonly isAltChanged: boolean;
  readonly onAltChange: (next: string) => void;
  /** The file's value in the form: an upload's path, the saved draft, or the published one. */
  readonly srcDraft: string;
  readonly srcError: string | undefined;
  readonly isSrcChanged: boolean;
  readonly onSrcChange: (next: string) => void;
  readonly posterDraft: string;
  readonly posterError: string | undefined;
  readonly onPosterChange: (next: string) => void;
}

type Upload =
  | { readonly kind: "idle" }
  | { readonly kind: "sending"; readonly message: string }
  | { readonly kind: "failed"; readonly message: string }
  | { readonly kind: "reused" };

type Sent =
  { readonly path: string; readonly wasAlreadyStored: boolean } | { readonly error: string };

async function put(blob: Blob, name: string): Promise<Sent> {
  const body = new FormData();
  body.append("file", blob, name);

  const response = await fetch("/admin/api/media", { method: "POST", body }).catch(() => null);
  const result = (await response?.json().catch(() => null)) as {
    path?: string;
    message?: string;
    wasAlreadyStored?: boolean;
  } | null;

  if (!response?.ok || typeof result?.path !== "string") {
    return { error: result?.message ?? "That file could not be uploaded." };
  }
  return { path: result.path, wasAlreadyStored: result.wasAlreadyStored === true };
}

const NO_STILL =
  "A still could not be taken from that video, so it was not used. A video needs a poster frame, and this browser could not decode one — try re-encoding it as MP4 (H.264) or WebM.";

export function MediaField({
  media,
  altDraft,
  altError,
  isAltChanged,
  onAltChange,
  srcDraft,
  srcError,
  isSrcChanged,
  onSrcChange,
  posterDraft,
  posterError,
  onPosterChange,
}: MediaFieldProps) {
  // Unique per media block: a section can carry several, and two of them sharing an id
  // would point every button at the first one's message.
  const fieldId = `media-${media.id}`;
  const picker = useRef<HTMLInputElement>(null);
  const [upload, setUpload] = useState<Upload>({ kind: "idle" });
  // Kept so "use a different frame" can go back to the same file rather than asking for it
  // again. Dropped the moment an image is chosen, because there is then nothing to grab from.
  const [chosenVideo, setChosenVideo] = useState<File | null>(null);
  const [frame, setFrame] = useState(0);

  const canReplace = media.src !== undefined && media.src.readOnlyReason === undefined;
  const shown = isSrcChanged ? srcDraft : media.path;
  // What is ON SCREEN decides the element, not what the record stores: a slot holding a JPEG
  // today shows a video the moment one is chosen for it.
  const showingVideo = isSrcChanged ? isVideoPath(srcDraft) : media.kind === "video";
  const shownPoster = isSrcChanged ? posterDraft : media.poster;

  const choose = useCallback(() => {
    setUpload({ kind: "idle" });
    picker.current?.click();
  }, []);

  const send = useCallback(
    async (file: File) => {
      if (isVideoFile(file)) {
        // The still is taken FIRST. If it cannot be, nothing is uploaded at all — an
        // uploaded video with no poster would be an orphaned file and a rejected save.
        setUpload({ kind: "sending", message: "Taking a still…" });
        const still = await grabPosterFrame(file, 0);
        if (!still) {
          setUpload({ kind: "failed", message: NO_STILL });
          return;
        }

        setUpload({ kind: "sending", message: "Uploading the video…" });
        const video = await put(file, file.name);
        if ("error" in video) {
          setUpload({ kind: "failed", message: video.error });
          return;
        }

        setUpload({ kind: "sending", message: "Uploading the still…" });
        const poster = await put(still, "poster.jpg");
        if ("error" in poster) {
          setUpload({ kind: "failed", message: poster.error });
          return;
        }

        onSrcChange(video.path);
        onPosterChange(poster.path);
        setChosenVideo(file);
        setFrame(0);
        setUpload(video.wasAlreadyStored ? { kind: "reused" } : { kind: "idle" });
        return;
      }

      setUpload({ kind: "sending", message: "Uploading…" });
      const image = await put(file, file.name);
      if ("error" in image) {
        setUpload({ kind: "failed", message: image.error });
        return;
      }

      onSrcChange(image.path);
      // An image slot has no still, and leaving the old video's poster behind would make the
      // record describe a file that is no longer there.
      if (posterDraft) onPosterChange("");
      setChosenVideo(null);
      setUpload(image.wasAlreadyStored ? { kind: "reused" } : { kind: "idle" });
    },
    [onPosterChange, onSrcChange, posterDraft],
  );

  const differentFrame = useCallback(async () => {
    if (!chosenVideo) return;
    const next = frame + 1;

    setUpload({ kind: "sending", message: "Taking another still…" });
    const still = await grabPosterFrame(chosenVideo, next);
    if (!still) {
      setUpload({ kind: "failed", message: NO_STILL });
      return;
    }
    const poster = await put(still, "poster.jpg");
    if ("error" in poster) {
      setUpload({ kind: "failed", message: poster.error });
      return;
    }

    onPosterChange(poster.path);
    setFrame(next);
    setUpload({ kind: "idle" });
  }, [chosenVideo, frame, onPosterChange]);

  const onPicked = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      // Cleared so choosing the SAME file twice fires `change` again — the second attempt
      // after a failure is the case that matters.
      event.target.value = "";
      if (file) void send(file);
    },
    [send],
  );

  const undo = useCallback(() => {
    setUpload({ kind: "idle" });
    setChosenVideo(null);
    onSrcChange(media.path);
    onPosterChange(media.poster ?? "");
  }, [media.path, media.poster, onPosterChange, onSrcChange]);

  const busy = upload.kind === "sending";

  return (
    <div className="grid gap-5 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
      <figure className="m-0">
        <div className="overflow-hidden rounded-sm border border-ink-12 bg-canvas">
          {showingVideo ? (
            <video
              // Keyed on the path so a replacement actually reloads: React keeps the same
              // element otherwise, and the browser keeps the old first frame with it.
              key={`${shown}|${shownPoster ?? ""}`}
              src={shown}
              {...(shownPoster ? { poster: shownPoster } : {})}
              controls
              muted
              playsInline
              preload="metadata"
              className="block h-auto w-full"
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img key={shown} src={shown} alt="" className="block h-auto w-full" />
          )}
        </div>
        <figcaption className="text-small mt-2 break-words text-ink-40">
          {media.label} · {showingVideo ? "video" : "image"} · {media.aspectRatio}
          <br />
          <span className={isSrcChanged ? "text-accent" : "text-graphite-70"}>{shown}</span>
        </figcaption>
      </figure>

      <div>
        {canReplace ? (
          <div className="mb-6">
            <p className="label text-ink-60">File</p>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={choose}
                disabled={busy}
                aria-describedby={`${fieldId}-upload`}
                className={SECONDARY}
              >
                {busy ? "Working…" : "Replace file"}
              </button>
              {/* Only while a video is in hand. The frame comes out of the FILE, so once the
                  page has been reloaded there is nothing left in the browser to re-grab from
                  and the button would have to fail. */}
              {chosenVideo ? (
                <button
                  type="button"
                  onClick={() => void differentFrame()}
                  disabled={busy}
                  className={QUIET}
                >
                  Use a different still ({(frame % FRAME_OFFSETS.length) + 1} of{" "}
                  {FRAME_OFFSETS.length})
                </button>
              ) : null}
              {isSrcChanged ? (
                <button type="button" onClick={undo} disabled={busy} className={QUIET}>
                  Undo
                </button>
              ) : null}
              {/* `hidden`, not `sr-only`. Screen-reader-only would mean "hidden from the
                  eye, offered to assistive technology" — and what it would offer is a
                  nameless file input sitting beside the button that operates it, which Tab
                  never reaches. Two ways to the same thing, one of them unreachable. It is
                  the button's mechanism, so it is hidden from everyone; the file dialog is
                  opened by the button, which has a name and is a tab stop. */}
              <input
                ref={picker}
                type="file"
                accept={ACCEPT}
                onChange={onPicked}
                className="hidden"
              />
            </div>

            {/* One line, in the same place whatever happened — the same rule the section
                bar follows.

                `aria-live` WITHOUT `role="status"`, deliberately. The section has one
                status line, for what Save, Publish and Discard did; this is a message about
                one field, and a second element claiming the same role would give the screen
                a second "the status" for a reader to find and no way to tell which is which.
                `aria-live` still announces it, and `aria-describedby` on the button that
                caused it is what says whose message it is. */}
            <p
              id={`${fieldId}-upload`}
              aria-live="polite"
              className={`text-small mt-3 max-w-[70ch] ${
                upload.kind === "failed" || srcError || posterError
                  ? "text-accent"
                  : "text-graphite-70"
              }`}
            >
              {srcError ??
                posterError ??
                (upload.kind === "failed"
                  ? upload.message
                  : upload.kind === "sending"
                    ? upload.message
                    : upload.kind === "reused"
                      ? "That file was already on the server, so it was reused rather than copied. The path is unchanged."
                      : isSrcChanged
                        ? `Not saved, and not live. The site is still showing ${media.path}. Save the draft, then Publish.`
                        : "Uploading a file does not change the site — it becomes an unsaved edit here, like any other.")}
            </p>
          </div>
        ) : (
          <p className="text-small mb-6 max-w-[70ch] text-ink-40">
            {media.src?.readOnlyReason ??
              "The file cannot be changed here. The alt text is the part that is copy."}
          </p>
        )}

        <ValueField
          value={media.alt}
          draft={altDraft}
          error={altError}
          isChanged={isAltChanged}
          onChange={onAltChange}
        />
      </div>
    </div>
  );
}

function isVideoPath(path: string): boolean {
  return /\.(mp4|webm|mov|m4v)$/i.test(path);
}
