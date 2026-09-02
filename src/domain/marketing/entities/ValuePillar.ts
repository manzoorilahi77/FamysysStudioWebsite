import type { MediaRef } from "../../shared/value-objects/MediaRef";

export interface ValuePillar {
  readonly title: string;
  readonly description: string;
  /**
   * The reason's own frame. The five reasons render as a ledger beside one sticky panel
   * that shows the image belonging to whichever row is being read, so this is load-bearing
   * — a reason without an image would leave the panel empty for the length of its row.
   */
  readonly media: MediaRef;
}
