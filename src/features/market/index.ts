// Side-effect: register market API endpoints with serviceApi
import "./api/marketApi"

import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Avatar from '@mui/material/Avatar';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Skeleton from '@mui/material/Skeleton';
import { SkeletonProps } from '@mui/material/Skeleton';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import CardActions from '@mui/material/CardActions';
import Chip from '@mui/material/Chip';
import CardActionArea from '@mui/material/CardActionArea';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Fade from '@mui/material/Fade';
import CardMedia from '@mui/material/CardMedia';
import ListItemButton from '@mui/material/ListItemButton';
import AvatarGroup from '@mui/material/AvatarGroup';
import Checkbox from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import TableHead from '@mui/material/TableHead';
import { Theme } from '@mui/material/styles';
import TableSortLabel from '@mui/material/TableSortLabel';
import { TypographyProps } from '@mui/material/Typography';
import TablePagination from '@mui/material/TablePagination';
import { GridProps } from '@mui/material/Grid';
import SecurityRounded from '@mui/icons-material/SecurityRounded';
import AssignmentTurnedInRounded from '@mui/icons-material/AssignmentTurnedInRounded';
import CableRounded from '@mui/icons-material/CableRounded';
import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';
import CloudDownloadRounded from '@mui/icons-material/CloudDownloadRounded';
import DashboardCustomizeRounded from '@mui/icons-material/DashboardCustomizeRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import HomeRounded from '@mui/icons-material/HomeRounded';
import InventoryRounded from '@mui/icons-material/InventoryRounded';
import ListAltRounded from '@mui/icons-material/ListAltRounded';
import ManageAccountsRounded from '@mui/icons-material/ManageAccountsRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import RequestQuoteRounded from '@mui/icons-material/RequestQuoteRounded';
import ShieldRounded from '@mui/icons-material/ShieldRounded';
import StoreRounded from '@mui/icons-material/StoreRounded';
import WarehouseRounded from '@mui/icons-material/WarehouseRounded';

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
