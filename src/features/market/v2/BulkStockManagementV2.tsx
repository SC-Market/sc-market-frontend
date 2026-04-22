/**
 * BulkStockManagementV2 — V2 equivalent of V1 BulkStockManagement.
 *
 * Matches V1 layout: Paper wrapper with title, Stack of outlined Papers
 * each showing lot info (variant name, quantity chip, quality tier chip)
 * with quick-update buttons (-1, 0, +1), manual TextField, Save, and
 * inventory link. Uses V2 RTK Query hooks exclusively.
 */

import React, { useState } from "react"
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Stack,
  Chip,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import {
  AddRounded,
  RemoveRounded,
  SaveRounded,
  InventoryRounded,
  DeleteOutline,
} from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import {
  useGetStockLotsQuery,
  useBulkUpdateStockLotsMutation,
  useDeleteStockLotMutation,
  type StockLotDetail,
} from "../../../store/api/v2/market"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { Link } from "react-router-dom"

export interface BulkStockManagementV2Props {
  listingId: string
  itemId: string
  onRefresh?: () => void
}

export function BulkStockManagementV2({
  listingId,
  itemId,
  onRefresh,
}: BulkStockManagementV2Props) {
  const { t } = useTranslation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const issueAlert = useAlertHook()

  const { data: lotsData, isLoading } = useGetStockLotsQuery({ listingId })
  const [bulkUpdate] = useBulkUpdateStockLotsMutation()
  const [deleteLot] = useDeleteStockLotMutation()

  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  const lots = lotsData?.lots ?? []

  const handleQuantityChange = (lotId: string, newQuantity: number) => {
    setQuantities((prev) => ({ ...prev, [lotId]: Math.max(0, newQuantity) }))
  }

  const handleSave = async (lot: StockLotDetail) => {
    const newQuantity = quantities[lot.lot_id]
    if (newQuantity === undefined || newQuantity === lot.quantity_total) return

    setSaving((prev) => ({ ...prev, [lot.lot_id]: true }))
    try {
      await bulkUpdate({
        bulkUpdateStockLotsRequest: {
          updates: [{ lot_id: lot.lot_id, quantity_total: newQuantity }],
        },
      }).unwrap()

      issueAlert({ message: t("ItemStock.updated", "Updated"), severity: "success" })
      setQuantities((prev) => {
        const next = { ...prev }
        delete next[lot.lot_id]
        return next
      })
      onRefresh?.()
    } catch (error) {
      issueAlert(error as any)
    } finally {
      setSaving((prev) => ({ ...prev, [lot.lot_id]: false }))
    }
  }

  const handleQuickUpdate = async (lot: StockLotDetail, delta: number) => {
    const newQuantity = Math.max(0, lot.quantity_total + delta)
    setSaving((prev) => ({ ...prev, [lot.lot_id]: true }))
    try {
      await bulkUpdate({
        bulkUpdateStockLotsRequest: {
          updates: [{ lot_id: lot.lot_id, quantity_total: newQuantity }],
        },
      }).unwrap()

      issueAlert({ message: t("ItemStock.updated", "Updated"), severity: "success" })
      onRefresh?.()
    } catch (error) {
      issueAlert(error as any)
    } finally {
      setSaving((prev) => ({ ...prev, [lot.lot_id]: false }))
    }
  }

  const handleDelete = async (lot: StockLotDetail) => {
    try {
      await deleteLot({ id: lot.lot_id }).unwrap()
      issueAlert({ message: t("AllStockLots.deleted", "Lot deleted"), severity: "success" })
      onRefresh?.()
    } catch (error) {
      issueAlert(error as any)
    }
  }

  if (isLoading) {
    return (
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="body1" color="text.secondary" align="center">
          Loading...
        </Typography>
      </Paper>
    )
  }

  if (lots.length === 0) {
    return (
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="body1" color="text.secondary" align="center">
          {t(
            "ItemStock.noListings",
            "No stock lots found. Create your first lot to get started.",
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
        {lots.map((lot) => {
          const lotId = lot.lot_id
          const currentQty = lot.quantity_total
          const pendingQty = quantities[lotId]
          const hasChanges = pendingQty !== undefined && pendingQty !== currentQty
          const isSaving = saving[lotId]

          return (
            <Paper
              key={lotId}
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
                {/* Lot info */}
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ flex: 1, minWidth: 0 }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body1" noWrap>
                      {lot.variant.display_name}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        label={`${currentQty.toLocaleString()} ${t("ItemStock.inStock", "in stock")}`}
                        size="small"
                        variant="outlined"
                      />
                      {lot.variant.attributes.quality_tier != null && (
                        <Chip
                          label={`Tier ${lot.variant.attributes.quality_tier}`}
                          size="small"
                          variant="outlined"
                          color={
                            lot.variant.attributes.quality_tier >= 4
                              ? "success"
                              : lot.variant.attributes.quality_tier >= 3
                                ? "primary"
                                : "default"
                          }
                        />
                      )}
                      {lot.location && (
                        <Chip label={lot.location.name} size="small" variant="outlined" />
                      )}
                      <Chip
                        label={lot.listed ? t("ui.yes", "Listed") : t("ui.no", "Unlisted")}
                        size="small"
                        variant="outlined"
                        color={lot.listed ? "success" : "default"}
                      />
                    </Stack>
                  </Box>
                </Stack>

                {/* Stock controls — matches V1 exactly */}
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ flexShrink: 0 }}
                >
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleQuickUpdate(lot, -1)}
                    disabled={isSaving || currentQty === 0}
                  >
                    <RemoveRounded />
                  </IconButton>

                  <IconButton
                    size="small"
                    color="warning"
                    onClick={() => handleQuickUpdate(lot, -currentQty)}
                    disabled={isSaving || currentQty === 0}
                  >
                    0
                  </IconButton>

                  <IconButton
                    size="small"
                    color="success"
                    onClick={() => handleQuickUpdate(lot, 1)}
                    disabled={isSaving}
                  >
                    <AddRounded />
                  </IconButton>

                  <TextField
                    type="number"
                    size="small"
                    value={pendingQty ?? currentQty}
                    onChange={(e) =>
                      handleQuantityChange(lotId, parseInt(e.target.value) || 0)
                    }
                    disabled={isSaving}
                    sx={{ width: 80 }}
                    inputProps={{ min: 0 }}
                  />

                  {hasChanges && (
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleSave(lot)}
                      disabled={isSaving}
                    >
                      <SaveRounded />
                    </IconButton>
                  )}

                  <IconButton
                    size="small"
                    component={Link}
                    to={`/market/stock/${listingId}`}
                    sx={{ ml: 1 }}
                  >
                    <InventoryRounded />
                  </IconButton>

                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(lot)}
                    disabled={isSaving}
                  >
                    <DeleteOutline />
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
