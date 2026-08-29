import type { ProcessStep } from "./ProcessStep";

export interface ProcessBlock {
  readonly heading: string;
  readonly steps: ReadonlyArray<ProcessStep>;
}
