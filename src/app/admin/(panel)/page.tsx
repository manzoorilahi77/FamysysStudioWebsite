import { GetCmsDashboard } from "../../../application/cms/GetCmsDashboard";
import { adminContainer } from "../../../infrastructure/di/adminContainer";
import { DashboardScreen } from "../../../presentation/admin/views/DashboardScreen";

export default async function AdminDashboardRoute() {
  const dashboard = await new GetCmsDashboard(adminContainer.cms).execute();
  return <DashboardScreen dashboard={dashboard} />;
}
