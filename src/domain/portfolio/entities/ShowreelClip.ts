import type { MediaRef } from "../../shared/value-objects/MediaRef";

export interface ShowreelClip {
  readonly client: string;
  readonly quote: string;
  readonly media: MediaRef;
}
