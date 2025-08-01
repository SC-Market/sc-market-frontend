import { Link } from "react-router-dom"
import { Button, Grid } from "@mui/material"
import {
  CreateRounded,
  RadioButtonCheckedRounded,
  RadioButtonUncheckedRounded,
} from "@mui/icons-material"
import React, { useCallback, useContext } from "react"
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded"
import { ItemStockContext, ManageStockArea } from "../../views/market/ItemStock"
import {
  MarketListingUpdateBody,
  UniqueListing,
} from "../../datatypes/MarketListing"
import { useMarketUpdateListingMutation } from "../../store/market"
import LoadingButton from "@mui/lab/LoadingButton"
import { useTranslation } from "react-i18next" // added

export function MarketActions() {
  const { t } = useTranslation() // added

  return (
    <Grid item>
      <Grid container spacing={2}>
        <Grid item>
          <Link
            to={"/market/create"}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            <Button
              color={"secondary"}
              startIcon={<CreateRounded />}
              variant={"contained"}
              size={"large"}
              title={t(
                "marketActions.createListingTooltip",
                "Create a new listing",
              )} // added
            >
              {t("marketActions.createListing", "Create Listing")}
            </Button>
          </Link>
        </Grid>

        <Grid item>
          <Link
            to={"/market/cart"}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            <Button
              color={"primary"}
              startIcon={<ShoppingCartRoundedIcon />}
              variant={"contained"}
              size={"large"}
              title={t(
                "marketActions.myCartTooltip",
                "View your shopping cart",
              )} // added
            >
              {t("marketActions.myCart", "My Cart")}
            </Button>
          </Link>
        </Grid>
      </Grid>
    </Grid>
  )
}

export function ManageListingsActions() {
  const { t } = useTranslation() // added
  const [selectedListings] = useContext(ItemStockContext)!

  const [updateListing, { isLoading }] = useMarketUpdateListingMutation()
  const updateListingCallback = useCallback(
    async (body: MarketListingUpdateBody) => {
      selectedListings.forEach((listing) => {
        updateListing({
          listing_id: listing.listing.listing_id,
          body,
        })
      })
    },
    [selectedListings, updateListing],
  )

  return (
    <Grid item>
      <Grid container spacing={1} alignItems={"center"}>
        <Grid item>
          <LoadingButton
            color={"success"}
            startIcon={<RadioButtonCheckedRounded />}
            variant={"outlined"}
            size={"large"}
            loading={isLoading}
            onClick={() => {
              updateListingCallback({ status: "active" })
            }}
            title={t(
              "manageListingsActions.activateTooltip",
              "Activate selected listings",
            )} // added
          >
            {t("manageListingsActions.activateListings", "Activate Listings")}
          </LoadingButton>
        </Grid>

        <Grid item>
          <LoadingButton
            color={"error"}
            startIcon={<RadioButtonUncheckedRounded />}
            variant={"outlined"}
            size={"large"}
            loading={isLoading}
            onClick={() => {
              updateListingCallback({ status: "inactive" })
            }}
            title={t(
              "manageListingsActions.deactivateTooltip",
              "Deactivate selected listings",
            )} // added
          >
            {t(
              "manageListingsActions.deactivateListings",
              "Deactivate Listings",
            )}
          </LoadingButton>
        </Grid>

        <Grid item>
          <ManageStockArea listings={selectedListings as UniqueListing[]} />
        </Grid>
      </Grid>
    </Grid>
  )
}

export function BuyOrderActions() {
  const { t } = useTranslation() // added

  return (
    <Grid item>
      <Grid container spacing={2}>
        <Grid item>
          <Link
            to={"/buyorder/create"}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            <Button
              color={"secondary"}
              startIcon={<CreateRounded />}
              variant={"contained"}
              size={"large"}
              title={t(
                "buyOrderActions.createBuyOrderTooltip",
                "Create a new buy order",
              )} // added
            >
              {t("buyOrderActions.createBuyOrder", "Create Buy Order")}
            </Button>
          </Link>
        </Grid>
      </Grid>
    </Grid>
  )
}
