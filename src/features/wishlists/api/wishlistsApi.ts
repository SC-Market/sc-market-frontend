/**
 * Wishlists and shopping lists, owned by the wishlists feature. Every hook and
 * type here comes straight from the generated v2 client: same endpoints, same
 * cache tags.
 */
export { marketV2Api as wishlistsApi } from "../../../store/api/v2/market"
export {
  useAddWishlistItemMutation,
  useGenerateShoppingListQuery,
  useGetWishlistQuery,
  useGetWishlistsQuery,
  useRemoveWishlistItemMutation,
  useUpdateWishlistItemMutation,
  useUpdateWishlistMutation,
} from "../../../store/api/v2/market"
export type {
  AcquisitionMode,
  ShoppingListMaterial,
  Wishlist,
  WishlistItemWithDetails,
} from "../../../store/api/v2/market"
