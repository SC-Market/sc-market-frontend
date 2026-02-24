import {
  Autocomplete,
  TextField,
  InputAdornment,
  IconButton,
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
  onChange: (
    itemName: string | null,
    itemType: string | null,
    itemId: string | null,
  ) => void
  label?: string
  size?: "small" | "medium"
  sx?: SxProps<Theme>
}

export function GameItemSearchAutocomplete({
  value,
  onChange,
  label,
  size = "medium",
  sx,
}: GameItemSearchAutocompleteProps) {
  const { t } = useTranslation()
  const [searchTrigger] = useLazySearchGameItemsQuery()
  const [itemOptions, setItemOptions] = useState<
    Array<{ name: string; type: string; id: string }>
  >([])
  const [inputValue, setInputValue] = useState("")

  const debouncedSearch = useMemo(
    () =>
      debounce(async (searchQuery: string) => {
        if (searchQuery.length > 1) {
          const result = await searchTrigger(searchQuery)
          if (result.data) {
            setItemOptions(result.data)
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

  // Initialize inputValue with the current value
  useEffect(() => {
    if (value && !inputValue) {
      setInputValue(value)
    }
  }, [value, inputValue])

  return (
    <Autocomplete
      size={size}
      sx={sx}
      options={itemOptions}
      value={itemOptions.find((opt) => opt.name === value) || null}
      inputValue={inputValue}
      onInputChange={(event, newValue, reason) => {
        if (reason !== "reset") {
          setInputValue(newValue)
        }
      }}
      onChange={(event, newValue) => {
        onChange(
          newValue?.name || null,
          newValue?.type || null,
          newValue?.id || null,
        )
        if (newValue) {
          setInputValue(newValue.name)
        }
      }}
      getOptionLabel={(option) => option.name}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label || t("market.search_query")}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <IconButton size="small" edge="start">
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      )}
      noOptionsText={
        inputValue.length < 2
          ? t("market.typeToSearch", "Type to search...")
          : t("market.noResults", "No results")
      }
    />
  )
}
