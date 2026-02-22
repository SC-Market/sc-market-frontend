import { lazy } from "react"
import { useParams } from "react-router-dom"
import React from "react"
import { Link } from "react-router-dom"
import { Button, Grid } from "@mui/material"
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded"
import { CurrentMarketListingContext } from "../../features/market/hooks/CurrentMarketItem"
import { CurrentMarketAggregateContext } from "../../features/market/hooks/CurrentMarketAggregate"
import { MarketListingViewSkeleton } from "../../features/market/views/MarketListingView"
import { useTranslation } from "react-i18next"
import { DetailPageLayout } from "../../components/layout/DetailPageLayout"
import { LazySection } from "../../components/layout/LazySection"
import { usePageMarketAggregate } from "../../features/market/hooks/usePageMarketAggregate"

const MarketAggregateViewLazy = lazy(() =>
  import("../../features/market/views/MarketAggregateView").then((m) => ({
    default: m.MarketAggregateView,
  })),
)

const MarketAggregateEditViewLazy = lazy(() =>
  import("../../features/market/components/MarketAggregateEditView").then(
    (m) => ({
      default: m.MarketAggregateEditView,
    }),
  ),
)

// Skeleton is NOT lazy loaded - needs to be available immediately
const SkeletonComponent = MarketListingViewSkeleton

export function ViewMarketAggregate(props: {}) {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const pageData = usePageMarketAggregate(id!)

  return (
    <DetailPageLayout
      title={pageData.data?.aggregate.details?.title}
      breadcrumbs={[
        { label: t("market_short"), href: "/market" },
        {
          label:
            pageData.data?.aggregate.details?.title ||
            t("market.viewMarketListing", "Listing"),
        },
      ]}
      entityTitle={pageData.data?.aggregate.details?.title}
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
          value={[pageData.data.aggregate, pageData.refetch]}
        >
          <Grid container spacing={2}>
            <LazySection
              component={MarketAggregateViewLazy}
              componentProps={{}}
              skeleton={SkeletonComponent}
            />
          </Grid>
        </CurrentMarketListingContext.Provider>
      )}
    </DetailPageLayout>
  )
}

export function EditMarketAggregate(props: {}) {
  const { id } = useParams<{ id: string }>()

  /*
   * TODO:
   *   Contract appliants
   *   Accept applicant, update order status,
   *   order comments, update date,
   *   assigned person, payment
   */
  const { t } = useTranslation()
  const pageData = usePageMarketAggregate(id!)

  return (
    <DetailPageLayout
      title={pageData.data?.aggregate.details?.title}
      breadcrumbs={[
        { label: t("market_short"), href: "/market" },
        {
          label:
            pageData.data?.aggregate.details?.title ||
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
        <CurrentMarketAggregateContext.Provider
          value={[pageData.data.aggregate, pageData.refetch]}
        >
          <Grid container spacing={2}>
            <LazySection
              component={MarketAggregateEditViewLazy}
              componentProps={{}}
              skeleton={SkeletonComponent}
            />
          </Grid>
        </CurrentMarketAggregateContext.Provider>
      )}
    </DetailPageLayout>
  )
}
