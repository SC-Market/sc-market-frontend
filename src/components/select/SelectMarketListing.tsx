import { Autocomplete, TextField, TextFieldProps } from "@mui/material"
import React, { useMemo } from "react"
import {
  ExtendedUniqueSearchResult,
  useSearchMarketListingsQuery,
} from "../../features/market"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useTranslation } from "react-i18next"

export interface SelectMarketListingProps {
  listing_id: string | null
  onListingChange: (newValue: ExtendedUniqueSearchResult | null) => void
  TextfieldProps?: TextFieldProps
}

export function SelectMarketListing(props: SelectMarketListingProps) {
  const { t } = useTranslation()
  const [currentOrg] = useCurrentOrg()
  const { data: searchResults } = useSearchMarketListingsQuery({
    contractor_seller: currentOrg?.spectrum_id,
    listing_type: "unique",
  })

  const listings =
    (searchResults?.listings as ExtendedUniqueSearchResult[]) || []

  const selectedListing = useMemo(() => {
    if (!props.listing_id) return null
    return (
      listings.find((listing) => listing.listing_id === props.listing_id) ||
      null
    )
  }, [listings, props.listing_id])

  const getOptionLabel = (option: ExtendedUniqueSearchResult) => {
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
