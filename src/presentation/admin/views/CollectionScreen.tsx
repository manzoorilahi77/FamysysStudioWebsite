import type { CmsCollection } from "../../../domain/cms/entities/CmsCollection";
import { AdminPanel, AdminPanelEmpty } from "../components/AdminPanel";
import { AdminRow, AdminRowList } from "../components/AdminRow";
import { AdminScreen } from "../components/AdminScreen";
import { NewRecordForm } from "../components/NewRecordForm";

interface CollectionScreenProps {
  readonly collection: CmsCollection;
  /**
   * Whether a record can be added here. Not every collection can take one: Lists is a
   * cross-cut view of strings that belong to other records, Testimonials has no content
   * behind it yet, and a ninth case study needs two covers and a reference before it
   * renders as anything — none of which is a string typed into a form.
   */
  readonly canAdd: boolean;
  /** What one record is called, for the button: "a capability", "a question". */
  readonly noun: string;
}

/**
 * Every collection screen is this one component. They differ by their records, not by
 * their shape — and a collection that renders differently from its neighbours is a
 * collection an editor has to learn twice.
 */
export function CollectionScreen({ collection, canAdd, noun }: CollectionScreenProps) {
  return (
    <AdminScreen
      breadcrumb={[{ label: "Content" }, { label: collection.label }]}
      heading={collection.label}
      description={collection.description}
    >
      <AdminPanel label={collection.panelLabel} meta={`${collection.records.length}`}>
        {collection.records.length === 0 ? (
          <AdminPanelEmpty message={collection.emptyMessage} />
        ) : (
          <AdminRowList>
            {collection.records.map((record) => (
              <AdminRow
                key={record.id}
                title={record.title}
                secondary={record.summary}
                status={record.status}
                updatedAt={record.updatedAt}
                href={`/admin/${collection.id}/${record.id}`}
              />
            ))}
          </AdminRowList>
        )}
      </AdminPanel>

      {canAdd ? <NewRecordForm collectionId={collection.id} noun={noun} /> : null}

      <p className="text-small mt-4 text-ink-40">Source: {collection.source}</p>
    </AdminScreen>
  );
}
