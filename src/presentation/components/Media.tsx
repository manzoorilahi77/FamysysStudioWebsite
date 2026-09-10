import Image from "next/image";
import type { MediaView } from "../lib/viewModels";
import { AutoplayVideo } from "./AutoplayVideo";

/**
 * ONE PLACE THE SITE DECIDES WHETHER A SLOT IS A PICTURE OR A FILM.
 *
 * Every media slot used to call `next/image` directly — fifteen of them, across the tiles,
 * the bands, the frames and the covers — and not one branched on `media.kind`. `MediaView`
 * has carried `kind` and `poster` the whole time and nothing read them, so a video in the
 * content would have been handed to an `<img>`: a broken image where a photograph was.
 *
 * That was harmless while every record held a JPEG. It stops being harmless the moment the
 * panel can upload something else, which is what this component is for. The decision now
 * lives in one file, so "can this slot take a video" has one answer for the whole site
 * rather than fifteen answers nobody has checked.
 *
 * THE SLOT KEEPS ITS OWN SIZING. `width`, `height`, `sizes` and `className` pass straight
 * through, because the tile decides its shape and this component decides only what goes
 * inside it. Nothing here knows what a work tile looks like, and it should not.
 *
 * A SERVER COMPONENT, so the common case — an image — ships no JavaScript at all. Only the
 * video branch pulls in a client component, and only on a page that actually holds one.
 *
 * `width` and `height` are passed on the video path too. A `<video>` does not use them the
 * way an `<img>` does, but they are what the aspect-ratio boxes around these slots reserve
 * space against, and dropping them would trade a video for a layout shift.
 */
export function Media({
  media,
  width,
  height,
  sizes,
  priority = false,
  loading,
  decorative = false,
  className = "",
  dataAttribute,
}: {
  readonly media: MediaView;
  readonly width: number;
  readonly height: number;
  readonly sizes?: string;
  /**
   * Adds `<link rel="preload">`. At most one per page, and worth checking against a
   * measurement first — see the note in `Hero`, where `eager` was chosen over this
   * deliberately for the heaviest file on the site.
   */
  readonly priority?: boolean;
  /** The third state between `priority` and lazy: in the first wave, without jumping it. */
  readonly loading?: "eager" | "lazy";
  /**
   * The picture carries no information the surrounding copy does not already give — the
   * nav panel's cards, where the link text says the same thing. Announced as nothing rather
   * than announced twice.
   */
  readonly decorative?: boolean;
  readonly className?: string;
  /**
   * A marker attribute forwarded ONTO THE RENDERED ELEMENT, written out in full so that
   * grepping `data-frame-image` still finds both ends of it.
   *
   * The homepage's scroll-motion hooks reach for these with `querySelector` and transform
   * whatever they find, so the attribute has to be on the image or the video itself and not
   * on a wrapper. A silently dropped one is a section that simply stops animating.
   */
  readonly dataAttribute?: "data-frame-image" | "data-cover-image" | "data-card-image";
}) {
  const marker = dataAttribute ? { [dataAttribute]: true } : {};

  if (media.kind === "video") {
    return (
      <AutoplayVideo
        src={media.src}
        poster={media.poster}
        alt={decorative ? "" : media.alt}
        width={width}
        height={height}
        className={className}
        {...marker}
      />
    );
  }

  return (
    <Image
      src={media.src}
      alt={decorative ? "" : media.alt}
      width={width}
      height={height}
      {...(sizes ? { sizes } : {})}
      {...(priority ? { priority: true } : loading ? { loading } : { loading: "lazy" as const })}
      className={className}
      {...marker}
    />
  );
}
