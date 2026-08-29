import type { Cta } from "../../shared/value-objects/Cta";

export interface FaqItem {
  readonly question: string;
  readonly answer: string;
  /** Present only where the brief's answer ends in an inline call to action. */
  readonly cta?: Cta;
}

export interface FaqBlock {
  readonly items: ReadonlyArray<FaqItem>;
}
