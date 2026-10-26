// Route module: renders <ShopRedirectListings suffix="/create" />. Wired up in src/routes.ts.

import { shellComponent } from "../shell"

const ShopRedirectListingsComponent = shellComponent("ShopRedirectListings")

export default function ShopRedirectListings() {
  return <ShopRedirectListingsComponent suffix="/create" />
}
