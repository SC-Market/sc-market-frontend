import {
  Autocomplete,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Typography,
  Box,
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import React, { useState, useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { marketApi } from "../api/marketApi"
import { debounce } from "lodash-es"

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
  const [isSearching, setIsSearching] = useState(false)

  const debouncedSearch = useMemo(
    () =>
      debounce(async (searchQuery: string) => {
        if (searchQuery.trim().length >= 1) {
          setIsSearching(true)
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
          setIsSearching(false)
        } else {
          setItemOptions([])
        }
      }, 250),
    [searchTrigger],
  )

  useEffect(() => {
    debouncedSearch(inputValue)
    return () => { debouncedSearch.cancel() }
  }, [inputValue, debouncedSearch])

  return (
    <Autocomplete
      size={size}
      options={itemOptions}
      loading={isSearching}
      value={itemOptions.find((opt) => opt.name === value) || null}
      inputValue={inputValue}
      onInputChange={(event, newValue, reason) => {
        if (reason !== "reset") {
          setInputValue(newValue)
        }
      }}
      onChange={(event, newValue) => {
        onChange(newValue?.name || null, newValue?.type || null)
      }}
      filterOptions={(x) => x}
      getOptionLabel={(option) => option.name}
      renderOption={(props, option) => (
        <li {...props} key={option.name}>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography variant="body2">{option.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {option.type}
            </Typography>
          </Box>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label || t("MarketListingForm.searchItem", "Search Item")}
          placeholder={t("market.searchItemPlaceholder", "Start typing an item name...")}
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
            endAdornment: (
              <>
                {isSearching ? <CircularProgress color="inherit" size={18} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      noOptionsText={
        inputValue.trim().length < 1
          ? t("market.typeToSearch", "Type to search...")
          : isSearching
          ? t("market.searching", "Searching...")
          : t("market.noItemResults", "No items found — try a shorter or different term")
      }
      loadingText={t("market.searching", "Searching...")}
    />
  )
}
