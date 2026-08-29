import type { Differentiator } from "./Differentiator";

export interface DifferentiatorBlock {
  readonly heading: string;
  readonly body: string;
  readonly leadIn: string;
  readonly elements: ReadonlyArray<Differentiator>;
  /** The page's thesis line — set large and centred, see the design spec. */
  readonly closingStatement: string;
}
