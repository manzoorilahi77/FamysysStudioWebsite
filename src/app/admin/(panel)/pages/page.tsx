import { GetCmsPages } from "../../../../application/cms/GetCmsPages";
import { adminContainer } from "../../../../infrastructure/di/adminContainer";
import { PagesScreen } from "../../../../presentation/admin/views/PagesScreen";

export default async function AdminPagesRoute() {
  const pages = await new GetCmsPages(adminContainer.cms).execute();
  return <PagesScreen pages={pages} />;
}
