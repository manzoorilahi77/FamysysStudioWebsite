import type { Cta } from "../../shared/value-objects/Cta";

export interface ClosingCtaBlock {
  readonly heading: string;
  readonly body: string;
  readonly cta: Cta;
  readonly closingLine: string;
}
