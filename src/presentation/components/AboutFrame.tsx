import { Media } from "./Media";
import type { AspectRatio } from "../../domain/shared/value-objects/MediaRef";
import type { MediaView } from "../lib/viewModels";

interface AboutFrameProps {
  readonly media: MediaView;
  /**
   * Whether the block this frame belongs to has entered. Drives the settle: the image
   * renders at 1.03 and eases to 1 once this is true. Pass `true` from the first render
   * for a frame that arrives on load rather than on scroll.
   */
  readonly hasArrived: boolean;
  readonly sizes: string;
  /** The frame's ratio, from the media itself. */
  readonly className?: string;
  /** Above the fold only — the hero. Everything else is lazy. */
  readonly priority?: boolean;
}

const RATIO_CLASS: Record<AspectRatio, string> = {
  "16:9": "about-frame--16x9",
  "4:3": "about-frame--4x3",
  "1:1": "about-frame--1x1",
  "3:4": "about-frame--3x4",
};

/**
 * Every image on /about sits in one of these: a hairline frame at the site's radius, the
 * ratio taken from the media rather than from the layout, and the settle from 1.03 as the
 * block enters. The settle lives in the stylesheet keyed on `data-settled`, so under
 * reduced motion the image is simply at its resting size — see `.about-frame`.
 */
export function AboutFrame({
  media,
  hasArrived,
  sizes,
  className = "",
  priority = false,
}: AboutFrameProps) {
  return (
    <div
      className={`about-frame ${RATIO_CLASS[media.aspectRatio]} ${className}`}
      data-settled={hasArrived}
    >
      <Media
        media={media}
        width={1600}
        height={1200}
        sizes={sizes}
        priority={priority}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
