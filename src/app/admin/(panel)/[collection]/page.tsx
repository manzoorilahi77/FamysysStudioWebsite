import { notFound } from "next/navigation";
import { isOpenCollection, recordNoun } from "../../../../application/cms/collectionPolicy";
import { GetCmsCollection } from "../../../../application/cms/GetCmsCollection";
import { adminContainer } from "../../../../infrastructure/di/adminContainer";
import { CollectionScreen } from "../../../../presentation/admin/views/CollectionScreen";

/**
 * One route for all seven collections rather than seven near-identical files: which
 * collections exist is the repository's answer, not the router's, so adding one should
 * not mean adding a folder. `pages`, `library` and `inquiries` are static segments and
 * take precedence over this dynamic one, which is why they are unreachable from here.
 */
export default async function AdminCollectionRoute({
  params,
}: {
  readonly params: Promise<{ readonly collection: string }>;
}) {
  const { collection: id } = await params;
  const collection = await new GetCmsCollection(adminContainer.cms).execute(id);
  if (!collection) {
    notFound();
  }

  return (
    <CollectionScreen
      collection={collection}
      canAdd={adminContainer.cms.supportsRecordChanges && isOpenCollection(id)}
      noun={recordNoun(id)}
    />
  );
}
