import type { CmsMedia } from "../../../domain/cms/entities/CmsRecord";
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
 * The FILE cannot be changed here and the panel says so rather than offering a control that
 * does nothing. Swapping an image means uploading one, and there is no upload yet.
 */
export function MediaField({
  media,
  draft,
  error,
  isChanged,
  onChange,
}: {
  readonly media: CmsMedia;
  readonly draft: string;
  readonly error: string | undefined;
  readonly isChanged: boolean;
  readonly onChange: (next: string) => void;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
      <figure className="m-0">
        <div className="overflow-hidden rounded-sm border border-ink-12 bg-canvas">
          {media.kind === "video" ? (
            <video
              src={media.path}
              poster={media.poster}
              controls
              muted
              playsInline
              preload="metadata"
              className="block h-auto w-full"
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={media.path} alt="" className="block h-auto w-full" />
          )}
        </div>
        <figcaption className="text-small mt-2 break-words text-ink-40">
          {media.label} · {media.kind} · {media.aspectRatio}
          <br />
          <span className="text-graphite-70">{media.path}</span>
        </figcaption>
      </figure>

      <div>
        <ValueField
          value={media.alt}
          draft={draft}
          error={error}
          isChanged={isChanged}
          onChange={onChange}
        />
        <p className="text-small mt-2 text-ink-40">
          The file itself cannot be changed here — replacing an image means uploading one, and
          there is no upload in this panel yet. The alt text is the part that is copy.
        </p>
      </div>
    </div>
  );
}
