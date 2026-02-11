/**
 * Location Selector Component
 *
 * Searchable dropdown for selecting locations with support for preset and custom locations.
 *
 * Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6
 */

import React, { useState, useMemo } from "react"
import { useTranslation } from "react-i18next"
import {
  useGetLocationsQuery,
  useCreateLocationMutation,
  Location,
} from "../../../../store/api/stockLotsApi"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"
import { useDebounce } from "../../../../hooks/useDebounce"

import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import Paper from '@mui/material/Paper';
import Fade from '@mui/material/Fade';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ButtonProps } from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MaterialLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { GridProps } from '@mui/material/Grid';
import ButtonGroup from '@mui/material/ButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { responsiveFontSizes } from '@mui/material/styles';
import ThemeOptions from '@mui/material/ThemeOptions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import AvatarGroup from '@mui/material/AvatarGroup';
import { PaperProps } from '@mui/material/PaperProps';
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Fab from '@mui/material/Fab';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import InputAdornment from '@mui/material/InputAdornment';
import TablePagination from '@mui/material/TablePagination';
import TableContainer from '@mui/material/TableContainer';
import Autocomplete from '@mui/material/Autocomplete';
import CookieRounded from '@mui/icons-material/CookieRounded';
import ZoomIn from '@mui/icons-material/ZoomIn';
import ZoomOut from '@mui/icons-material/ZoomOut';
import FitScreen from '@mui/icons-material/FitScreen';
import Close from '@mui/icons-material/Close';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRounded from '@mui/icons-material/KeyboardArrowUpRounded';
import ReportIcon from '@mui/icons-material/Report';
import KeyboardArrowLeftRounded from '@mui/icons-material/KeyboardArrowLeftRounded';
import ShareRounded from '@mui/icons-material/ShareRounded';
import PlayArrow from '@mui/icons-material/PlayArrow';
import Map from '@mui/icons-material/Map';
import VideoLibrary from '@mui/icons-material/VideoLibrary';
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import WarningRounded from '@mui/icons-material/WarningRounded';
import InventoryRounded from '@mui/icons-material/InventoryRounded';
import SyncProblemRounded from '@mui/icons-material/SyncProblemRounded';
import ErrorOutlineRounded from '@mui/icons-material/ErrorOutlineRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import AddCircleOutlineRounded from '@mui/icons-material/AddCircleOutlineRounded';
import RemoveCircleOutlineRounded from '@mui/icons-material/RemoveCircleOutlineRounded';

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
    />
  )
}
