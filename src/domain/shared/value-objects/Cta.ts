import { CtaLabel } from "./CtaLabel";
import { Url } from "./Url";

export interface Cta {
  readonly label: CtaLabel;
  readonly href: Url;
}

export function createCta(label: string, href: string): Cta {
  return { label: CtaLabel.create(label), href: Url.create(href) };
}
