/**
 * Bulk Stock Management Component
 *
 * Allows managing stock quantities across multiple listings at once
 */

import React, { useState } from "react"
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Stack,
  Avatar,
  Chip,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import {
  AddRounded,
  RemoveRounded,
  SaveRounded,
  InventoryRounded,
} from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { UniqueListing } from "../domain/types"
import { useUpdateListingQuantityMutation } from "../api/marketApi"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { Link } from "react-router-dom"

export interface BulkStockManagementProps {
  listings: UniqueListing[]
  onRefresh?: () => void
}

export function BulkStockManagement({
  listings,
  onRefresh,
}: BulkStockManagementProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [updateQuantity] = useUpdateListingQuantityMutation()
  const issueAlert = useAlertHook()

  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  const handleQuantityChange = (listingId: string, newQuantity: number) => {
    setQuantities((prev) => ({
      ...prev,
      [listingId]: Math.max(0, newQuantity),
    }))
  }

  const handleSave = async (listing: UniqueListing) => {
    const newQuantity = quantities[listing.listing.listing_id]
    if (
      newQuantity === undefined ||
      newQuantity === listing.listing.quantity_available
    ) {
      return
    }

    setSaving((prev) => ({ ...prev, [listing.listing.listing_id]: true }))

    try {
      await updateQuantity({
        listing_id: listing.listing.listing_id,
        quantity: newQuantity,
      }).unwrap()

      issueAlert({
        message: t("ItemStock.updated"),
        severity: "success",
      })

      // Clear the pending change
      setQuantities((prev) => {
        const next = { ...prev }
        delete next[listing.listing.listing_id]
        return next
      })

      if (onRefresh) {
        await onRefresh()
      }
    } catch (error) {
      issueAlert(error as any)
    } finally {
      setSaving((prev) => ({ ...prev, [listing.listing.listing_id]: false }))
    }
  }

  const handleQuickUpdate = async (listing: UniqueListing, delta: number) => {
    const currentQty = listing.listing.quantity_available
    const newQuantity = Math.max(0, currentQty + delta)

    setSaving((prev) => ({ ...prev, [listing.listing.listing_id]: true }))

    try {
      await updateQuantity({
        listing_id: listing.listing.listing_id,
        quantity: newQuantity,
      }).unwrap()

      issueAlert({
        message: t("ItemStock.updated"),
        severity: "success",
      })

      if (onRefresh) {
        await onRefresh()
      }
    } catch (error) {
      issueAlert(error as any)
    } finally {
      setSaving((prev) => ({ ...prev, [listing.listing.listing_id]: false }))
    }
  }

  if (listings.length === 0) {
    return (
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="body1" color="text.secondary" align="center">
          {t(
            "ItemStock.noListings",
            "No listings found. Create your first listing to get started.",
          )}
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h6" gutterBottom>
        {t("ItemStock.bulkStockManagement", "Quick Stock Updates")}
      </Typography>

      <Stack spacing={2} sx={{ mt: 2 }}>
        {listings.map((listing) => {
          const listingId = listing.listing.listing_id
          const currentQty = listing.listing.quantity_available
          const pendingQty = quantities[listingId]
          const hasChanges =
            pendingQty !== undefined && pendingQty !== currentQty
          const isSaving = saving[listingId]

          return (
            <Paper
              key={listingId}
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: hasChanges ? "action.hover" : "background.paper",
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", sm: "center" }}
              >
                {/* Item info */}
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ flex: 1, minWidth: 0 }}
                >
                  <Avatar
                    src={listing.photos[0]}
                    variant="rounded"
                    sx={{ width: 48, height: 48 }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body1" noWrap>
                      {listing.details.title}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        label={`${currentQty.toLocaleString()} ${t("ItemStock.inStock", "in stock")}`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`${listing.listing.price.toLocaleString()} aUEC`}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  </Box>
                </Stack>

                {/* Stock controls */}
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ flexShrink: 0 }}
                >
                  {/* Quick buttons */}
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleQuickUpdate(listing, -1)}
                    disabled={isSaving || currentQty === 0}
                  >
                    <RemoveRounded />
                  </IconButton>

                  <IconButton
                    size="small"
                    color="warning"
                    onClick={() => handleQuickUpdate(listing, -currentQty)}
                    disabled={isSaving || currentQty === 0}
                  >
                    0
                  </IconButton>

                  <IconButton
                    size="small"
                    color="success"
                    onClick={() => handleQuickUpdate(listing, 1)}
                    disabled={isSaving}
                  >
                    <AddRounded />
                  </IconButton>

                  {/* Manual input */}
                  <TextField
                    type="number"
                    size="small"
                    value={pendingQty ?? currentQty}
                    onChange={(e) =>
                      handleQuantityChange(
                        listingId,
                        parseInt(e.target.value) || 0,
                      )
                    }
                    disabled={isSaving}
                    sx={{ width: 80 }}
                    inputProps={{ min: 0 }}
                  />

                  {/* Save button */}
                  {hasChanges && (
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleSave(listing)}
                      disabled={isSaving}
                    >
                      <SaveRounded />
                    </IconButton>
                  )}

                  {/* Advanced stock management link */}
                  <IconButton
                    size="small"
                    component={Link}
                    to={`/market/stock/${listingId}`}
                    sx={{ ml: 1 }}
                  >
                    <InventoryRounded />
                  </IconButton>
                </Stack>
              </Stack>
            </Paper>
          )
        })}
      </Stack>
    </Paper>
  )
}
