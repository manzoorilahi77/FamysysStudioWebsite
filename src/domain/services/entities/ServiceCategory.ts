import type { ServiceOffering } from "./ServiceOffering";

export interface ServiceCategory {
  readonly title: string;
  readonly offerings: ReadonlyArray<ServiceOffering>;
}
