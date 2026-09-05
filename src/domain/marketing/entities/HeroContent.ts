import type { Cta } from "../../shared/value-objects/Cta";
import type { MediaRef } from "../../shared/value-objects/MediaRef";

/**
 * One band of the hero's accordion. The label is the only copy on it — a short
 * discipline name shown along the band's foot. The numeral beside that label is NOT
 * here: it is the band's position in the list, and storing "01" next to the first entry
 * would be a second thing to keep in step with the order.
 */
export interface HeroBand {
  readonly label: string;
  readonly media: MediaRef;
}

export interface HeroContent {
  readonly heading: string;
  readonly body: string;
  readonly primaryCta: Cta;
  readonly secondaryCta: Cta;
  readonly supportingLine: string;
  readonly bands: ReadonlyArray<HeroBand>;
}
