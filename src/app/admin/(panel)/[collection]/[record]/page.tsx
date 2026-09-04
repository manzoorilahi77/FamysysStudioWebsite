import { notFound } from "next/navigation";
import { isOpenCollection } from "../../../../../application/cms/collectionPolicy";
import { GetCmsRecord } from "../../../../../application/cms/GetCmsRecord";
import { adminContainer } from "../../../../../infrastructure/di/adminContainer";
import { RecordScreen } from "../../../../../presentation/admin/views/RecordScreen";

export default async function AdminRecordRoute({
  params,
}: {
  readonly params: Promise<{ readonly collection: string; readonly record: string }>;
}) {
  const { collection: collectionId, record: recordId } = await params;
  const found = await new GetCmsRecord(adminContainer.cms).execute(collectionId, recordId);
  if (!found) {
    notFound();
  }

  return (
    <RecordScreen
      collection={found.collection}
      record={found.record}
      canRemove={adminContainer.cms.supportsRecordChanges && isOpenCollection(collectionId)}
    />
  );
}
