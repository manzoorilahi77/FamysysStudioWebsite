import type { Cta } from "../../shared/value-objects/Cta";
import type { MediaRef } from "../../shared/value-objects/MediaRef";

export interface HeroContent {
  readonly eyebrow: string;
  readonly headlineLines: ReadonlyArray<string>;
  readonly subhead: string;
  readonly primaryCta: Cta;
  readonly secondaryCta: Cta;
  readonly media: MediaRef;
  readonly mosaicTiles: ReadonlyArray<MediaRef>;
}
