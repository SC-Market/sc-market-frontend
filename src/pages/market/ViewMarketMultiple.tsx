import { Link, Navigate, useParams } from "react-router-dom"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import React from "react"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { CurrentMarketListingContext } from "../../hooks/market/CurrentMarketItem"
import {
  useMarketGetListingByIDQuery,
  useMarketGetMultipleByIDQuery,
} from "../../store/market"
import { MarketListingView } from "../../views/market/MarketListingView"
import { Page } from "../../components/metadata/Page"
import { MarketListingEditView } from "../../views/market/MarketListingEditView"
import { Button, Grid } from "@mui/material"
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded"
import { BackArrow } from "../../components/button/BackArrow"
import { MarketMultipleView } from "../../views/market/MarketMultipleView"
import { useTranslation } from "react-i18next"
import {
  shouldRedirectTo404,
  shouldShowErrorPage,
} from "../../util/errorHandling"
import { ErrorPage } from "../errors/ErrorPage"

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

  const { data: listing, error, refetch } = useMarketGetMultipleByIDQuery(id!)

  return (
    <Page title={listing?.details?.title}>
      <ContainerGrid sidebarOpen={true} maxWidth={"xl"}>
        <Grid
          item
          container
          justifyContent={"space-between"}
          spacing={2}
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
        {listing && (
          <CurrentMarketListingContext.Provider value={[listing!, refetch]}>
            {(() => {
              return <MarketMultipleView />

              // if (order.data!.customer === profile.data?.username) {
              //     return <ManageOrderOwner/>
              // } else if (order.data!.assigned_to === profile.data?.username) {
              //     return <ManageOrderOrg/>
              // } else {
              //     return <ViewPublicOrder/>
              // }
            })()}
          </CurrentMarketListingContext.Provider>
        )}
        {/* TODO: Add a skeleton to this section */}
      </ContainerGrid>
    </Page>
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

  const { data: listing, error, refetch } = useMarketGetListingByIDQuery(id!)

  return (
    <Page title={listing?.details?.title}>
      <ContainerGrid sidebarOpen={true} maxWidth={"lg"}>
        <HeaderTitle>
          <BackArrow /> {t("market.editMarketListing")}
        </HeaderTitle>

        {shouldRedirectTo404(error) ? <Navigate to={"/404"} /> : null}
        {shouldShowErrorPage(error) ? <ErrorPage /> : null}
        {listing && (
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
        )}
        {/* TODO: Add a skeleton to this section */}
      </ContainerGrid>
    </Page>
  )
}
