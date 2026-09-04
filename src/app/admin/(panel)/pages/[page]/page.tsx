import { notFound } from "next/navigation";
import { GetCmsPage } from "../../../../../application/cms/GetCmsPage";
import { adminContainer } from "../../../../../infrastructure/di/adminContainer";
import { PageScreen } from "../../../../../presentation/admin/views/PageScreen";

export default async function AdminPageRoute({
  params,
}: {
  readonly params: Promise<{ readonly page: string }>;
}) {
  const { page: id } = await params;
  const page = await new GetCmsPage(adminContainer.cms).execute(id);
  if (!page) {
    notFound();
  }

  return <PageScreen page={page} />;
}
