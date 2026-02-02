import {
  Autocomplete,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import React, { useState, useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { marketApi } from "../api/marketApi"
import { debounce } from "lodash"

interface ItemSearchAutocompleteProps {
  value: string | null
  onChange: (itemName: string | null, itemType: string | null) => void
  label?: string
  size?: "small" | "medium"
}

export function ItemSearchAutocomplete({
  value,
  onChange,
  label,
  size = "medium",
}: ItemSearchAutocompleteProps) {
  const { t } = useTranslation()
  const [searchTrigger] = marketApi.useLazySearchMarketListingsQuery()
  const [itemOptions, setItemOptions] = useState<
    Array<{ name: string; type: string }>
  >([])
  const [inputValue, setInputValue] = useState("")

  const debouncedSearch = useMemo(
    () =>
      debounce(async (searchQuery: string) => {
        if (searchQuery.length > 1) {
          const result = await searchTrigger({
            query: searchQuery,
            index: 0,
            page_size: 20,
            sort: "title",
          })
          if (result.data?.listings) {
            const uniqueItems = Array.from(
              new Map(
                result.data.listings
                  .filter((item) => item.item_name && item.item_type)
                  .map((item) => [
                    item.item_name,
                    { name: item.item_name!, type: item.item_type! },
                  ]),
              ).values(),
            )
            setItemOptions(uniqueItems)
          }
        } else {
          setItemOptions([])
        }
      }, 300),
    [searchTrigger],
  )

  useEffect(() => {
    debouncedSearch(inputValue)
  }, [inputValue, debouncedSearch])

  return (
    <Autocomplete
      size={size}
      options={itemOptions}
      value={itemOptions.find((opt) => opt.name === value) || null}
      inputValue={inputValue}
      onInputChange={(event, newValue) => {
        setInputValue(newValue)
      }}
      onChange={(event, newValue) => {
        onChange(newValue?.name || null, newValue?.type || null)
      }}
      getOptionLabel={(option) => option.name}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label || t("MarketListingForm.searchItem", "Search Item")}
          color="secondary"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <InputAdornment position="start">
                  <IconButton size="small">
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
                {params.InputProps.startAdornment}
              </>
            ),
          }}
        />
      )}
    />
  )
}
