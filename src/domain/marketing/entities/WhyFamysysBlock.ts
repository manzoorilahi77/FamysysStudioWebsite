import type { ValuePillar } from "./ValuePillar";

export interface WhyFamysysBlock {
  readonly heading: string;
  readonly body: string;
  readonly reasons: ReadonlyArray<ValuePillar>;
}
