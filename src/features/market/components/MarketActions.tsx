import { Link } from "react-router-dom"
import React, { useCallback, useContext } from "react"
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded"
import { ItemStockContext, ManageStockArea } from ".."
import { MarketListingUpdateBody, UniqueListing } from "../domain/types"
import { useUpdateMarketListingMutation } from "../api/marketApi"
import LoadingButton from "@mui/lab/LoadingButton"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"

import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme1 from '@mui/material/styles';
import Breakpoint from '@mui/material/styles';
import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import MaterialLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Divider from '@mui/material/Divider';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import ButtonBase from '@mui/material/ButtonBase';
import CardMedia from '@mui/material/CardMedia';
import Modal from '@mui/material/Modal';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import StorefrontRounded from '@mui/icons-material/StorefrontRounded';
import LinkRounded from '@mui/icons-material/LinkRounded';
import AddRounded from '@mui/icons-material/AddRounded';
import RemoveRounded from '@mui/icons-material/RemoveRounded';
import SaveRounded from '@mui/icons-material/SaveRounded';
import InventoryRounded from '@mui/icons-material/InventoryRounded';
import RadioButtonCheckedRounded from '@mui/icons-material/RadioButtonCheckedRounded';
import RadioButtonUncheckedRounded from '@mui/icons-material/RadioButtonUncheckedRounded';

export function MarketActions() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  return (
    <Grid
      container
      spacing={theme.layoutSpacing.component}
      direction={{ xs: "row", sm: "row" }}
      justifyContent={{ xs: "stretch", sm: "flex-end" }}
    >
      <Grid item xs={6} sm="auto">
        <Link
          to={"/market/create"}
          style={{ color: "inherit", textDecoration: "none", display: "block" }}
        >
          <Button
            color={"secondary"}
            startIcon={<CreateRounded />}
            variant={"contained"}
            size={isMobile ? "medium" : "large"}
            fullWidth={isMobile}
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

      <Grid item xs={6} sm="auto">
        <Link
          to={"/market/cart"}
          style={{ color: "inherit", textDecoration: "none", display: "block" }}
        >
          <Button
            color={"primary"}
            startIcon={<ShoppingCartRoundedIcon />}
            variant={"contained"}
            size={isMobile ? "medium" : "large"}
            fullWidth={isMobile}
            title={t("marketActions.myCartTooltip", "View your shopping cart")}
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
