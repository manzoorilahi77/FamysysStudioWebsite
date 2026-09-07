import type { ProcessStep } from "./ProcessStep";

export interface ProcessBlock {
  readonly heading: string;
  /**
   * The button the homepage's five frames put under each step name. Hover reveals the
   * step's sentence; a touch screen and a keyboard have no hover, so they get this
   * instead. Content, not a component literal — the frames render whatever it says.
   */
  readonly revealLabel: string;
  readonly steps: ReadonlyArray<ProcessStep>;
}
