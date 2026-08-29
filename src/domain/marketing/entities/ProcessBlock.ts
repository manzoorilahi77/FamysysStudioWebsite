import type { ProcessStep } from "./ProcessStep";

export interface ProcessBlock {
  readonly eyebrow: string;
  readonly heading: string;
  readonly steps: ReadonlyArray<ProcessStep>;
}
