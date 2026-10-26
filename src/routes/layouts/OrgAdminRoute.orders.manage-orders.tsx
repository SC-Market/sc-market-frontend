// Route module: <OrgAdminRoute> layout. Wired up in src/routes.ts.

import { shellComponent } from "../shell"

const OrgAdminRouteComponent = shellComponent("OrgAdminRoute")

export default function OrgAdminRoute() {
  return <OrgAdminRouteComponent area="orders" permission="manage_orders" />
}
