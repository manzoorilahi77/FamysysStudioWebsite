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
  readonly tiers: ReadonlyArray<EngagementTier>;
  readonly custom: CustomPartnership;
}
