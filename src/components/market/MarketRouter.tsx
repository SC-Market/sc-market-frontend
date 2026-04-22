import React from "react"
import { CircularProgress, Box, Grid } from "@mui/material"
import { useFeatureFlag } from "../../hooks/market/useFeatureFlag"
import { useTranslation } from "react-i18next"

const MarketPageV1 = React.lazy(() =>
  import("../../features/market/components/MarketPage").then((module) => ({
    default: module.MarketPage,
  })),
)

const MarketPageV2 = React.lazy(() =>
  import("./v2/MarketPageV2").then((module) => ({
    default: module.MarketPageV2,
  })),
)

// V2 standalone pages
const ListingDetailV2 = React.lazy(() => import("../../features/market/v2/ListingDetailV2").then(m => ({ default: m.ListingDetailV2 })))
const CreateListingV2 = React.lazy(() => import("../../features/market/v2/CreateListingV2").then(m => ({ default: m.CreateListingV2 })))
const EditListingV2 = React.lazy(() => import("../../features/market/v2/EditListingV2").then(m => ({ default: m.EditListingV2 })))
const MyListingsV2 = React.lazy(() => import("../../features/market/v2/MyListingsV2").then(m => ({ default: m.MyListingsV2 })))
const MarketCartV2 = React.lazy(() => import("../../features/market/v2/MarketCartV2").then(m => ({ default: m.MarketCartV2 })))
const StockManagerV2 = React.lazy(() => import("../../features/market/v2/StockManagerV2").then(m => ({ default: m.StockManagerV2 })))
const BulkStockManagementV2 = React.lazy(() => import("../../features/market/v2/BulkStockManagementV2").then(m => ({ default: m.BulkStockManagementV2 })))
const ManageListingsTabBar = React.lazy(() => import("../../features/market/components/ManageListingsTabBar").then(m => ({ default: m.ManageListingsTabBar })))
const StandardPageLayout = React.lazy(() => import("../layout/StandardPageLayout").then(m => ({ default: m.StandardPageLayout })))

function ManageStockV2Wrapper() {
  const { t } = useTranslation()
  return (
    <React.Suspense fallback={<MarketLoadingFallback />}>
      <StandardPageLayout
        title={t("sidebar.manage_listings", "Manage Listings")}
        headerTitle={
          <ManageListingsTabBar title={t("sidebar.manage_listings", "Manage Listings")} />
        }
        breadcrumbs={[
          { label: t("sidebar.market_short", "Market"), href: "/market" },
          { label: t("sidebar.manage_listings", "Manage Listings") },
        ]}
        sidebarOpen={true}
        maxWidth="xl"
      >
        <Grid item xs={12}>
          <StockManagerV2 listingId="" itemId="" />
        </Grid>
      </StandardPageLayout>
    </React.Suspense>
  )
}

function ManageStockLotsV2Wrapper() {
  const { t } = useTranslation()
  return (
    <React.Suspense fallback={<MarketLoadingFallback />}>
      <StandardPageLayout
        title={t("sidebar.manage_stock", "Manage Stock")}
        headerTitle={
          <ManageListingsTabBar title={t("sidebar.manage_stock", "Manage Stock")} />
        }
        breadcrumbs={[
          { label: t("sidebar.market_short", "Market"), href: "/market" },
          { label: t("sidebar.manage_stock", "Manage Stock") },
        ]}
        sidebarOpen={true}
        maxWidth="xl"
      >
        <Grid item xs={12}>
          <BulkStockManagementV2 listingId="" itemId="" />
        </Grid>
      </StandardPageLayout>
    </React.Suspense>
  )
}
const MarketAggregateViewV2 = React.lazy(() => import("../../features/market/v2/MarketAggregateViewV2").then(m => ({ default: m.MarketAggregateViewV2 })))
const MarketMultipleViewV2 = React.lazy(() => import("../../features/market/v2/MarketMultipleViewV2").then(m => ({ default: m.MarketMultipleViewV2 })))
const BuyOrdersViewV2 = React.lazy(() => import("../../features/market/v2/BuyOrdersViewV2").then(m => ({ default: m.BuyOrdersViewV2 })))

function MarketLoadingFallback() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
      <CircularProgress />
    </Box>
  )
}

/**
 * MarketRouter – switches between V1 and V2 market tabbed page.
 */
