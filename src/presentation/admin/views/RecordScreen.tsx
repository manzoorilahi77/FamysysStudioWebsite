import type { CmsCollection } from "../../../domain/cms/entities/CmsCollection";
import type { CmsRecord } from "../../../domain/cms/entities/CmsRecord";
import { AdminScreen } from "../components/AdminScreen";
import { DeleteRecord } from "../components/DeleteRecord";
import { RecordEditor } from "../components/RecordEditor";

interface RecordScreenProps {
  readonly collection: CmsCollection;
  readonly record: CmsRecord;
  /** Whether this collection accepts records coming and going at all. */
  readonly canRemove: boolean;
}

export function RecordScreen({ collection, record, canRemove }: RecordScreenProps) {
  return (
    <AdminScreen
      breadcrumb={[
        { label: "Content" },
        { label: collection.label, href: `/admin/${collection.id}` },
        { label: record.title },
      ]}
      heading={record.title}
      description="Edit the copy and save. Fields that cannot be written say why — most of those are the string the record is stored and linked by, which is a rename rather than an edit."
    >
      {/* Remounts when the record's timestamp moves, so a save leaves the form showing
          what was stored rather than what was typed. */}
      <RecordEditor
        key={String(record.updatedAt?.getTime() ?? 0)}
        record={record}
        target={{ kind: "record", collectionId: collection.id, recordId: record.id }}
      />

      {canRemove ? (
        <DeleteRecord collectionId={collection.id} recordId={record.id} title={record.title} />
      ) : null}
    </AdminScreen>
  );
}
