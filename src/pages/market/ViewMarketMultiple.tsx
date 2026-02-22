import { lazy } from "react"
import { Link, useParams } from "react-router-dom"
import React from "react"
import { CurrentMarketListingContext } from "../../features/market"
import { Button } from "@mui/material"
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded"
import { MarketListingViewSkeleton } from "../../features/market/views/MarketListingView"
import { useTranslation } from "react-i18next"
import { DetailPageLayout } from "../../components/layout/DetailPageLayout"
import { LazySection } from "../../components/layout/LazySection"
import { usePageMarketMultiple } from "../../features/market/hooks/usePageMarketMultiple"
import { usePageMarketListing } from "../../features/market/hooks/usePageMarketListing"

const MarketMultipleViewLazy = lazy(() =>
  import("../../features/market/views/MarketMultipleView").then((m) => ({
    default: m.MarketMultipleView,
  })),
)

const MarketListingEditViewLazy = lazy(() =>
  import("../../features/market/views/MarketListingEditView").then((m) => ({
    default: m.MarketListingEditView,
  })),
)

// Skeleton is NOT lazy loaded - needs to be available immediately
const SkeletonComponent = MarketListingViewSkeleton

export function ViewMarketMultiple(props: {}) {
  const { id } = useParams<{ id: string }>()

  /*
   * TODO:
   *   Contract appliants
   *   Accept applicant, update order status,
   *   order comments, update date,
   *   assigned person, payment
   */
  const { t } = useTranslation()
  const pageData = usePageMarketMultiple(id!)

  return (
    <DetailPageLayout
      title={pageData.data?.multiple.details?.title}
      breadcrumbs={[
        { label: t("market_short"), href: "/market" },
        {
          label:
            pageData.data?.multiple.details?.title ||
            t("market.viewMarketListing", "Listing"),
        },
      ]}
      entityTitle={pageData.data?.multiple.details?.title}
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
      skeleton={<SkeletonComponent />}
      sidebarOpen={true}
      maxWidth="xl"
    >
      {pageData.data && (
        <CurrentMarketListingContext.Provider
          value={[pageData.data.multiple, pageData.refetch]}
        >
          <LazySection
            component={MarketMultipleViewLazy}
            componentProps={{}}
            skeleton={SkeletonComponent}
          />
        </CurrentMarketListingContext.Provider>
      )}
    </DetailPageLayout>
  )
}

export function EditMarketMultiple(props: {}) {
  const { id } = useParams<{ id: string }>()

  /*
   * TODO:
   *   Contract appliants
   *   Accept applicant, update order status,
   *   order comments, update date,
   *   assigned person, payment
   */
  const { t } = useTranslation()
  const pageData = usePageMarketListing(id!)

  return (
    <DetailPageLayout
      title={pageData.data?.listing.details?.title}
      breadcrumbs={[
        { label: t("market_short"), href: "/market" },
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
      skeleton={<SkeletonComponent />}
      sidebarOpen={true}
      maxWidth="lg"
    >
      {pageData.data && (
        <CurrentMarketListingContext.Provider
          value={[pageData.data.listing, pageData.refetch]}
        >
          <LazySection
            component={MarketListingEditViewLazy}
            componentProps={{}}
            skeleton={SkeletonComponent}
          />
        </CurrentMarketListingContext.Provider>
      )}
    </DetailPageLayout>
  )
}