export function MarketRouter() {
  const { marketVersion, isLoading, error } = useFeatureFlag()

  if (isLoading) return <MarketLoadingFallback />

  const V = !error && marketVersion === "V2" ? MarketPageV2 : MarketPageV1

  return (
    <React.Suspense fallback={<MarketLoadingFallback />}>
      <V />
    </React.Suspense>
  )
}

/**
 * V2Gate – renders V2 component when flag is V2, otherwise renders V1 children.
 * Use in App.tsx route definitions to make individual pages V2-aware.
 */
export function V2Gate({ v1, v2 }: { v1: React.ComponentType; v2: React.LazyExoticComponent<React.ComponentType> }) {
  const { marketVersion, isLoading, error } = useFeatureFlag()

  if (isLoading) return <MarketLoadingFallback />

  const Component = !error && marketVersion === "V2" ? v2 : v1

  return (
    <React.Suspense fallback={<MarketLoadingFallback />}>
      <Component />
    </React.Suspense>
  )
}

// V1 page components (lazy, module-scope to prevent remounts)
const ViewMarketListingV1 = React.lazy(() => import("../../pages/market/ViewMarketListing").then(m => ({ default: m.ViewMarketListing })))
const ViewMarketAggregateV1 = React.lazy(() => import("../../pages/market/ViewMarketAggregate").then(m => ({ default: m.ViewMarketAggregate })))
const ViewMarketMultipleV1 = React.lazy(() => import("../../pages/market/ViewMarketMultiple").then(m => ({ default: m.ViewMarketMultiple })))
const MarketCreateV1 = React.lazy(() => import("../../pages/market/MarketCreate").then(m => ({ default: m.MarketCreate })))
const MyMarketListingsV1 = React.lazy(() => import("../../pages/market/MyMarketListings").then(m => ({ default: m.MyMarketListings })))
const MarketCartV1 = React.lazy(() => import("../../pages/market/MarketCart").then(m => ({ default: m.MarketCart })))
const ManageStockV1 = React.lazy(() => import("../../pages/market/ManageStock").then(m => ({ default: m.ManageStock })))
const ManageStockLotsV1 = React.lazy(() => import("../../pages/market/ManageStockLots").then(m => ({ default: m.ManageStockLots })))
const EditMarketListingV1 = React.lazy(() => import("../../pages/market/ViewMarketListing").then(m => ({ default: m.EditMarketListing })))
const EditMultipleListingV1 = React.lazy(() => import("../../pages/market/ViewMarketListing").then(m => ({ default: m.EditMultipleListing })))
const CreateBuyOrderV1 = React.lazy(() => import("../../pages/market/CreateBuyOrder").then(m => ({ default: m.CreateBuyOrder })))

// Pre-built gates for App.tsx route definitions
export const ListingDetailGate = () => <V2Gate v1={ViewMarketListingV1} v2={ListingDetailV2} />
export const AggregateDetailGate = () => <V2Gate v1={ViewMarketAggregateV1} v2={MarketAggregateViewV2} />
export const MultipleDetailGate = () => <V2Gate v1={ViewMarketMultipleV1} v2={MarketMultipleViewV2} />
export const CreateListingGate = () => <V2Gate v1={MarketCreateV1} v2={CreateListingV2} />
export const MyListingsGate = () => <V2Gate v1={MyMarketListingsV1} v2={MyListingsV2} />
export const MarketCartGate = () => <V2Gate v1={MarketCartV1} v2={MarketCartV2} />
export const EditListingGate = () => <V2Gate v1={EditMarketListingV1} v2={EditListingV2} />
export const EditMultipleGate = () => <V2Gate v1={EditMultipleListingV1} v2={EditListingV2} />
export const CreateBuyOrderGate = () => <V2Gate v1={CreateBuyOrderV1} v2={BuyOrdersViewV2} />
export const ManageStockGate = () => {
  const { marketVersion } = useFeatureFlag()
  if (marketVersion === "V2") return (
    <React.Suspense fallback={<MarketLoadingFallback />}>
      <ManageStockV2Wrapper />
    </React.Suspense>
  )
  return <React.Suspense fallback={<MarketLoadingFallback />}><ManageStockV1 /></React.Suspense>
}
export const ManageStockLotsGate = () => {
  const { marketVersion } = useFeatureFlag()
  if (marketVersion === "V2") return (
    <React.Suspense fallback={<MarketLoadingFallback />}>
      <ManageStockLotsV2Wrapper />
    </React.Suspense>
  )
  return <React.Suspense fallback={<MarketLoadingFallback />}><ManageStockLotsV1 /></React.Suspense>
}
