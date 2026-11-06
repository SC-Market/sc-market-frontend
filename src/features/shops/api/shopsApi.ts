/**
 * Shops and seller presence, owned by the shops feature. Every hook and type
 * here comes straight from the generated v2 client: same endpoints, same cache
 * tags.
 */
export { marketV2Api as shopsApi } from "../../../store/api/v2/market"
export {
  useBrowseShopsQuery,
  useGetMyShopsQuery,
  useGetShopQuery,
} from "../../../store/api/v2/market"
export type {
  LastSeenBucket,
  ReplyTimeBucket,
  SellerActivity,
  ShopResponse,
} from "../../../store/api/v2/market"
