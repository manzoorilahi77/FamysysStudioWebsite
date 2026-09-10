"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";

/**
 * A VIDEO THAT BEHAVES LIKE A MOVING PHOTOGRAPH.
 *
 * No controls, no sound, no play button: these sit in the same tiles, bands and frames the
 * site fills with stills, and a control bar across the bottom of one of them would be the
 * only piece of chrome in the design. What the slot promises is a picture; a video in it is
 * that picture, moving.
 *
 * IT IS NOT `autoPlay`, AND THAT IS THE WHOLE COMPONENT.
 *
 * `autoPlay` in the markup starts the video during the prerender's hydration, before
 * anything has been able to ask whether the viewer wants motion — and `useReducedMotion`
 * cannot answer during a server render or the first client one, by design, because a guess
 * there is a hydration mismatch. So the markup ships a paused video showing its poster,
 * which is the correct picture for a reader with no JavaScript and the correct picture for a
 * reader who has asked for no motion, and playback is started a frame later only if neither
 * of those is true.
 *
 * The poster therefore is not a nicety — it is what this element IS until something decides
 * otherwise, which is why `MediaRef` refuses to build a video reference without one.
 *
 * `play()` REJECTS, ROUTINELY. A browser that has decided this tab may not play media
 * returns a rejected promise, and an unhandled one of those is a console error on a page
 * that is working exactly as intended. The video simply stays on its poster.
 */
export function AutoplayVideo({
  src,
  poster,
  alt,
  width,
  height,
  className,
  ...marker
}: {
  readonly src: string;
  readonly poster: string | undefined;
  /**
   * Described rather than labelled: a `<video>` has no `alt`, and an element with no
   * accessible name is invisible to a screen reader. The alt text a media reference already
   * carries is the description of the picture, which is exactly what this is.
   *
   * Empty means decorative — no name and hidden, rather than a name of "".
   */
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  readonly className: string;
  /** The homepage motion hooks' `data-*` marker, forwarded by `Media`. */
  readonly [dataAttribute: `data-${string}`]: unknown;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const element = video.current;
    if (!element) return;

    if (prefersReducedMotion) {
      element.pause();
      // Back to the poster frame rather than frozen mid-shot, so switching the preference
      // on leaves the same still the page would have shipped with it on from the start.
      element.currentTime = 0;
      return;
    }
    void element.play().catch(() => undefined);
  }, [prefersReducedMotion]);

  return (
    <video
      ref={video}
      src={src}
      {...(poster ? { poster } : {})}
      muted
      loop
      playsInline
      preload="metadata"
      width={width}
      height={height}
      {...(alt ? { "aria-label": alt } : { "aria-hidden": true })}
      className={className}
      {...marker}
    />
  );
}
