import React, { useCallback, useEffect, useMemo } from "react"
import {
  Autocomplete,
  Button,
  Grid,
  TextField,
  Typography,
} from "@mui/material"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import {
  useMarketGetMyListingsQuery,
  useMarketUpdateMultipleListingMutation,
  useSearchMarketListingsQuery,
} from "../../store/market"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { MarkdownEditor } from "../../components/markdown/Markdown"
import {
  MarketMultiple,
  MarketMultipleBody,
  MarketMultipleListingComposite,
  UniqueListing,
} from "../../datatypes/MarketListing"
import { Section } from "../../components/paper/Section"
import { useCurrentMarketListing } from "../../hooks/market/CurrentMarketItem"
import { SelectGameCategory } from "../../components/select/SelectGameItem"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

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
    async (event: any) => {
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
    // <FormControl component={Grid} item xs={12} container spacing={2}>
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
              onChange={(event: React.ChangeEvent<{ value: string }>) => {
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
              // multiple
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
          onClick={updateMarketListing}
          disabled={isLoading}
        >
          {t("MarketMultipleEditView.update")}
        </Button>
      </Grid>
    </>
    // </FormControl>
  )
}
