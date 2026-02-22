import {
  Autocomplete,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import React, { useState, useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useLazySearchGameItemsQuery } from "../api/marketApi"
import { debounce } from "lodash-es"

interface GameItemSearchAutocompleteProps {
  value: string | null
  onChange: (itemName: string | null, itemType: string | null) => void
  label?: string
  size?: "small" | "medium"
}

export function GameItemSearchAutocomplete({
  value,
  onChange,
  label,
  size = "medium",
}: GameItemSearchAutocompleteProps) {
  const { t } = useTranslation()
  const [searchTrigger] = useLazySearchGameItemsQuery()
  const [itemOptions, setItemOptions] = useState<
    Array<{ name: string; type: string }>
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
