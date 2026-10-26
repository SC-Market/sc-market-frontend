// Route module: renders <ShopRedirect subpath="services" />. Wired up in src/routes.ts.

import { shellComponent } from "../shell"

const ShopRedirectComponent = shellComponent("ShopRedirect")

export default function ShopRedirect() {
  return <ShopRedirectComponent subpath="services" />
}
