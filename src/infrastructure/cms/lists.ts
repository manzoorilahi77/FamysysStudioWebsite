import type { CmsRecord } from "../../domain/cms/entities/CmsRecord";
import type { WaysToWorkPage } from "../../domain/engagement/entities/WaysToWorkPage";
import type { HowWeWorkPage } from "../../domain/process/entities/HowWeWorkPage";
import type { CreativeServicesPage } from "../../domain/services/entities/CreativeServicesPage";
import { CONTENT_FILE, contentModifiedAt } from "./contentSources";
import { derivedId, readOnly, readOnlyList, toRecord } from "./records";

/**
 * LISTS ARE NOT A SEPARATE STORE, AND THIS SCREEN IS READ-ONLY ON PURPOSE.
 *
 * Every list below already belongs to a record — a capability's deliverables, a stage's
 * "What we need", an engagement's "Typical work" — and is editable there. This collection
 * is the cross-cut: one screen showing every list on the site with its owner and its
 * length, which is the view you want when the question is "do these read consistently"
 * rather than "what does this one capability offer".
 *
 * Editing here would be a second way to change the same string, and two ways to change one
 * thing is how a CMS starts disagreeing with itself. The row says where to go instead.
 */

interface ListSources {
  readonly creativeServices: CreativeServicesPage;
  readonly howWeWork: HowWeWorkPage;
  readonly waysToWork: WaysToWorkPage;
}

interface OwnedList {
  readonly owner: string;
  readonly label: string;
  readonly items: ReadonlyArray<string>;
  readonly editedUnder: string;
  readonly updatedAt: Date | null;
}

function toListRecord(entry: OwnedList): CmsRecord {
  return toRecord({
    id: derivedId(`${entry.owner} ${entry.label}`),
    title: `${entry.owner} — ${entry.label}`,
    summary: entry.items.join(" · "),
    updatedAt: entry.updatedAt,
    values: [
      readOnly(
        "Owner",
        entry.owner,
        `Edited on this record's own screen, under ${entry.editedUnder}.`,
      ),
      readOnly("Items", String(entry.items.length), "A count of the list below, not a string."),
    ],
    lists: [
      readOnlyList(
        entry.label,
        entry.items,
        `Edited with "${entry.owner}", under ${entry.editedUnder}.`,
      ),
    ],
  });
}

export function buildLists(sources: ListSources): ReadonlyArray<CmsRecord> {
  const creativeServicesAt = contentModifiedAt(CONTENT_FILE.creativeServices);
  const howWeWorkAt = contentModifiedAt(CONTENT_FILE.howWeWork);
  const waysToWorkAt = contentModifiedAt(CONTENT_FILE.waysToWork);

  const deliverables: ReadonlyArray<OwnedList> = sources.creativeServices.capabilities.map(
    (capability) => ({
      owner: capability.title,
      label: sources.creativeServices.deliverablesLabel,
      items: capability.deliverables,
      editedUnder: "Capabilities",
      updatedAt: creativeServicesAt,
    }),
  );

  const stageLists: ReadonlyArray<OwnedList> = sources.howWeWork.steps.flatMap((step) => [
    {
      owner: step.title,
      label: sources.howWeWork.whatWeNeedLabel,
      items: step.whatWeNeed,
      editedUnder: "Process Steps",
      updatedAt: howWeWorkAt,
    },
    {
      owner: step.title,
      label: sources.howWeWork.whatYouGetLabel,
      items: step.whatYouGet,
      editedUnder: "Process Steps",
      updatedAt: howWeWorkAt,
    },
  ]);

  const labels = sources.waysToWork.comparison.rowLabels;
  const tierLists: ReadonlyArray<OwnedList> = sources.waysToWork.tiers.flatMap((tier) => [
    {
      owner: tier.name,
      label: labels.idealFor,
      items: tier.idealForItems,
      editedUnder: "Engagement Tiers",
      updatedAt: waysToWorkAt,
    },
    {
      owner: tier.name,
      label: labels.typicalWork,
      items: tier.typicalWorkItems,
      editedUnder: "Engagement Tiers",
      updatedAt: waysToWorkAt,
    },
  ]);

  const customList: OwnedList = {
    owner: sources.waysToWork.custom.name,
    label: sources.waysToWork.custom.coversLabel,
    items: sources.waysToWork.custom.covers,
    editedUnder: "Engagement Tiers",
    updatedAt: waysToWorkAt,
  };

  return [...deliverables, ...stageLists, ...tierLists, customList].map(toListRecord);
}
