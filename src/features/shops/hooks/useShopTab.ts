import { useMemo } from "react"
import { useParams } from "react-router-dom"

const NAME_TO_INDEX = new Map([
  ["", 0],
  ["listings", 0],
  ["services", 1],
  ["reviews", 2],
  ["about", 3],
  ["order", 4],
])

export const SHOP_LISTINGS_TAB = 0
/** Page size of the listings tab (ShopListingsTab and its data prefetch). */
export const SHOP_LISTINGS_PAGE_SIZE = 24

/** Tab index for the `:tab` route param; unknown names fall back to listings. */
export function shopTabIndex(tab: string | undefined): number {
  return NAME_TO_INDEX.get(tab || "") ?? SHOP_LISTINGS_TAB
}

export function useShopTab() {
  const { tab } = useParams<{ tab?: string }>()
  const page = useMemo(() => shopTabIndex(tab), [tab])

  return page
}
