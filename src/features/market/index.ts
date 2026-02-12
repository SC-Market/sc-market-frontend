/**
 * @deprecated This barrel export file increases bundle size.
 * Prefer direct imports from specific files:
 * 
 * API: import { useSearchMarketListingsQuery } from "./api/marketApi"
 * Hooks: import { useMarketSearch } from "./hooks/MarketSearch"
 * Components: import { MarketSidebar } from "./components/MarketSidebar"
 * Listings: import { ItemListings } from "./listings/components/ItemListings"
 * 
 * Types can still be imported from here as they have no runtime cost.
 */

// Side-effect: register market API endpoints with serviceApi
import "./api/marketApi"

// Domain
export type {
  Pagination,
  BaseMarketListingSearchResult,
  ExtendedUniqueSearchResult,
  ExtendedAggregateSearchResult,
  ExtendedMultipleSearchResult,
  MarketListingSearchResult,
  MarketListingComplete,
  MarketBidApi,
  MarketBidApi as MarketBid,
  CreateBidRequest,
  SaleType,
  SaleTypeSelect,
  MarketSearchState,
  MarketSearchParams,
  MarketSearchResult,
  MarketStats,
  DatatypesMarketBid,
} from "./domain/types"
export type {
  MarketListing,
  MarketBuyOrderBody,
  BaseListingType,
  MarketMultipleBody,
  ListingStats,
  MarketListingBody,
  UniqueListing,
  ItemType,
  SellerListingType,
  StockManageType,
  MarketListingType,
  ListingDetails,
  MarketAggregate,
  MarketMultiple,
  MarketAggregateListing,
  MarketAggregateListingComposite,
  MarketMultipleListing,
  MarketMultipleListingComposite,
  MarketOffer,
  BuyOrder,
  MarketListingUpdateBody,
  AggregateListingUpdateBody,
  AggregateMarketListingBody,
  AggregateMarketListing,
  GameItemCategory,
  GameItem,
  GameItemDescription,
} from "./domain/types"
export { item_types, item_types_lower } from "./domain/types"
export { validatePhotoUploadParams } from "./domain/photoUpload"
export {
  formatListingSlug,
  formatMarketUrl,
  formatCompleteListingUrl,
  formatMarketMultipleUrl,
} from "./domain/urls"
export type { FormattableListingType } from "./domain/urls"

// API
export {
  marketApi,
  useGetMarketStatsQuery,
  useSearchMarketListingsQuery,
  useGetMarketListingQuery,
  useGetMyListingsQuery,
  useGetMarketCategoriesQuery,
  useGetMarketItemsByCategoryQuery,
  useGetAggregateByIdQuery,
  useGetMultipleByIdQuery,
  useGetStatsForListingsQuery,
  useGetBuyOrderListingsQuery,
  useRefreshMarketListingMutation,
  usePurchaseMarketListingMutation,
  useTrackMarketListingViewMutation,
  useGetMarketListingOrdersQuery,
  useCreateBuyOrderMutation,
  useCancelBuyOrderMutation,
  useFulfillBuyOrderMutation,
  useGetAggregateChartQuery,
  useGetAggregateHistoryQuery,
  useUpdateAggregateAdminMutation,
  useUpdateListingQuantityMutation,
  useCreateMarketListingMutation,
  useGetGameItemByNameQuery,
  useUploadListingPhotosMutation,
  useCreateAggregateListingMutation,
  useCreateMultipleListingMutation,
  useUpdateMultipleListingMutation,
  useUpdateMarketListingMutation,
  useCreateListingBidMutation,
  useAcceptBidMutation,
  useSearchMarketQuery,
  useMarketGetGameItemByNameQuery,
  useMarketRefreshListingMutation,
  useMarketUpdateListingMutation,
  useMarketCancelBuyOrderMutation,
  useMarketFulfillBuyOrderMutation,
  useMarketGetAggregateChartByIDQuery,
  useMarketGetAggregateHistoryByIDQuery,
  useMarketUpdateAggregateAdminMutation,
  useMarketUploadListingPhotosMutation,
  useMarketCreateAggregateListingMutation,
  useMarketCreateMultipleListingMutation,
  useMarketGetMyListingsQuery,
  useMarketUpdateMultipleListingMutation,
  useMarketTrackListingViewMutation,
  useMarketGetListingOrdersQuery,
} from "./api/marketApi"

