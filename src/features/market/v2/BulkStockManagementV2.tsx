/**
 * Bulk Stock Management V2 Component
 *
 * Allows managing stock quantities and operations across multiple lots at once.
 * Supports checkbox selection, bulk actions (Update Quantity, List/Unlist, Transfer Location),
 * and displays variant information with quality tiers.
 *
 * **Validates: Requirements 23.1-23.10**
 */

import { useState, useMemo } from "react"
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
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Skeleton,
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
  type LocationInfo,
} from "../../../store/api/v2/market"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { FilterSidebarLayout } from "../../../components/layout/FilterSidebarLayout"
import { Link } from "react-router-dom"

export interface BulkStockManagementV2Props {
  listingId: string
  itemId: string
  onRefresh?: () => void
}

type BulkAction = "update_quantity" | "list_all" | "unlist_all" | "transfer_location"

interface BulkActionDialogState {
  open: boolean
  action: BulkAction | null
  quantity?: number
  locationId?: string
}

/**
 * BulkStockManagementV2 Component
 *
 * Provides quick stock updates across multiple lots with:
 * - Checkbox selection for multiple lots
 * - "Select All" and "Select by Quality Tier" options
 * - Bulk action dropdown (Update Quantity, List/Unlist, Transfer Location)
 * - Confirmation dialog before bulk operations
 * - Operation results with success/failure counts
 * - Visual feedback for pending changes
 * - Maintains visual parity with V1 BulkStockManagement
 */
