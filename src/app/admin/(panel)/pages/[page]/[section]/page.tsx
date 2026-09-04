import { notFound } from "next/navigation";
import { GetCmsPage } from "../../../../../../application/cms/GetCmsPage";
import { adminContainer } from "../../../../../../infrastructure/di/adminContainer";
import { SectionScreen } from "../../../../../../presentation/admin/views/SectionScreen";

export default async function AdminSectionRoute({
  params,
}: {
  readonly params: Promise<{ readonly page: string; readonly section: string }>;
}) {
  const { page: pageId, section: sectionId } = await params;
  const page = await new GetCmsPage(adminContainer.cms).execute(pageId);
  const section = page?.sections.find((candidate) => candidate.id === sectionId);
  if (!page || !section) {
    notFound();
  }

  return <SectionScreen page={page} section={section} />;
}
