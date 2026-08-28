import type { Slug } from "../../shared/value-objects/Slug";
import type { MediaRef } from "../../shared/value-objects/MediaRef";
import type { WorkTag } from "./WorkTag";

export interface CaseStudy {
  readonly slug: Slug;
  readonly client: string;
  readonly title: string;
  readonly tags: ReadonlyArray<WorkTag>;
  readonly media: MediaRef;
}
