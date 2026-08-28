import type { MediaRef } from "../../shared/value-objects/MediaRef";

export interface ClientLogo {
  readonly name: string;
  readonly logo: MediaRef;
}
