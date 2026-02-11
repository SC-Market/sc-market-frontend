import React, { useCallback, useEffect, useMemo } from "react"
import { useCurrentOrg } from "../../../hooks/login/CurrentOrg"
import {
  useMarketGetMyListingsQuery,
  useMarketUpdateMultipleListingMutation,
  useSearchMarketListingsQuery,
} from ".."
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { MarkdownEditor } from "../../../components/markdown/Markdown"
import type { MarketMultiple, MarketMultipleBody } from "../domain/types"
import { Section } from "../../../components/paper/Section"
import { useCurrentMarketListing } from ".."
import { SelectGameCategory } from "../../../components/select/SelectGameItem"
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

export function MarketMultipleEditView() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const [current_listing] = useCurrentMarketListing<MarketMultiple>()

  const [state, setState] = React.useState<
    MarketMultipleBody & {
      multiple_id: string
    }
  >({
    default_listing_id: current_listing.default_listing.listing.listing_id,
    description: current_listing.details.description,
    item_type: current_listing.details.item_type,
    listings: current_listing.listings.map((l) => l.listing.listing_id),
    title: current_listing.details.title,
    multiple_id: current_listing.multiple_id,
  })

  useEffect(() => {
    setState((s) => ({
      default_listing_id: current_listing.default_listing.listing.listing_id,
      description: current_listing.details.description,
      item_type: current_listing.details.item_type,
      listings: current_listing.listings.map((l) => l.listing.listing_id),
      title: current_listing.details.title,
      multiple_id: current_listing.multiple_id,
    }))
  }, [current_listing])

  const [updateListing, { isLoading }] =
    useMarketUpdateMultipleListingMutation()

  const issueAlert = useAlertHook()

  const [currentOrg] = useCurrentOrg()

  const updateMarketListing = useCallback(
    async (event: unknown) => {
      updateListing(state)
        .unwrap()
        .then(() =>
          issueAlert({
            message: t("MarketMultipleEditView.submitted"),
            severity: "success",
          }),
        )
        .catch(issueAlert)

      return false
    },
    [
      updateListing,
      currentOrg?.spectrum_id,
      issueAlert,
      state,
      current_listing,
      t,
    ],
  )

  const { data: currentListingsUnique } = useSearchMarketListingsQuery({
    contractor_seller: currentOrg?.spectrum_id,
    page_size: 96,
    listing_type: "unique",
    sale_type: "sale",
  })
  const listingOptions = currentListingsUnique?.listings || []

  return (
    <>
      <Section xs={12}>
        <Grid item xs={12} lg={4}>
          <Typography
            variant={"h6"}
            align={"left"}
            color={"text.secondary"}
            sx={{ fontWeight: "bold" }}
          >
            {t("MarketMultipleEditView.about")}
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          lg={8}
          container
          spacing={theme.layoutSpacing.layout}
        >
          <Grid item xs={12} lg={12}>
            <TextField
              fullWidth
              label={t("MarketMultipleEditView.title")}
              id="order-title"
              value={state.title}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setState({ ...state, title: event.target.value })
              }}
              color={"secondary"}
            />
          </Grid>

          <Grid item xs={12} lg={12}>
            <SelectGameCategory
              item_type={state.item_type}
              onTypeChange={(newValue) =>
                setState({ ...state, item_type: newValue })
              }
              TextfieldProps={{
                size: "small",
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <MarkdownEditor
              onChange={(value: string) => {
                setState({ ...state, description: value })
              }}
              value={state.description}
              TextFieldProps={{
                label: t("MarketMultipleEditView.description"),
                helperText: t("MarketMultipleEditView.helperText"),
              }}
              variant={"vertical"}
            />
          </Grid>
        </Grid>
      </Section>

      <Section xs={12}>
        <Grid item xs={12} lg={4}>
          <Typography
            variant={"h6"}
            align={"left"}
            color={"text.secondary"}
            sx={{ fontWeight: "bold" }}
          >
            {t("MarketMultipleEditView.listings")}
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          lg={8}
          container
          spacing={theme.layoutSpacing.layout}
        >
          <Grid item xs={12}>
            <Autocomplete
              disablePortal
              options={listingOptions}
              getOptionLabel={(option) => option.title}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("MarketMultipleEditView.defaultListing")}
                />
              )}
              filterSelectedOptions
              onChange={(event, value) =>
                setState((s) => {
                  if (value) {
                    if (state.listings!.includes(value.listing_id)) {
                      return {
                        ...s,
                        default_listing_id: value.listing_id,
                      }
                    } else {
                      state.listings!.push(value.listing_id)
                      return {
                        ...s,
                        default_listing_id: value.listing_id,
                        listings: s.listings,
                      }
                    }
                  } else {
                    return s
                  }
                })
              }
              value={
                listingOptions.find(
                  (l) => l.listing_id === state.default_listing_id,
                ) || null
              }
              color={"secondary"}
            />
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              multiple
              disablePortal
              options={listingOptions}
              getOptionLabel={(option) => option.title}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("MarketMultipleEditView.includeListings")}
                />
              )}
              onChange={(event, value) =>
                setState((s) => ({
                  ...s,
                  listings: value.map((l) => l.listing_id),
                }))
              }
              value={state.listings
                .map((r) => listingOptions.find((l) => l.listing_id === r)!)
                .filter((l) => l)}
              color={"secondary"}
            />
          </Grid>
        </Grid>
      </Section>
      <Grid item xs={12} container justifyContent={"right"}>
        <Button
          size={"large"}
          variant="contained"
          color={"secondary"}
          type="submit"
          onClick={() => updateMarketListing(null)}
          disabled={isLoading}
        >
          {t("MarketMultipleEditView.update")}
        </Button>
      </Grid>
    </>
  )
}