// Stock Lots API
export {
  stockLotsApi,
  useGetListingLotsQuery,
  useCreateLotMutation,
  useUpdateLotMutation,
  useDeleteLotMutation,
  useTransferLotMutation,
  useGetLocationsQuery,
  useCreateLocationMutation,
} from "../../store/api/stockLotsApi"
export type {
  StockLot,
  Location,
  StockAggregates,
} from "../../store/api/stockLotsApi"

// Hooks
export {
  marketDrawerWidth,
  MarketSidebarContext,
  useMarketSidebar,
  useMarketSidebarExp,
} from "./hooks/MarketSidebar"
export { MarketSearchContext, useMarketSearch } from "./hooks/MarketSearch"
export {
  BulkListingToolContext,
  useBulkListingTool,
} from "./hooks/BulkListingTool"
export {
  CurrentMarketAggregateContext,
  useCurrentMarketAggregate,
} from "./hooks/CurrentMarketAggregate"
export {
  CurrentMarketListingContext,
  useCurrentMarketListing,
} from "./hooks/CurrentMarketItem"
export { useMarketFilters } from "./hooks/useMarketFilters"

// Components
export { MarketPage } from "./components/MarketPage"
export { ItemMarketView } from "./components/ItemMarketView"
export {
  MarketSidebar,
  MarketSearchArea,
  MarketSideBarToggleButton,
} from "./components/MarketSidebar"
export { MarketAggregateEditView } from "./components/MarketAggregateEditView"
export { MarketMultipleEditView } from "./components/MarketMultipleEditView"
export { MarketEditTemplate } from "./components/MarketEditTemplate"
export {
  MarketListingForm,
  AggregateMarketListingForm,
  MarketMultipleForm,
} from "./components/MarketListingForm"
export { BuyOrderForm } from "./components/BuyOrderForm"
export { Bids, BidRow, BidsHeadCells } from "./components/Bids"
export type { BidRowProps } from "./components/Bids"
export { OffersHeadCells } from "./components/Offers"
export type { OfferRowProps } from "./components/Offers"
export {
  ItemStockContext,
  MyItemStock,
  ManageStockArea,
} from "./components/ItemStock"
export { SimpleStockInput } from "./components/SimpleStockInput"
export type { SimpleStockInputProps } from "./components/SimpleStockInput"
export { ImageSearch } from "./components/ImageSearch"
export { PageSearch } from "./components/PageSearch"
export { SellMaterialsList } from "./components/SellMaterialsList"
export { kindIcons } from "./components/SellMaterialsList"
export { MarketActions, BuyOrderActions } from "./components/MarketActions"
export {
  MarketNavArea,
  MarketNavEntry,
  HideOnScroll,
} from "./components/MarketNavArea"
export { MarketPageNav } from "./components/MarketPageNav"
export {
  ListingRefreshButton,
  ItemListingBase,
  ItemListing,
} from "./components/listings/ListingCard"
export {
  AggregateListing,
  AggregateListingBase,
  AggregateBuyOrderListing,
  AggregateBuyOrderListingBase,
} from "./components/listings/AggregateListingCard"
export {
  MultipleListing,
  MultipleListingBase,
} from "./components/listings/MultipleListingCard"
export { ListingPagination } from "./components/listings/ListingPagination"
export type { ListingPaginationProps } from "./components/listings/ListingPagination"
export { useListingPagination } from "./hooks/useListingPagination"
export { AggregateLink } from "./components/AggregateLink"
export type { AggregateLinkProps } from "./components/AggregateLink"
