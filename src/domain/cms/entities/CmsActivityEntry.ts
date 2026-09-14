/**
 * ONE THING THE PANEL DID — a save, a publish, or a preview opened with drafts in it.
 *
 * `pageLabel`/`sectionLabel` are captured at the moment the action happened rather than
 * looked up again from the current model, so an entry stays readable even if the section it
 * names is later renamed or removed. `sectionLabel` is absent only for an action that is not
 * about one particular section — none exist today, but the type leaves room for one.
 */
export type CmsActivityAction = "saved" | "published" | "previewed";

export interface CmsActivityEntry {
  readonly action: CmsActivityAction;
  readonly pageLabel: string;
  readonly sectionLabel: string | null;
  readonly occurredAt: Date;
}
