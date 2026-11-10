import { useMemo } from "react"
import {
  useGetCartQuery,
  type GetCartResponse,
} from "../../../store/api/v2/market"
import { useCustomDomain } from "../../../hooks/contractor/CustomDomain"
import { isOrgOwned } from "../../storefront/whiteLabelRoutes"

/**
 * The cart as this domain shows it: on an org's white-label domain only the
 * org's own shops' items (totals recomputed), so nothing from another seller
 * is shown or checked out under the org's brand; before the domain's org is
 * known, nothing. Unchanged on sc-market.space. `customOrg` undefined: the
 * main site; "" or a spectrum_id: a white-label domain.
 */
export function orgScopedCart(
  cart: GetCartResponse | undefined,
  customOrg: string | undefined,
): GetCartResponse | undefined {
  if (!cart || customOrg === undefined) return cart
  const items = cart.items.filter((item) =>
    isOrgOwned(item.listing.shop_owner_spectrum_id, customOrg),
  )
  if (items.length === cart.items.length) return cart
  return {
    items,
    total_price: items.reduce((sum, item) => sum + item.subtotal, 0),
    item_count: items.reduce((sum, item) => sum + item.quantity, 0),
  }
}

/** useGetCartQuery, scoped to the org on its white-label domain (orgScopedCart). */
export function useDomainCart(options?: { skip?: boolean }) {
  const result = useGetCartQuery(undefined, options)
  const { isCustomDomain, customOrg } = useCustomDomain()
  const org = isCustomDomain ? (customOrg ?? "") : undefined
  const data = useMemo(
    () => orgScopedCart(result.data, org),
    [result.data, org],
  )
  return { ...result, data }
}
