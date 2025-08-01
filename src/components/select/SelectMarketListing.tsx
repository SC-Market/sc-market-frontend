import { Autocomplete, TextField, TextFieldProps } from "@mui/material"
import React, { useMemo } from "react"
import { useMarketGetMyListingsQuery } from "../../store/market"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { UniqueListing } from "../../datatypes/MarketListing"
import { useTranslation } from "react-i18next"

export interface SelectMarketListingProps {
  listing_id: string | null
  onListingChange: (newValue: UniqueListing | null) => void
  TextfieldProps?: TextFieldProps
}

export function SelectMarketListing(props: SelectMarketListingProps) {
  const { t } = useTranslation()
  const [currentOrg] = useCurrentOrg()
  const { data: listings } = useMarketGetMyListingsQuery(
    currentOrg?.spectrum_id,
  )

  // Filter out multiple listings and only show unique listings
  const uniqueListings = useMemo(() => {
    return (listings || [])
      .filter((listing) => listing.type === "unique")
      .map((listing) => listing as UniqueListing)
  }, [listings])

  const selectedListing = useMemo(() => {
    if (!props.listing_id) return null
    return (
      uniqueListings.find(
        (listing) => listing.listing.listing_id === props.listing_id,
      ) || null
    )
  }, [uniqueListings, props.listing_id])

  const getOptionLabel = (option: UniqueListing) => {
    const details = option.details
    return `${details.item_type} / ${details.item_name || details.title}`
  }

  return (
    <Autocomplete
      fullWidth
      options={uniqueListings}
      value={selectedListing}
      onChange={(event, value) => {
        if (value) {
          props.onListingChange(value)
        } else {
          props.onListingChange(null)
        }
      }}
      getOptionLabel={getOptionLabel}
      renderInput={(params) => (
        <TextField
          {...params}
          label={t("selectMarketListing.label", "Select Market Listing")}
          {...props.TextfieldProps}
        />
      )}
      isOptionEqualToValue={(option, value) => {
        return option.listing.listing_id === value.listing.listing_id
      }}
    />
  )
}
