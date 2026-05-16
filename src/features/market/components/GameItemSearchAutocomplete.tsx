import {
  Autocomplete,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Typography,
  Box,
  SxProps,
  Theme,
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import React, { useState, useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useLazySearchGameItemsQuery } from "../api/marketApi"
import { debounce } from "lodash-es"

interface GameItemSearchAutocompleteProps {
  value: string | null
  onChange: (itemName: string | null, itemType: string | null, itemId: string | null) => void
  label?: string
  size?: "small" | "medium"
  autoFocus?: boolean
  sx?: SxProps<Theme>
}

export function GameItemSearchAutocomplete({
  value,
  onChange,
  label,
  size = "medium",
  autoFocus,
  sx,
}: GameItemSearchAutocompleteProps) {
  const { t } = useTranslation()
  const [searchTrigger] = useLazySearchGameItemsQuery()
  const [itemOptions, setItemOptions] = useState<
    Array<{ name: string; type: string; id: string }>
  >([])
  const [inputValue, setInputValue] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [selectedItem, setSelectedItem] = useState<{ name: string; type: string; id: string } | null>(null)

  const debouncedSearch = useMemo(
    () =>
      debounce(async (searchQuery: string) => {
        if (searchQuery.trim().length >= 1) {
          setIsSearching(true)
          const result = await searchTrigger(searchQuery)
          if (result.data) {
            setItemOptions(result.data)
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
      id="game-item-search"
      size={size}
      sx={sx}
      options={itemOptions}
      loading={isSearching}
      value={selectedItem}
      inputValue={inputValue}
      onInputChange={(event, newValue, reason) => {
        if (reason !== 'reset') {
          setInputValue(newValue)
        }
      }}
      onChange={(event, newValue) => {
        setSelectedItem(newValue)
        onChange(newValue?.name || null, newValue?.type || null, newValue?.id || null)
        if (newValue) {
          setInputValue(newValue.name)
        }
      }}
      filterOptions={(x) => x}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      getOptionLabel={(option) => option.name}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
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
          autoFocus={autoFocus}
          label={label || t("market.search_query")}
          placeholder={t("market.searchItemPlaceholder", "Start typing an item name...")}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <IconButton size="small" edge="start">
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
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
