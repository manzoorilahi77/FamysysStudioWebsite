import { GetInquiries } from "../../../../application/cms/GetInquiries";
import { isMailEnabled } from "../../../../infrastructure/db/env";
import { adminContainer } from "../../../../infrastructure/di/adminContainer";
import { InboxScreen } from "../../../../presentation/admin/views/InboxScreen";

export default async function AdminInboxRoute() {
  const inquiries = await new GetInquiries(adminContainer.cms).execute();
  return <InboxScreen inquiries={inquiries} isMailEnabled={isMailEnabled()} />;
}
