/**
 * Stock Manager Component
 *
 * Advanced stock management interface with lot breakdown, inline editing,
 * and progressive disclosure of complex features.
 *
 * Requirements: 2.1, 3.3, 4.4, 8.3, 9.3, 9.5
 */

import React, { useState, useMemo } from "react"
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { Add as AddIcon } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import {
  useGetListingLotsQuery,
  useGetLocationsQuery,
  StockLot,
  Location,
} from "../../../../store/api/stock-lots"
import { StockBreakdown } from "./StockBreakdown"
import { LotListItem } from "./LotListItem"
import { CreateLotDialog } from "./CreateLotDialog"
import { TransferLotDialog } from "./TransferLotDialog"

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
            ([locationId, { location, lots: locationLots }]) => (
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
