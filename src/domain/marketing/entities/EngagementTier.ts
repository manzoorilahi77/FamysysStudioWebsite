import type { Cta } from "../../shared/value-objects/Cta";

export interface EngagementTier {
  readonly name: string;
  readonly descriptor: string;
  readonly summary: string;
  readonly idealFor: string;
  readonly typicalWork: string;
  readonly cta: Cta;
}

export interface CustomPartnership {
  readonly name: string;
  readonly descriptor: string;
  readonly summary: string;
  readonly invitation: string;
  readonly cta: Cta;
}

export interface WaysToWorkBlock {
  readonly heading: string;
  readonly body: string;
  /**
   * The two words on the homepage's four tiles: the one under a tier's name while the
   * picture is all there is, and the one that shuts the panel it opens. Content, not
   * component literals — same reason `TIER_FIELD_LABELS` is content.
   */
  readonly openLabel: string;
  readonly closeLabel: string;
  readonly tiers: ReadonlyArray<EngagementTier>;
  readonly custom: CustomPartnership;
}
