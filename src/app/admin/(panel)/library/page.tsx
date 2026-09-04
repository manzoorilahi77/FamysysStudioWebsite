import { GetMediaLibrary } from "../../../../application/cms/GetMediaLibrary";
import { adminContainer } from "../../../../infrastructure/di/adminContainer";
import { LibraryScreen } from "../../../../presentation/admin/views/LibraryScreen";

export default async function AdminLibraryRoute() {
  const assets = await new GetMediaLibrary(adminContainer.cms).execute();
  return <LibraryScreen assets={assets} />;
}
