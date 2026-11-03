import { useGetMyShopsQuery } from "../../../store/api/v2/market"
import { useIsAuthenticated } from "../../../hooks/login/useSession"
import { canManageListing } from "../domain/listingPermissions"

/**
 * What the signed-in user may do with a listing of the shop `shopId`
 * (canManageListing). Anonymous visitors never request /shops/mine.
 */
export function useListingPermissions(shopId: string | null | undefined): { canManage: boolean } {
  const isAuthenticated = useIsAuthenticated()
  const { data: myShops } = useGetMyShopsQuery(undefined, { skip: !isAuthenticated })
  return { canManage: canManageListing(shopId, myShops) }
}
