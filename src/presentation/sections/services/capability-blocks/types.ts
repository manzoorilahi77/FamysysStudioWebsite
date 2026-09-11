import type { CapabilityDetailView } from "../../../lib/viewModels";

/** The prop shape every composition in this directory implements. */
export interface CapabilityCompositionProps {
  readonly capability: CapabilityDetailView;
  readonly deliverablesLabel: string;
  readonly dark: boolean;
}
