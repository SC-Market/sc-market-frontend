/**
 * GameItemPicker — search-and-select for a single game item, emitting the item's
 * UUID + name. Used by the add-widget gallery for widgets that pin to an item
 * (e.g. Price History). Mirrors the search Autocomplete in AddItemDialog:
 * useSearchGameItemsQuery with a debounced query, option `.id` = game_item_id.
 */

import { useCallback, useState } from "react"
import {
  Autocomplete,
  Box,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { debounce } from "lodash"
import {
  useSearchGameItemsQuery,
  type GameItemSearchResult,
} from "../../store/api/v2/market"

export type GameItemChoice = GameItemSearchResult

export interface GameItemPickerProps {
  value: GameItemChoice | null
  onChange: (value: GameItemChoice | null) => void
}

export function GameItemPicker({ value, onChange }: GameItemPickerProps) {
  const { t } = useTranslation()
  const [query, setQuery] = useState("")
  const { data: results = [], isFetching } = useSearchGameItemsQuery(
    { query },
    { skip: query.length < 2 },
  )

  const debouncedSetQuery = useCallback(
    debounce((value: string) => setQuery(value), 300),
    [],
  )

  return (
    <Autocomplete
      size="small"
      value={value}
      onChange={(_, next) => onChange(next)}
      onInputChange={(_, v) => debouncedSetQuery(v)}
      options={results}
      getOptionLabel={(o) => o.name}
      loading={isFetching}
      filterOptions={(x) => x}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      renderInput={(params) => (
        <TextField
          {...params}
          label={t("dashboard.searchItem", "Search item")}
          placeholder={t("dashboard.searchItemPlaceholder", "Type to search…")}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isFetching ? <CircularProgress size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          <Box>
            <Typography variant="body2">{option.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {option.type}
            </Typography>
          </Box>
        </li>
      )}
      noOptionsText={
        query.length < 2
          ? t("dashboard.searchItemHint", "Type at least 2 characters")
          : t("dashboard.searchItemNone", "No items found")
      }
    />
  )
}
