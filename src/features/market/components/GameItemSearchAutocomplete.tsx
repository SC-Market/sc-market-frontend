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
import SearchIcon from "@mui/icons-material/SearchRounded"
import EditNoteIcon from "@mui/icons-material/EditNoteRounded"
import React, { useState, useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { marketV2Api } from "../../../store/api/v2/market"
import { debounce } from "lodash-es"

interface GameItemOption {
  name: string
  type: string
  id: string
}

/** The "list it as a custom item" row shown after the search results. */
interface CustomItemOption {
  custom: true
  /** What the user typed */
  name: string
}

type PickerOption = GameItemOption | CustomItemOption

function isCustomOption(option: PickerOption): option is CustomItemOption {
  return "custom" in option
}

interface GameItemSearchAutocompleteProps {
  /**
   * Name of the selected game item. Initialises the field (edit forms) and
   * re-syncs it whenever the parent changes it; typing in the box does not
   * touch it until an option is picked.
   */
  value: string | null
  onChange: (
    itemName: string | null,
    itemType: string | null,
    itemId: string | null,
  ) => void
  label?: string
  size?: "small" | "medium"
  sx?: SxProps<Theme>
  /** Marks the field required (asterisk on the label) */
  required?: boolean
  /** Error shown under the field */
  errorText?: string
  /**
   * Offers "List "<typed text>" as a custom item" under the results, for
   * things the game data doesn't have. Called with the typed text (may be
   * empty) when it is picked.
   */
  onCustomItem?: (typedName: string) => void
}

/** Stand-in option for a `value` the field did not pick itself. */
function optionFromValue(value: string | null): GameItemOption | null {
  return value ? { name: value, type: "", id: "" } : null
}

export function GameItemSearchAutocomplete({
  value,
  onChange,
  label,
  size = "medium",
  sx,
  required,
  errorText,
  onCustomItem,
}: GameItemSearchAutocompleteProps) {
  const { t } = useTranslation()
  const [searchTrigger] = marketV2Api.endpoints.searchGameItems.useLazyQuery()
  const [itemOptions, setItemOptions] = useState<GameItemOption[]>([])
  const [inputValue, setInputValue] = useState(value ?? "")
  const [isSearching, setIsSearching] = useState(false)
  const [selectedItem, setSelectedItem] = useState<GameItemOption | null>(() =>
    optionFromValue(value),
  )

  // Follow `value` when the parent changes it (e.g. an edit row loads, or a
  // form resets). A value that matches the current selection is the echo of
  // our own onChange, so the picked option (with its id/type) is kept.
  const [syncedValue, setSyncedValue] = useState(value)
  if (value !== syncedValue) {
    setSyncedValue(value)
    if (value !== (selectedItem?.name ?? null)) {
      setSelectedItem(optionFromValue(value))
      setInputValue(value ?? "")
    }
  }
  const selectedName = selectedItem?.name

  const typed = inputValue.trim()
  const options: PickerOption[] =
    onCustomItem && typed && typed !== selectedName && !isSearching
      ? [...itemOptions, { custom: true, name: typed }]
      : itemOptions

  const debouncedSearch = useMemo(
    () =>
      debounce(async (searchQuery: string) => {
        if (searchQuery.trim().length >= 1) {
          setIsSearching(true)
          const result = await searchTrigger({ query: searchQuery, limit: 50 })
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
    // The box showing the selected item's name is not a search.
    if (inputValue === selectedName) return
    debouncedSearch(inputValue)
    return () => {
      debouncedSearch.cancel()
    }
  }, [inputValue, selectedName, debouncedSearch])

  return (
    <Autocomplete
      id="game-item-search"
      size={size}
      sx={sx}
      options={options}
      loading={isSearching}
      value={selectedItem}
      inputValue={inputValue}
      onInputChange={(event, newValue, reason) => {
        if (reason !== "reset") {
          setInputValue(newValue)
        }
      }}
      onChange={(event, newValue) => {
        if (newValue && isCustomOption(newValue)) {
          onCustomItem?.(newValue.name)
          return
        }
        setSelectedItem(newValue)
        onChange(
          newValue?.name || null,
          newValue?.type || null,
          newValue?.id || null,
        )
        if (newValue) {
          setInputValue(newValue.name)
        }
      }}
      filterOptions={(x) => x}
      isOptionEqualToValue={(option, val) =>
        isCustomOption(option) || isCustomOption(val)
          ? false
          : val.id
            ? option.id === val.id
            : option.name === val.name
      }
      getOptionLabel={(option) => option.name}
      renderOption={(props, option) =>
        isCustomOption(option) ? (
          <Box
            component="li"
            {...props}
            key="custom-item"
            sx={{ borderTop: 1, borderColor: "divider" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <EditNoteIcon fontSize="small" color="primary" />
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography variant="body2" color="primary">
                  {t("market.customItem.option", {
                    defaultValue: 'List "{{name}}" as a custom item',
                    name: option.name,
                  })}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t(
                    "market.customItem.optionHint",
                    "Not in the list? Sell it without linking a game item",
                  )}
                </Typography>
              </Box>
            </Box>
          </Box>
        ) : (
          <li {...props} key={option.id}>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography variant="body2">{option.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {option.type}
              </Typography>
            </Box>
          </li>
        )
      }
      renderInput={(params) => (
        <TextField
          {...params}
          required={required}
          error={!!errorText}
          helperText={errorText}
          label={label || t("market.search_query")}
          placeholder={t("market.searchItemPlaceholder", "Search items")}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <IconButton
                  size="small"
                  edge="start"
                  aria-label={t("market.search", "Search")}
                >
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
            endAdornment: (
              <>
                {isSearching ? (
                  <CircularProgress color="inherit" size={18} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      noOptionsText={
        inputValue.trim().length < 1
          ? t("market.typeToSearch", "Type an item name")
          : isSearching
            ? t("market.searching", "Searching...")
            : t(
                "market.noItemResults",
                "No items found. Try a shorter or different term.",
              )
      }
      loadingText={t("market.searching", "Searching...")}
    />
  )
}
