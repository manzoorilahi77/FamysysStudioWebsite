import type { Cta } from "../../shared/value-objects/Cta";

export interface ManifestoBlock {
  readonly eyebrow: string;
  readonly statementLines: ReadonlyArray<string>;
  readonly supportingParagraph: string;
  readonly cta: Cta;
}
