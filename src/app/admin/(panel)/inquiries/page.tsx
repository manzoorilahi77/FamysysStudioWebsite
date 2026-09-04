import { GetInquiries } from "../../../../application/cms/GetInquiries";
import { adminContainer } from "../../../../infrastructure/di/adminContainer";
import { InquiriesScreen } from "../../../../presentation/admin/views/InquiriesScreen";

export default async function AdminInquiriesRoute() {
  const inquiries = await new GetInquiries(adminContainer.cms).execute();
  return <InquiriesScreen inquiries={inquiries} />;
}