export function BulkStockManagementV2({
  listingId,
  itemId,
  onRefresh,
}: BulkStockManagementV2Props) {
  const { t } = useTranslation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const issueAlert = useAlertHook()

  // Fetch stock lots
  const {
    data: lotsData,
    isLoading,
    error,
  } = useGetStockLotsQuery({
    listingId,
  })

  const [bulkUpdate] = useBulkUpdateStockLotsMutation()
  const [deleteLot] = useDeleteStockLotMutation()

  // Filter state
  const [searchText, setSearchText] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [listedFilter, setListedFilter] = useState<"" | "listed" | "unlisted">("")

  // State for individual lot quantity changes
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  // State for bulk selection
  const [selectedLots, setSelectedLots] = useState<Set<string>>(new Set())

  // State for bulk action dialog
  const [dialogState, setDialogState] = useState<BulkActionDialogState>({
    open: false,
    action: null,
  })

  // State for locations (for transfer action)
  const [locations, setLocations] = useState<LocationInfo[]>([])

  const lots = lotsData?.lots || []

  // Extract unique locations from lots
  useMemo(() => {
    if (!lotsData?.lots) return
    const locationMap = new Map<string, LocationInfo>()
    lotsData.lots.forEach((lot) => {
      if (lot.location) {
        locationMap.set(lot.location.location_id, lot.location)
      }
    })
    setLocations(Array.from(locationMap.values()))
  }, [lotsData])

  // Get unique quality tiers for "Select by Quality Tier"
  const qualityTiers = useMemo(() => {
    const tiers = new Set<number>()
    lots.forEach((lot) => {
      if (lot.variant.attributes.quality_tier) {
        tiers.add(lot.variant.attributes.quality_tier)
      }
    })
    return Array.from(tiers).sort((a, b) => b - a) // Descending
  }, [lots])

  // Unique locations for filter dropdown
  const uniqueLocations = useMemo(() => {
    return locations.map((l) => l.name).filter(Boolean)
  }, [locations])

  // Filter lots
  const filteredLots = useMemo(() => {
    return lots.filter((lot) => {
      if (searchText && !lot.variant.display_name.toLowerCase().includes(searchText.toLowerCase())) return false
      if (locationFilter && lot.location?.name !== locationFilter) return false
      if (listedFilter === "listed" && !lot.listed) return false
      if (listedFilter === "unlisted" && lot.listed) return false
      return true
    })
  }, [lots, searchText, locationFilter, listedFilter])

  const filtersContent = (
    <Stack spacing={1.5}>
      <TextField
        size="small"
        label="Search"
        placeholder="Search lots..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
      <FormControl size="small">
        <InputLabel>Location</InputLabel>
        <Select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} label="Location">
          <MenuItem value="">All</MenuItem>
          {uniqueLocations.map((loc) => (
            <MenuItem key={loc} value={loc}>{loc}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small">
        <InputLabel>Listed Status</InputLabel>
        <Select value={listedFilter} onChange={(e) => setListedFilter(e.target.value as any)} label="Listed Status">
          <MenuItem value="">All</MenuItem>
          <MenuItem value="listed">Listed</MenuItem>
          <MenuItem value="unlisted">Unlisted</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  )

  // Handle delete lot
  const handleDeleteLot = async (lot: StockLotDetail) => {
    try {
      await deleteLot({ id: lot.lot_id }).unwrap()
      issueAlert({
        message: t("BulkStockManagementV2.deleted", "Lot deleted successfully"),
        severity: "success",
      })
      onRefresh?.()
    } catch (error) {
      issueAlert(error as any)
    }
  }

  // Handle individual quantity change
  const handleQuantityChange = (lotId: string, newQuantity: number) => {
    setQuantities((prev) => ({
      ...prev,
      [lotId]: Math.max(0, newQuantity),
    }))
  }

  // Handle individual save
  const handleSave = async (lot: StockLotDetail) => {
    const newQuantity = quantities[lot.lot_id]
    if (newQuantity === undefined || newQuantity === lot.quantity_total) {
      return
    }

    setSaving((prev) => ({ ...prev, [lot.lot_id]: true }))

    try {
      await bulkUpdate({
        bulkUpdateStockLotsRequest: {
          updates: [
            {
              lot_id: lot.lot_id,
              quantity_total: newQuantity,
            },
          ],
        },
      }).unwrap()

      issueAlert({
        message: t("BulkStockManagementV2.updated", "Stock updated successfully"),
        severity: "success",
      })

      // Clear the pending change
      setQuantities((prev) => {
        const next = { ...prev }
        delete next[lot.lot_id]
        return next
      })

      if (onRefresh) {
        await onRefresh()
      }
    } catch (error) {
      issueAlert(error as any)
    } finally {
      setSaving((prev) => ({ ...prev, [lot.lot_id]: false }))
    }
  }

  // Handle quick update (+1, -1, 0)
  const handleQuickUpdate = async (lot: StockLotDetail, delta: number) => {
    const currentQty = lot.quantity_total
    const newQuantity = Math.max(0, currentQty + delta)

    setSaving((prev) => ({ ...prev, [lot.lot_id]: true }))

    try {
      await bulkUpdate({
        bulkUpdateStockLotsRequest: {
          updates: [
            {
              lot_id: lot.lot_id,
              quantity_total: newQuantity,
            },
          ],
        },
      }).unwrap()

      issueAlert({
        message: t("BulkStockManagementV2.updated", "Stock updated successfully"),
        severity: "success",
      })

      if (onRefresh) {
        await onRefresh()
      }
    } catch (error) {
      issueAlert(error as any)
    } finally {
      setSaving((prev) => ({ ...prev, [lot.lot_id]: false }))
    }
  }

  // Handle checkbox selection
  const handleSelectLot = (lotId: string, checked: boolean) => {
    setSelectedLots((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(lotId)
      } else {
        next.delete(lotId)
      }
      return next
    })
  }

  // Handle select all
  const handleSelectAll = () => {
    if (selectedLots.size === lots.length) {
      setSelectedLots(new Set())
    } else {
      setSelectedLots(new Set(lots.map((lot) => lot.lot_id)))
    }
  }

  // Handle select by quality tier
  const handleSelectByQualityTier = (tier: number) => {
    const lotsWithTier = lots.filter(
      (lot) => lot.variant.attributes.quality_tier === tier,
    )
    setSelectedLots(new Set(lotsWithTier.map((lot) => lot.lot_id)))
  }

  // Handle bulk action initiation
  const handleBulkAction = (action: BulkAction) => {
    setDialogState({
      open: true,
      action,
      quantity: action === "update_quantity" ? 0 : undefined,
      locationId: action === "transfer_location" ? "" : undefined,
    })
  }

  // Handle bulk action confirmation
  const handleBulkActionConfirm = async () => {
    if (!dialogState.action) return

    const selectedLotIds = Array.from(selectedLots)
    if (selectedLotIds.length === 0) return

    try {
      const updates = selectedLotIds.map((lot_id) => {
        const update: any = { lot_id }

        switch (dialogState.action) {
          case "update_quantity":
            update.quantity_total = dialogState.quantity || 0
            break
          case "list_all":
            update.listed = true
            break
          case "unlist_all":
            update.listed = false
            break
          case "transfer_location":
            update.location_id = dialogState.locationId || null
            break
        }

        return update
      })

      const result = await bulkUpdate({
        bulkUpdateStockLotsRequest: { updates },
      }).unwrap()

      // Show results
      issueAlert({
        message: t(
          "BulkStockManagementV2.bulkUpdateSuccess",
          `Bulk operation completed: ${result.success_count} succeeded, ${result.failure_count} failed`,
        ),
        severity: result.failure_count > 0 ? "warning" : "success",
      })

      // Clear selection
      setSelectedLots(new Set())

      // Close dialog
      setDialogState({ open: false, action: null })

      if (onRefresh) {
        await onRefresh()
      }
    } catch (error) {
      issueAlert(error as any)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <Stack spacing={1}>
        {[1,2,3].map(i => <Skeleton key={i} variant="rectangular" height={60} sx={{ borderRadius: 1 }} />)}
      </Stack>
    )
  }

  // Error state
  if (error) {
    return (
      <Alert severity="error">
        {t(
          "BulkStockManagementV2.errorLoading",
          "Failed to load stock information",
        )}
      </Alert>
    )
  }

  if (lots.length === 0) {
    return (
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="body1" color="text.secondary" align="center">
          {t(
            "BulkStockManagementV2.noLots",
            "No stock lots found. Create your first lot to get started.",
          )}
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h6" gutterBottom>
        {t("BulkStockManagementV2.title", "Quick Stock Updates")}
      </Typography>

      <FilterSidebarLayout filters={filtersContent} filterTitle="Filters">
      {/* Bulk controls */}
      {selectedLots.size > 0 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "action.hover" }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <Typography variant="body2" color="text.secondary">
              {t(
                "BulkStockManagementV2.selectedCount",
                `${selectedLots.size} lot(s) selected`,
              )}
            </Typography>

            <Button
              size="small"
              variant="outlined"
              onClick={handleSelectAll}
              sx={{ flexShrink: 0 }}
            >
              {selectedLots.size === lots.length
                ? t("BulkStockManagementV2.deselectAll", "Deselect All")
                : t("BulkStockManagementV2.selectAll", "Select All")}
            </Button>

            {qualityTiers.length > 0 && (
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>
                  {t("BulkStockManagementV2.selectByTier", "Select by Tier")}
                </InputLabel>
                <Select
                  label={t(
                    "BulkStockManagementV2.selectByTier",
                    "Select by Tier",
                  )}
                  value=""
                  onChange={(e) =>
                    handleSelectByQualityTier(Number(e.target.value))
                  }
                >
                  {qualityTiers.map((tier) => (
                    <MenuItem key={tier} value={tier}>
                      {t("BulkStockManagementV2.tier", "Tier")} {tier}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <FormControl size="small" sx={{ minWidth: 200, flex: 1 }}>
              <InputLabel>
                {t("BulkStockManagementV2.bulkAction", "Bulk Action")}
              </InputLabel>
              <Select
                label={t("BulkStockManagementV2.bulkAction", "Bulk Action")}
                value=""
                onChange={(e) => handleBulkAction(e.target.value as BulkAction)}
              >
                <MenuItem value="update_quantity">
                  {t(
                    "BulkStockManagementV2.updateQuantity",
                    "Update Quantity",
                  )}
                </MenuItem>
                <MenuItem value="list_all">
                  {t("BulkStockManagementV2.listAll", "List All")}
                </MenuItem>
                <MenuItem value="unlist_all">
                  {t("BulkStockManagementV2.unlistAll", "Unlist All")}
                </MenuItem>
                <MenuItem value="transfer_location">
                  {t(
                    "BulkStockManagementV2.transferLocation",
                    "Transfer Location",
                  )}
                </MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Paper>
      )}

      {/* Lot items */}
      <Stack spacing={2} sx={{ mt: 2 }}>
        {filteredLots.map((lot) => {
          const lotId = lot.lot_id
          const currentQty = lot.quantity_total
          const pendingQty = quantities[lotId]
          const hasChanges = pendingQty !== undefined && pendingQty !== currentQty
          const isSaving = saving[lotId]
          const isSelected = selectedLots.has(lotId)

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
                {/* Checkbox for bulk selection */}
                <Checkbox
                  checked={isSelected}
                  onChange={(e) => handleSelectLot(lotId, e.target.checked)}
                  disabled={isSaving}
                />

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
                        label={`${currentQty.toLocaleString()} ${t("BulkStockManagementV2.inStock", "in stock")}`}
                        size="small"
                        variant="outlined"
                      />
                      {lot.variant.attributes.quality_tier && (
                        <Chip
                          label={`${t("BulkStockManagementV2.tier", "Tier")} ${lot.variant.attributes.quality_tier}`}
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
                        <Chip
                          label={lot.location.name}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      <Chip
                        label={
                          lot.listed
                            ? t("BulkStockManagementV2.listed", "Listed")
                            : t("BulkStockManagementV2.unlisted", "Unlisted")
                        }
                        size="small"
                        variant="outlined"
                        color={lot.listed ? "success" : "default"}
                      />
                    </Stack>
                    {lot.notes && (
                      <Typography variant="caption" color="text.secondary">
                        {lot.notes}
                      </Typography>
                    )}
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

                  {/* Manual input */}
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

                  {/* Save button */}
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

                  {/* Advanced stock management link */}
                  <IconButton
                    size="small"
                    component={Link}
                    to={`/market/stock/${listingId}`}
                    sx={{ ml: 1 }}
                  >
                    <InventoryRounded />
                  </IconButton>

                  {/* Delete lot */}
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteLot(lot)}
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
      </FilterSidebarLayout>

      {/* Bulk Action Confirmation Dialog */}
      <Dialog
        open={dialogState.open}
        onClose={() => setDialogState({ open: false, action: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t("BulkStockManagementV2.confirmAction", "Confirm Bulk Action")}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2">
              {t(
                "BulkStockManagementV2.affectedLots",
                `This action will affect ${selectedLots.size} lot(s).`,
              )}
            </Typography>

            {dialogState.action === "update_quantity" && (
              <TextField
                label={t("BulkStockManagementV2.newQuantity", "New Quantity")}
                type="number"
                value={dialogState.quantity || 0}
                onChange={(e) =>
                  setDialogState((prev) => ({
                    ...prev,
                    quantity: parseInt(e.target.value) || 0,
                  }))
                }
                fullWidth
                inputProps={{ min: 0 }}
              />
            )}

            {dialogState.action === "transfer_location" && (
              <FormControl fullWidth>
                <InputLabel>
                  {t("BulkStockManagementV2.newLocation", "New Location")}
                </InputLabel>
                <Select
                  value={dialogState.locationId || ""}
                  onChange={(e) =>
                    setDialogState((prev) => ({
                      ...prev,
                      locationId: e.target.value,
                    }))
                  }
                  label={t(
                    "BulkStockManagementV2.newLocation",
                    "New Location",
                  )}
                >
                  <MenuItem value="">
                    {t("BulkStockManagementV2.unspecified", "Unspecified")}
                  </MenuItem>
                  {locations.map((location) => (
                    <MenuItem key={location.location_id} value={location.location_id}>
                      {location.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {dialogState.action === "list_all" && (
              <Typography variant="body2">
                {t(
                  "BulkStockManagementV2.listAllConfirm",
                  "All selected lots will be marked as listed and available for sale.",
                )}
              </Typography>
            )}

            {dialogState.action === "unlist_all" && (
              <Typography variant="body2">
                {t(
                  "BulkStockManagementV2.unlistAllConfirm",
                  "All selected lots will be marked as unlisted and unavailable for sale.",
                )}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDialogState({ open: false, action: null })}
          >
            {t("BulkStockManagementV2.cancel", "Cancel")}
          </Button>
          <Button
            onClick={handleBulkActionConfirm}
            variant="contained"
            color="primary"
          >
            {t("BulkStockManagementV2.confirm", "Confirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}
