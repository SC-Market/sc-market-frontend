import { Navigate, useParams } from "react-router-dom"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import React from "react"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { useMarketGetAggregateByIDQuery } from "../../store/market"
import { Page } from "../../components/metadata/Page"
import { Link } from "react-router-dom"
import { Button, Grid } from "@mui/material"
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded"
import { CurrentMarketAggregateContext } from "../../hooks/market/CurrentMarketAggregate"
import { MarketAggregateEditView } from "../../views/market/MarketAggregateEditView"
import { MarketAggregateView } from "../../views/market/MarketAggregateView"
import { BackArrow } from "../../components/button/BackArrow"
import { CurrentMarketListingContext } from "../../hooks/market/CurrentMarketItem"

export function ViewMarketAggregate(props: {}) {
  const { id } = useParams<{ id: string }>()

  const {
    data: aggregate,
    error,
    refetch,
  } = useMarketGetAggregateByIDQuery(id!)

  return (
    <Page title={aggregate?.details?.title}>
      <ContainerGrid sidebarOpen={true} maxWidth={"lg"}>
        <Grid
          item
          container
          justifyContent={"space-between"}
          spacing={2}
          xs={12}
        >
          <HeaderTitle md={7} lg={7} xl={7}>
            <BackArrow /> View Market Listing
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
                My Cart
              </Button>
            </Link>
          </Grid>
        </Grid>

        {error ? <Navigate to={"/404"} /> : null}
        {aggregate && (
          <CurrentMarketListingContext.Provider value={[aggregate!, refetch]}>
            <MarketAggregateView />
          </CurrentMarketListingContext.Provider>
        )}
        {/* TODO: Add a skeleton to this section */}
      </ContainerGrid>
    </Page>
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

  const {
    data: aggregate,
    error,
    refetch,
  } = useMarketGetAggregateByIDQuery(id!)

  return (
    <Page title={aggregate?.details?.title}>
      <ContainerGrid sidebarOpen={true} maxWidth={"lg"}>
        <HeaderTitle>
          <BackArrow /> Edit Market Listing
        </HeaderTitle>

        {error ? <Navigate to={"/404"} /> : null}
        {aggregate && (
          <CurrentMarketAggregateContext.Provider value={[aggregate!, refetch]}>
            <MarketAggregateEditView />
          </CurrentMarketAggregateContext.Provider>
        )}
        {/* TODO: Add a skeleton to this section */}
      </ContainerGrid>
    </Page>
  )
}
