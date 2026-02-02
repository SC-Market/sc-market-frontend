/**
 * Stock Manager Component
 * 
 * Advanced stock management interface with lot breakdown, editing, and transfer capabilities.
 * 
 * Requirements: 2.1, 3.3, 4.4, 8.3, 9.3, 9.5
 */

import React, { useState } from "react"
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Divider,
  Alert,
} from "@mui/material"
import { Add as AddIcon } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useGetListingLotsQuery } from "../../../store/api/stock-lots"
import { StockBreakdown } from "./StockBreakdown"
import { LotCreationDialog } from "./LotCreationDialog"

export interface StockManagerProps {
  listingId: string
  onClose?: () => void
}

/**
 * StockManager Component
 * 
 * Displays comprehensive stock management interface with:
 * - Total, available, and reserved stock aggregates
 * - Lot breakdown grouped by location
 * - Inline editing for each lot
 * - Lot creation and transfer capabilities
 */
export function StockManager({ listingId, onClose }: StockManagerProps) {
  const { t } = useTranslation()
  const [isCreatingLot, setIsCreatingLot] = useState(false)

  // Fetch lots data
  const {
    data: lotsData,
    isLoading,
    error,
    refetch,
  } = useGetListingLotsQuery({ listing_id: listingId })

  // Handle lot creation dialog
  const handleCreateLot = () => {
    setIsCreatingLot(true)
  }

  const handleCloseCreationDialog = () => {
    setIsCreatingLot(false)
    refetch()
  }

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>{t("StockManager.loading", "Loading stock data...")}</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {t("StockManager.error", "Failed to load stock data")}
        </Alert>
      </Box>
    )
  }

  const { lots = [], aggregates } = lotsData || {}
  const { total = 0, available = 0, reserved = 0 } = aggregates || {}

  return (
    <Paper sx={{ p: 3 }}>
      {/* Header with aggregates */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">
          {t("StockManager.title", "Stock Management")}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateLot}
          size="small"
        >
          {t("StockManager.createLot", "Create Lot")}
        </Button>
      </Stack>

      {/* Stock aggregates display */}
      <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {t("StockManager.totalStock", "Total Stock")}
          </Typography>
          <Typography variant="h5">{total}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {t("StockManager.available", "Available")}
          </Typography>
          <Typography variant="h5" color="success.main">
            {available}
          </Typography>
        </Box>
        {reserved > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              {t("StockManager.reserved", "Reserved")}
            </Typography>
            <Typography variant="h5" color="warning.main">
              {reserved}
            </Typography>
          </Box>
        )}
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Lot breakdown */}
      <StockBreakdown
        lots={lots}
        listingId={listingId}
        onRefresh={refetch}
      />

      {/* Lot creation dialog */}
      <LotCreationDialog
        open={isCreatingLot}
        listingId={listingId}
        onClose={handleCloseCreationDialog}
      />
    </Paper>
  )
}
