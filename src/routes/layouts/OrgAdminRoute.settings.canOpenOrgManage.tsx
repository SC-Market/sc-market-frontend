// Route module: <OrgAdminRoute> layout. Wired up in src/routes.ts.

import { shellComponent } from "../shell"
import { canOpenOrgManage } from "../../features/contractor/domain/manageTabs"

const OrgAdminRouteComponent = shellComponent("OrgAdminRoute")

export default function OrgAdminRoute() {
  return <OrgAdminRouteComponent area="settings" allow={canOpenOrgManage} />
}
