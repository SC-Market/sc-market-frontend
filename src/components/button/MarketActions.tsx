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
import { useUpdateMarketListingMutation } from "../../store/market"
import LoadingButton from "@mui/lab/LoadingButton"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function MarketActions() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  return (
    <Grid item>
      <Grid container spacing={theme.layoutSpacing.layout}>
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
              )}
              aria-label={t(
                "accessibility.createMarketListing",
                "Create a new market listing",
              )}
              aria-describedby="create-listing-description"
            >
              {t("marketActions.createListing", "Create Listing")}
              <span id="create-listing-description" className="sr-only">
                {t(
                  "accessibility.createListingDescription",
                  "Navigate to the create listing page",
                )}
              </span>
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
              )}
              aria-label={t(
                "accessibility.viewShoppingCart",
                "View your shopping cart",
              )}
              aria-describedby="view-cart-description"
            >
              {t("marketActions.myCart", "My Cart")}
              <span id="view-cart-description" className="sr-only">
                {t(
                  "accessibility.viewCartDescription",
                  "Navigate to your shopping cart",
                )}
              </span>
            </Button>
          </Link>
        </Grid>
      </Grid>
    </Grid>
  )
}

export function BuyOrderActions() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  return (
    <Grid item>
      <Grid container spacing={theme.layoutSpacing.layout}>
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
              )}
            >
              {t("buyOrderActions.createBuyOrder", "Create Buy Order")}
            </Button>
          </Link>
        </Grid>
      </Grid>
    </Grid>
  )
}
