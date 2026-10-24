// Side-effect: register market API endpoints with serviceApi
import "./api/marketApi"

// Domain
export type {
  MarketListingSearchResult,
  MarketBidApi as MarketBid,
  MarketSearchResult,
  DatatypesMarketBid,
} from "./domain/types"
export type {
  MarketListing,
  UniqueListing,
  MarketAggregate,
} from "./domain/types"

// API
export {
  useGetMarketListingQuery,
  useGetBuyOrderListingsQuery,
  useCancelBuyOrderMutation,
} from "./api/marketApi"

// Hooks
export {
  marketDrawerWidth,
  MarketSidebarContext,
  useMarketSidebar,
} from "./hooks/MarketSidebar"
export { useMarketSearch } from "./hooks/MarketSearch"

// Components
export { MarketEditTemplate } from "./components/MarketEditTemplate"
export { ItemStockContext, ManageStockArea } from "./components/ItemStock"
