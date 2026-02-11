/**
 * Stock Manager Component
 *
 * Advanced stock management interface with lot breakdown, inline editing,
 * and progressive disclosure of complex features.
 *
 * Requirements: 2.1, 3.3, 4.4, 8.3, 9.3, 9.5
 */

import React, { useState, useMemo } from "react"
import { useTranslation } from "react-i18next"
import {
  useGetListingLotsQuery,
  useGetLocationsQuery,
  StockLot,
  Location,
} from "../../../../store/api/stockLotsApi"
import { StockBreakdown } from "./StockBreakdown"
import { LotListItem } from "./LotListItem"
import { CreateLotDialog } from "./CreateLotDialog"
import { TransferLotDialog } from "./TransferLotDialog"

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
import ThemeOptions from '@mui/material/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import AvatarGroup from '@mui/material/AvatarGroup';
import { PaperProps } from '@mui/material/Paper';
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
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
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
import MapIcon from '@mui/icons-material/Map';
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
import AddIcon from '@mui/icons-material/Add';

export interface StockManagerProps {
  listingId: string
  onClose?: () => void
}

/**
 * StockManager Component
 *
 * Displays a comprehensive view of all stock lots for a listing.
 * Groups lots by location, shows aggregates, and provides inline editing.
 */
export function StockManager({ listingId, onClose }: StockManagerProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  // State for dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [selectedLot, setSelectedLot] = useState<StockLot | null>(null)

  // Fetch lots and locations
  const {
    data: lotsData,
    isLoading: isLoadingLots,
    error: lotsError,
  } = useGetListingLotsQuery({ listing_id: listingId })

  const { data: locationsData, isLoading: isLoadingLocations } =
    useGetLocationsQuery({})

  // Group lots by location
  const lotsByLocation = useMemo(() => {
    if (!lotsData?.lots || !locationsData?.locations) return new Map()

    const grouped = new Map<
      string,
      { location: Location | null; lots: StockLot[] }
    >()

    lotsData.lots.forEach((lot) => {
      const locationId = lot.location_id || "unspecified"

      if (!grouped.has(locationId)) {
        const location =
          locationsData.locations.find(
            (loc) => loc.location_id === lot.location_id,
          ) || null

        grouped.set(locationId, { location, lots: [] })
      }

      grouped.get(locationId)!.lots.push(lot)
    })

    return grouped
  }, [lotsData, locationsData])

  // Handle transfer dialog
  const handleTransferClick = (lot: StockLot) => {
    setSelectedLot(lot)
    setTransferDialogOpen(true)
  }

  const handleTransferClose = () => {
    setTransferDialogOpen(false)
    setSelectedLot(null)
  }

  // Loading state
  if (isLoadingLots || isLoadingLocations) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
      </Box>
    )
  }

  // Error state
  if (lotsError) {
    return (
      <Alert severity="error">
        {t("StockManager.errorLoading", "Failed to load stock information")}
      </Alert>
    )
  }

  const lots = lotsData?.lots || []
  const aggregates = lotsData?.aggregates || {
    total: 0,
    available: 0,
    reserved: 0,
  }
  const locations = locationsData?.locations || []

  return (
    <Box>
      {/* Header with aggregates */}
      <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={2}
          mb={2}
        >
          <Typography variant={isMobile ? "subtitle1" : "h6"}>
            {t("StockManager.title", "Stock Management")}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            size="small"
            fullWidth={isMobile}
          >
            {t("StockManager.createLot", "Create Lot")}
          </Button>
        </Stack>

        {/* Stock breakdown summary */}
        <StockBreakdown
          total={aggregates.total}
          available={aggregates.available}
          reserved={aggregates.reserved}
        />
      </Paper>

      {/* Lots grouped by location */}
      {lots.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {t(
              "StockManager.noLots",
              "No stock lots found. Create your first lot to get started.",
            )}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            {t("StockManager.createFirstLot", "Create First Lot")}
          </Button>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {Array.from(lotsByLocation.entries()).map(
            ([locationId, { location, lots: locationLots }]: [
              string,
              { location: Location | null; lots: StockLot[] },
            ]) => (
              <Paper key={locationId} sx={{ p: 2 }}>
                {/* Location header */}
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {location?.name ||
                      t(
                        "StockManager.unspecifiedLocation",
                        "Unspecified Location",
                      )}
                  </Typography>
                  {location?.is_preset && (
                    <Chip
                      label={t("StockManager.preset", "Preset")}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  <Typography variant="body2" color="text.secondary">
                    ({locationLots.length}{" "}
                    {locationLots.length === 1
                      ? t("StockManager.lot", "lot")
                      : t("StockManager.lots", "lots")}
                    )
                  </Typography>
                </Stack>

                <Divider sx={{ mb: 2 }} />

                {/* Lots in this location */}
                <Stack spacing={1}>
                  {locationLots.map((lot: StockLot) => (
                    <LotListItem
                      key={lot.lot_id}
                      lot={lot}
                      locations={locations}
                      onTransfer={handleTransferClick}
                    />
                  ))}
                </Stack>
              </Paper>
            ),
          )}
        </Stack>
      )}

      {/* Create Lot Dialog */}
      <CreateLotDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        listingId={listingId}
        locations={locations}
      />

      {/* Transfer Lot Dialog */}
      {selectedLot && (
        <TransferLotDialog
          open={transferDialogOpen}
          onClose={handleTransferClose}
          lot={selectedLot}
          locations={locations}
        />
      )}
    </Box>
  )
}
