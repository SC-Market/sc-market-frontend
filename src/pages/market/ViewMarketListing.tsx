import { Link, useParams } from "react-router-dom"
import { lazy } from "react"
import { CurrentMarketListingContext } from "../../features/market/hooks/CurrentMarketItem"
import { useGetMultipleByIdQuery } from "../../features/market/api/marketApi"
import { MarketListingViewSkeleton } from "../../features/market/views/MarketListingView"
import { MarketListingEditView } from "../../features/market/views/MarketListingEditView"
import { MarketMultipleEditView } from "../../features/market/components/MarketMultipleEditView"
import { Button } from "@mui/material"
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded"
import { formatCompleteListingUrl } from "../../util/urls"
import { useTranslation } from "react-i18next"
import { DetailPageLayout } from "../../components/layout/DetailPageLayout"
import { LazySection } from "../../components/layout/LazySection"
import { usePageMarketListing } from "../../features/market/hooks/usePageMarketListing"

// Lazy load the content component, but keep skeleton eager
const MarketListingView = lazy(() =>
  import("../../features/market/views/MarketListingView").then((module) => ({
    default: module.MarketListingView,
  })),
)

export function ViewMarketListing() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const pageData = usePageMarketListing(id!)

  return (
    <DetailPageLayout
      title={pageData.data?.listing.details?.title}
      canonicalUrl={
        pageData.data?.listing &&
        formatCompleteListingUrl(pageData.data.listing)
      }
      breadcrumbs={[
        { label: t("sidebar.market_short"), href: "/market" },
        {
          label:
            pageData.data?.listing.details?.title ||
            t("market.viewMarketListing", "Listing"),
        },
      ]}
      entityTitle={pageData.data?.listing.details?.title}
      entityActions={
        <Link
          to="/market/cart"
          style={{ color: "inherit", textDecoration: "none" }}
        >
          <Button
            color="secondary"
            startIcon={<ShoppingCartRoundedIcon />}
            variant="contained"
            size="large"
          >
            {t("marketActions.myCart")}
          </Button>
        </Link>
      }
      isLoading={pageData.isLoading}
      error={pageData.error}
      skeleton={<MarketListingViewSkeleton />}
      sidebarOpen={true}
      maxWidth="xl"
    >
      {pageData.data && (
        <CurrentMarketListingContext.Provider
          value={[pageData.data.listing, pageData.refetch]}
        >
          <LazySection
            component={MarketListingView}
            componentProps={{}}
            skeleton={MarketListingViewSkeleton}
          />
        </CurrentMarketListingContext.Provider>
      )}
    </DetailPageLayout>
  )
}

export function EditMarketListing() {
  /*
   * TODO:
   *   Contract appliants
   *   Accept applicant, update order status,
   *   order comments, update date,
   *   assigned person, payment
   */
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()

  const pageData = usePageMarketListing(id!)

  return (
    <DetailPageLayout
      title={pageData.data?.listing.details?.title}
      breadcrumbs={[
        { label: t("sidebar.market_short"), href: "/market" },
        {
          label:
            pageData.data?.listing.details?.title ||
            t("market.editMarketListing", "Edit Listing"),
        },
      ]}
      backButton={true}
      entityTitle={t("market.editMarketListing")}
      isLoading={pageData.isLoading}
      error={pageData.error}
      skeleton={<MarketListingViewSkeleton />}
      sidebarOpen={true}
      maxWidth="lg"
    >
      {pageData.data && (
        <CurrentMarketListingContext.Provider
          value={[pageData.data.listing, pageData.refetch]}
        >
          <MarketListingEditView />
        </CurrentMarketListingContext.Provider>
      )}
    </DetailPageLayout>
  )
}

export function EditMultipleListing() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()

  const {
    data: listing,
    error,
    refetch,
    isLoading,
  } = useGetMultipleByIdQuery(id!)

  return (
    <DetailPageLayout
      title={listing?.details?.title}
      breadcrumbs={[
        { label: t("sidebar.market_short"), href: "/market" },
        {
          label:
            listing?.details?.title ||
            t("market.editMultipleListing", "Edit Multiple Listing"),
        },
      ]}
      backButton={true}
      entityTitle={t("market.editMultipleListing")}
      isLoading={isLoading}
      error={error}
      skeleton={<MarketListingViewSkeleton />}
      sidebarOpen={true}
      maxWidth="lg"
    >
      {listing && (
        <CurrentMarketListingContext.Provider value={[listing, refetch]}>
          <MarketMultipleEditView />
        </CurrentMarketListingContext.Provider>
      )}
    </DetailPageLayout>
  )
}
