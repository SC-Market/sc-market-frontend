/**
 * Location Selector Component
 *
 * Searchable dropdown for selecting locations with support for preset and custom locations.
 *
 * Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6
 */

import React, { useState, useMemo } from "react"
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  Chip,
  CircularProgress,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import {
  useGetLocationsQuery,
  useCreateLocationMutation,
  Location,
} from "../../../../store/api/stockLotsApi"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"
import { useDebounce } from "../../../../hooks/useDebounce"

export interface LocationSelectorProps {
  value: string | null
  onChange: (locationId: string | null) => void
  locations?: Location[]
  size?: "small" | "medium"
  label?: string
  disabled?: boolean
  fullWidth?: boolean
  sx?: any
}

/**
 * LocationSelector Component
 *
 * Provides a searchable dropdown with:
 * - Preset locations at the top with badges
 * - User's custom locations below
 * - Ability to create new custom locations inline
 * - Debounced search for filtering locations (Requirements: 15.4, 15.5)
 */
export function LocationSelector({
  value,
  onChange,
  locations: providedLocations,
  size = "small",
  label,
  disabled = false,
  fullWidth = false,
  sx,
}: LocationSelectorProps) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()

  const [inputValue, setInputValue] = useState("")

  // Debounce the search input for API calls (Requirements: 15.4, 15.5)
  const debouncedSearch = useDebounce(inputValue, 300)

  // Fetch locations with debounced search
  // Skip if locations are provided externally
  const { data: locationsData, isLoading: isLoadingLocations } =
    useGetLocationsQuery(
      { search: debouncedSearch || undefined },
      { skip: !!providedLocations },
    )

  const [createLocation, { isLoading: isCreating }] =
    useCreateLocationMutation()

  // Use provided locations or fetched locations
  const locations = providedLocations || locationsData?.locations || []

  // Sort locations: preset first, then custom
  // The API already returns them sorted, but we ensure it here for provided locations
  const sortedLocations = useMemo(() => {
    const preset = locations.filter((loc) => loc.is_preset)
    const custom = locations.filter((loc) => !loc.is_preset)

    // Sort preset by display_order
    preset.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))

    // Sort custom alphabetically
    custom.sort((a, b) => a.name.localeCompare(b.name))

    return [...preset, ...custom]
  }, [locations])

  // When using provided locations, filter client-side
  // When using API, filtering is done server-side via debounced search
  const displayedLocations = useMemo(() => {
    if (providedLocations && inputValue) {
      // Client-side filtering for provided locations
      const searchLower = inputValue.toLowerCase()
      return sortedLocations.filter((loc) =>
        loc.name.toLowerCase().includes(searchLower),
      )
    }
    return sortedLocations
  }, [sortedLocations, inputValue, providedLocations])

  // Find selected location
  const selectedLocation =
    locations.find((loc) => loc.location_id === value) || null

  // Handle selection
  const handleChange = (_event: any, newValue: Location | string | null) => {
    if (typeof newValue === "string") {
      // User typed a new location name and pressed Enter
      handleCreateLocation(newValue)
    } else if (newValue) {
      onChange(newValue.location_id)
    } else {
      onChange(null)
    }
  }

  // Handle creating a new custom location
  const handleCreateLocation = async (name: string) => {
    if (!name || name.trim().length === 0) {
      return
    }

    if (name.length > 255) {
      issueAlert({
        message: t(
          "LocationSelector.nameTooLong",
          "Location name must be 255 characters or less",
        ),
        severity: "error",
      })
      return
    }

    try {
      const result = await createLocation({ name: name.trim() }).unwrap()
      onChange(result.location.location_id)
      issueAlert({
        message: t("LocationSelector.createSuccess", "Custom location created"),
        severity: "success",
      })
    } catch (error) {
      issueAlert({
        message: t("LocationSelector.createError", "Failed to create location"),
        severity: "error",
      })
    }
  }

  return (
    <Autocomplete
      value={selectedLocation}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={(_event, newInputValue) => setInputValue(newInputValue)}
      options={displayedLocations}
      getOptionLabel={(option) => {
        if (typeof option === "string") return option
        return option.name
      }}
      isOptionEqualToValue={(option, value) =>
        option.location_id === value.location_id
      }
      freeSolo
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || isCreating}
      loading={isLoadingLocations}
      sx={sx}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label || t("LocationSelector.location", "Location")}
          placeholder={t(
            "LocationSelector.searchOrCreate",
            "Search or create location...",
          )}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isLoadingLocations || isCreating ? (
                  <CircularProgress size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => {
        const { key, ...otherProps } = props
        return (
          <Box component="li" key={key} {...otherProps}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                width: "100%",
              }}
            >
              <Typography variant="body2">{option.name}</Typography>
              {option.is_preset && (
                <Chip
                  label={t("LocationSelector.preset", "Preset")}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ ml: "auto" }}
                />
              )}
            </Box>
          </Box>
        )
      }}
      noOptionsText={
        inputValue
          ? t(
              "LocationSelector.pressEnterToCreate",
              'Press Enter to create "{name}"',
              {
                name: inputValue,
              },
            )
          : t("LocationSelector.noLocations", "No locations found")
      }
      fullWidth
    />
  )
}
