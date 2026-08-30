import type { MediaRef } from "../../shared/value-objects/MediaRef";

export interface Differentiator {
  readonly title: string;
  readonly description: string;
  /**
   * The element's own image. The four elements render as a card row where the image is
   * the card's upper two-thirds, so this is load-bearing layout, not decoration — every
   * element carries one.
   */
  readonly media: MediaRef;
}
