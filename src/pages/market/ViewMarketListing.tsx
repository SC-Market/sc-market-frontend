import { Link, Navigate, useParams } from "react-router-dom"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import React from "react"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { CurrentMarketListingContext } from "../../features/market"
import {
  useGetMarketListingQuery,
  useGetMultipleByIdQuery,
} from "../../features/market"
import { MarketListingView } from "../../views/market/MarketListingView"
import { MarketListingViewSkeleton } from "../../views/market/MarketListingView"
import { Page } from "../../components/metadata/Page"
import { MarketListingEditView } from "../../views/market/MarketListingEditView"
import { Button, Grid } from "@mui/material"
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded"
import { BackArrow } from "../../components/button/BackArrow"
import { MarketMultipleEditView } from "../../features/market/components/MarketMultipleEditView"
import { formatCompleteListingUrl, formatMarketUrl } from "../../util/urls"
import { useTranslation } from "react-i18next"
import {
  shouldRedirectTo404,
  shouldShowErrorPage,
} from "../../util/errorHandling"
import { ErrorPage } from "../errors/ErrorPage"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function ViewMarketListing() {
  const { id } = useParams<{ id: string }>()
  const theme = useTheme<ExtendedTheme>()

  /*
   * TODO:
   *   Contract appliants
   *   Accept applicant, update order status,
   *   order comments, update date,
   *   assigned person, payment
   */

  const { t } = useTranslation()

  const {
    data: listing,
    error,
    refetch,
    isLoading,
  } = useGetMarketListingQuery(id!)

  return (
    <Page
      title={listing?.details?.title}
      canonUrl={listing && formatCompleteListingUrl(listing)}
    >
      <ContainerGrid sidebarOpen={true} maxWidth={"xl"}>
        <Grid
          item
          container
          justifyContent={"space-between"}
          spacing={theme.layoutSpacing.layout}
          xs={12}
        >
          <HeaderTitle md={7} lg={7} xl={7}>
            <BackArrow /> {t("market.viewMarketListing")}
          </HeaderTitle>

          <Grid item>
            <Link
              to={"/market/cart"}
              style={{ color: "inherit", textDecoration: "none" }}
            >
              <Button
                color={"secondary"}
                startIcon={<ShoppingCartRoundedIcon />}
                variant={"contained"}
                size={"large"}
              >
                {t("marketActions.myCart")}
              </Button>
            </Link>
          </Grid>
        </Grid>

        {shouldRedirectTo404(error) ? <Navigate to={"/404"} /> : null}
        {shouldShowErrorPage(error) ? <ErrorPage /> : null}
        {isLoading ? (
          <MarketListingViewSkeleton />
        ) : listing ? (
          <CurrentMarketListingContext.Provider value={[listing!, refetch]}>
            {(() => {
              return <MarketListingView />

              // if (order.data!.customer === profile.data?.username) {
              //     return <ManageOrderOwner/>
              // } else if (order.data!.assigned_to === profile.data?.username) {
              //     return <ManageOrderOrg/>
              // } else {
              //     return <ViewPublicOrder/>
              // }
            })()}
          </CurrentMarketListingContext.Provider>
        ) : null}
      </ContainerGrid>
    </Page>
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

  const {
    data: listing,
    error,
    refetch,
    isLoading,
  } = useGetMarketListingQuery(id!)

  return (
    <Page title={listing?.details?.title}>
      <ContainerGrid sidebarOpen={true} maxWidth={"lg"}>
        <HeaderTitle>
          <BackArrow /> {t("market.editMarketListing")}
        </HeaderTitle>

        {shouldRedirectTo404(error) ? <Navigate to={"/404"} /> : null}
        {shouldShowErrorPage(error) ? <ErrorPage /> : null}
        {isLoading ? (
          <MarketListingViewSkeleton />
        ) : listing ? (
          <CurrentMarketListingContext.Provider value={[listing!, refetch]}>
            {(() => {
              return <MarketListingEditView />

              // if (order.data!.customer === profile.data?.username) {
              //     return <ManageOrderOwner/>
              // } else if (order.data!.assigned_to === profile.data?.username) {
              //     return <ManageOrderOrg/>
              // } else {
              //     return <ViewPublicOrder/>
              // }
            })()}
          </CurrentMarketListingContext.Provider>
        ) : null}
      </ContainerGrid>
    </Page>
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
    <Page title={listing?.details?.title}>
      <ContainerGrid sidebarOpen={true} maxWidth={"lg"}>
        <HeaderTitle>
          <BackArrow /> {t("market.editMultipleListing")}
        </HeaderTitle>

        {shouldRedirectTo404(error) ? <Navigate to={"/404"} /> : null}
        {shouldShowErrorPage(error) ? <ErrorPage /> : null}
        {isLoading ? (
          <MarketListingViewSkeleton />
        ) : listing ? (
          <CurrentMarketListingContext.Provider value={[listing!, refetch]}>
            {(() => {
              return <MarketMultipleEditView />

              // if (order.data!.customer === profile.data?.username) {
              //     return <ManageOrderOwner/>
              // } else if (order.data!.assigned_to === profile.data?.username) {
              //     return <ManageOrderOrg/>
              // } else {
              //     return <ViewPublicOrder/>
              // }
            })()}
          </CurrentMarketListingContext.Provider>
        ) : null}
      </ContainerGrid>
    </Page>
  )
}
