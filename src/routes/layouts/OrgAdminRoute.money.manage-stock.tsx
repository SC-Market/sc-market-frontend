// Route module: <OrgAdminRoute> layout. Wired up in src/routes.ts.

import { shellComponent } from "../shell"

const OrgAdminRouteComponent = shellComponent("OrgAdminRoute")

export default function OrgAdminRoute() {
  return <OrgAdminRouteComponent area="money" permission="manage_stock" />
}
