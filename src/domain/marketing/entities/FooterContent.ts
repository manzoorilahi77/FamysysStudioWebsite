import type { Cta } from "../../shared/value-objects/Cta";

export interface FooterContent {
  readonly tagline: string;
  readonly contactEmail: string;
  readonly legalLinks: ReadonlyArray<Cta>;
  readonly socialLinks: ReadonlyArray<Cta>;
}
