import { useCallback, useMemo, useSyncExternalStore } from "react"
import { useLocation } from "react-router-dom"
import { useGetMyShopsQuery } from "../../../store/api/v2/market"
import { useSession } from "../../../hooks/login/useSession"
import {
  getSidebarShopContext,
  shopContextFromState,
  subscribeSidebarShopContext,
} from "../../../components/sidebar/shopContextState"
import {
  LAST_QUICK_LIST_SHOP_KEY,
  parseLastShops,
  quickListShops,
  resolveSellingAsShop,
  shopSlugFromPath,
} from "../domain/quickList"

const serverSidebarShop = () => null

function readLastShop(user: string | undefined): string | null {
  if (!user) return null
  try {
    return parseLastShops(localStorage.getItem(LAST_QUICK_LIST_SHOP_KEY))[user] ?? null
  } catch {
    return null
  }
}

/** Remembers the shop `user` last listed in, in this browser. */
export function rememberQuickListShop(user: string, shopId: string): void {
  try {
    const all = parseLastShops(localStorage.getItem(LAST_QUICK_LIST_SHOP_KEY))
    all[user] = shopId
    localStorage.setItem(LAST_QUICK_LIST_SHOP_KEY, JSON.stringify(all))
  } catch {
    // Storage blocked or full: the default falls back to the first shop
  }
}

/**
 * The shops the signed-in user can list in, and the one "Selling as"
 * starts on (see resolveSellingAsShop): the page's shop context, the
 * sidebar's, the last shop used (per user), or the first.
 */
export function useSellingAsShop() {
  const location = useLocation()
  const session = useSession()
  const user = session.status === "authenticated" ? session.profile.username : undefined
  const { data: myShops, isLoading, isError, refetch } = useGetMyShopsQuery(undefined, {
    skip: session.status !== "authenticated",
  })
  const sidebarShopSlug = useSyncExternalStore(
    subscribeSidebarShopContext,
    getSidebarShopContext,
    serverSidebarShop,
  )
  const shops = useMemo(() => quickListShops(myShops), [myShops])
  const pageShopSlug =
    shopSlugFromPath(location.pathname) ?? shopContextFromState(location.state)

  const defaultShopId = useMemo(
    () =>
      resolveSellingAsShop({
        shops,
        pageShopSlug,
        sidebarShopSlug,
        lastShopId: readLastShop(user),
      }),
    [shops, pageShopSlug, sidebarShopSlug, user],
  )

  const remember = useCallback(
    (shopId: string) => {
      if (user) rememberQuickListShop(user, shopId)
    },
    [user],
  )

  return { shops, defaultShopId, remember, isLoading, isError, refetch }
}
