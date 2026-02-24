import { Autocomplete, TextField, TextFieldProps } from "@mui/material"
import React, { useMemo } from "react"
import { useSearchListingsQuery } from "../../store/api/v2/market"
import type { ListingSearchResult } from "../../store/api/v2/market"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useTranslation } from "react-i18next"

export interface SelectMarketListingProps {
  listing_id: string | null
  onListingChange: (newValue: ListingSearchResult | null) => void
  TextfieldProps?: TextFieldProps
}

export function SelectMarketListing(props: SelectMarketListingProps) {
  const { t } = useTranslation()
  const [currentOrg] = useCurrentOrg()
  const { data: results } = useSearchListingsQuery({
    contractorSellerId: currentOrg?.spectrum_id,
    listingType: "unique",
  })

  // Use v2 types directly - they accurately reflect the database schema
  const listings = (results?.listings || []) as ListingSearchResult[]

  const selectedListing = useMemo(() => {
    if (!props.listing_id) return null
    return (
      listings.find((listing) => listing.listing_id === props.listing_id) ||
      null
    )
  }, [listings, props.listing_id])

  const getOptionLabel = (option: ListingSearchResult) => {
    return `${option.item_type} / ${option.item_name || option.title}`
  }

  return (
    <Autocomplete
      fullWidth
      options={listings}
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
        return option.listing_id === value.listing_id
      }}
    />
  )
}
