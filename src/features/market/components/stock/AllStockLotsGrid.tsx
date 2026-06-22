/**
 * All Stock Lots Grid
 *
 * - Wired to StockSearchContext filters (location, status, text search, qty range)
 * - Server-side pagination
 * - Bulk list/unlist via checkbox selection
 * - Confirm-before-delete dialog
 * - Quality edit on every lot (not just ones with existing quality)
 * - Stats strip (total, listed qty, unlisted qty)
 * - Add Lot dialog
 */

import React, { useState, useMemo, useCallback } from "react"
import {
  GridColDef,
  GridRenderCellParams,
  GridRowSelectionModel,
} from "@mui/x-data-grid"
import { LazyDataGrid as DataGrid } from "../../../../components/grid/LazyDataGrid"
import {
  Paper,
  Typography,
  Chip,
  Box,
  Button,
  Avatar,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Stack,
  Tooltip,
  FormControlLabel,
  CircularProgress,
} from "@mui/material"
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  PlaylistAdd as ListIcon,
  PlaylistRemove as UnlistIcon,
  EditRounded,
} from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import {
  useGetStockLotsQuery,
  useGetMyListingsQuery,
  useUpdateStockLotMutation,
  useDeleteStockLotMutation,
  useCreateStockLotMutation,
  useBulkUpdateStockLotsMutation,
  StockLotDetail,
  MyListingItem,
} from "../../../../store/api/v2/market"
import { QualityBadge } from "../../../../components/market/v2/QualityBadge"
import { formatCraftedSource, hasDisplayableSource } from "../../../../util/variantDisplay"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"
import { useStockSearch } from "./StockSearchContext"
import { LocationSelector } from "./LocationSelector"
import { useOptionalShopRouteContext } from "../../../../components/router/ShopContextFromRoute"

/* ── Row type ── */

interface StockLotRow {
  id: string
  lot_id: string
  listing_id: string
  listing_title: string
  listing_photo?: string
  quantity: number
  location_id: string | null
  location_name: string | null
  owner_username: string | null
  owner_avatar: string | null
  listed: boolean
  notes: string | null
  quality_tier: number | null
  crafted_source: string | null
}

/* ── Quality edit dialog ── */

function QualityEditDialog({
  open,
  onClose,
  lotId,
  initialTier,
  initialSource,
}: {
  open: boolean
  onClose: () => void
  lotId: string | null
  initialTier: number | null
  initialSource: string | null
}) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [updateLot, { isLoading }] = useUpdateStockLotMutation()
  const [qualityTier, setQualityTier] = useState<number | "">("")
  const [craftedSource, setCraftedSource] = useState<string>("")

  // Sync initial values when dialog opens
  React.useEffect(() => {
    if (open) {
      setQualityTier(initialTier ?? "")
      setCraftedSource(initialSource ?? "")
    }
  }, [open, initialTier, initialSource])

  const handleSave = async () => {
    if (!lotId) return
    const variant_attributes: Record<string, unknown> = {}
    if (qualityTier !== "") variant_attributes.quality_tier = qualityTier
    if (craftedSource) variant_attributes.crafted_source = craftedSource

    try {
      await updateLot({
        id: lotId,
        updateStockLotRequest: { variant_attributes },
      }).unwrap()
      issueAlert({ message: t("AllStockLots.qualityUpdated", "Quality updated"), severity: "success" })
      onClose()
    } catch (error) {
      issueAlert(error as { message?: string })
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t("AllStockLots.editQuality", "Edit Quality")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            select
            fullWidth
            size="small"
            label={t("AllStockLots.qualityTier", "Quality Tier")}
            value={qualityTier}
            onChange={(e) => setQualityTier(e.target.value === "" ? "" : Number(e.target.value))}
          >
            <MenuItem value="">{t("common.none", "None")}</MenuItem>
            {[1, 2, 3, 4, 5].map((tier) => (
              <MenuItem key={tier} value={tier}>Tier {tier}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            size="small"
            label={t("AllStockLots.source", "Source")}
            value={craftedSource}
            onChange={(e) => setCraftedSource(e.target.value)}
          >
            <MenuItem value="">{t("common.none", "None")}</MenuItem>
            <MenuItem value="store">{t("AllStockLots.storeBought", "Store-Bought")}</MenuItem>
            <MenuItem value="crafted">{t("AllStockLots.crafted", "Crafted")}</MenuItem>
            <MenuItem value="looted">{t("AllStockLots.looted", "Looted")}</MenuItem>
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>{t("common.cancel", "Cancel")}</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
        >
          {t("common.save", "Save")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

/* ── Confirm delete dialog ── */

function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}) {
  const { t } = useTranslation()
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t("AllStockLots.confirmDeleteTitle", "Delete lot?")}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t("AllStockLots.confirmDeleteBody", "This lot will be permanently deleted and cannot be recovered.")}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>{t("common.cancel", "Cancel")}</Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : undefined}
        >
          {t("common.delete", "Delete")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

/* ── Add Lot dialog ── */

function AddLotDialog({
  open,
  onClose,
  listings,
}: {
  open: boolean
  onClose: () => void
  listings: MyListingItem[]
}) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [createLot, { isLoading }] = useCreateStockLotMutation()

  const [listingId, setListingId] = useState("")
  const [qty, setQty] = useState(1)
  const [locationId, setLocationId] = useState<string | null>(null)
  const [listed, setListed] = useState(true)
  const [qualityTier, setQualityTier] = useState<number | "">("")
  const [notes, setNotes] = useState("")

  const reset = () => {
    setListingId("")
    setQty(1)
    setLocationId(null)
    setListed(true)
    setQualityTier("")
    setNotes("")
  }

  const handleClose = () => {
    if (!isLoading) { reset(); onClose() }
  }

  const handleCreate = async () => {
    if (!listingId) {
      issueAlert({ message: t("AllStockLots.selectListing", "Select a listing"), severity: "error" })
      return
    }
    if (qty <= 0) {
      issueAlert({ message: t("AllStockLots.qtyRequired", "Quantity must be greater than 0"), severity: "error" })
      return
    }
    try {
      await createLot({
        createStockLotRequest: {
          item_id: listingId,
          quantity: qty,
          variant_attributes: qualityTier !== "" ? { quality_tier: qualityTier } : {},
          location_id: locationId ?? undefined,
          listed,
          notes: notes.trim() || undefined,
        },
      }).unwrap()
      issueAlert({ message: t("AllStockLots.created", "Lot created"), severity: "success" })
      handleClose()
    } catch (error) {
      issueAlert(error as { message?: string })
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("AllStockLots.addLot", "Add Stock Lot")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            select
            fullWidth
            size="small"
            label={t("AllStockLots.listing", "Listing")}
            value={listingId}
            onChange={(e) => setListingId(e.target.value)}
            required
          >
            <MenuItem value="">{t("AllStockLots.selectListing", "Select a listing...")}</MenuItem>
            {listings.map((l) => (
              <MenuItem key={l.listing_id} value={l.listing_id}>{l.title}</MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            size="small"
            label={t("AllStockLots.quantity", "Quantity")}
            type="number"
            value={qty}
            onChange={(e) => setQty(parseInt(e.target.value) || 0)}
            inputProps={{ min: 1 }}
            error={qty <= 0}
          />
          <TextField
            select
            fullWidth
            size="small"
            label={t("AllStockLots.qualityTier", "Quality Tier (optional)")}
            value={qualityTier}
            onChange={(e) => setQualityTier(e.target.value === "" ? "" : Number(e.target.value))}
          >
            <MenuItem value="">{t("common.none", "None")}</MenuItem>
            {[1, 2, 3, 4, 5].map((tier) => (
              <MenuItem key={tier} value={tier}>Tier {tier}</MenuItem>
            ))}
          </TextField>
          <LocationSelector value={locationId} onChange={setLocationId} size="small" fullWidth />
          <FormControlLabel
            control={<Switch checked={listed} onChange={(e) => setListed(e.target.checked)} size="small" />}
            label={
              <Box>
                <Typography variant="body2">{t("AllStockLots.listed", "Listed")}</Typography>
                <Typography variant="caption" color="text.secondary">{t("AllStockLots.listedHelp", "Show in public listings")}</Typography>
              </Box>
            }
          />
          <TextField
            fullWidth
            size="small"
            label={t("AllStockLots.notes", "Notes (optional)")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            rows={2}
            inputProps={{ maxLength: 1000 }}
            helperText={`${notes.length}/1000`}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>{t("common.cancel", "Cancel")}</Button>
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={isLoading || !listingId || qty <= 0}
          startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
        >
          {t("common.create", "Create")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

/* ── Main component ── */

export function AllStockLotsGrid() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const { filters } = useStockSearch()
  const shopCtx = useOptionalShopRouteContext()
  const spectrumId = shopCtx?.shop.owner_contractor_id ?? undefined

  // Map status filter → API listed param
  const listed =
    filters.status === "available" ? true :
    filters.status === "allocated" ? false :
    undefined

  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(24)
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({ type: "include", ids: new Set() })
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [editQualityLot, setEditQualityLot] = useState<{ lotId: string; tier: number | null; source: string | null } | null>(null)
  const [addLotOpen, setAddLotOpen] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)

  const { data: lotsData, isLoading } = useGetStockLotsQuery({
    locationId: filters.locationId ?? undefined,
    listed,
    page: page + 1,
    pageSize,
  })
  const { data: listingsData } = useGetMyListingsQuery({
    status: "active",
    page: 1,
    pageSize: 200,
    spectrumId,
  })
  const [updateLot] = useUpdateStockLotMutation()
  const [deleteLot, { isLoading: deleting }] = useDeleteStockLotMutation()
  const [bulkUpdate] = useBulkUpdateStockLotsMutation()

  const listings = listingsData?.listings ?? []

  // Build listing map for photo lookup
  const listingMap = useMemo(() => {
    const map = new Map<string, MyListingItem>()
    for (const l of listings) map.set(l.listing_id, l)
    return map
  }, [listings])

  // Map raw lots → grid rows
  const allRows: StockLotRow[] = useMemo(() => {
    return (lotsData?.lots || []).map((lot: StockLotDetail) => ({
      id: lot.lot_id,
      lot_id: lot.lot_id,
      listing_id: lot.listing_id,
      listing_title: lot.listing_title,
      listing_photo: listingMap.get(lot.listing_id)?.photo,
      quantity: lot.quantity_total,
      location_id: lot.location?.location_id ?? null,
      location_name: lot.location?.name || null,
      owner_username: lot.owner?.username || null,
      owner_avatar: lot.owner?.avatar_url || null,
      listed: lot.listed,
      notes: lot.notes,
      quality_tier: lot.variant.attributes.quality_tier ?? null,
      crafted_source: lot.variant.attributes.crafted_source ?? null,
    }))
  }, [lotsData, listingMap])

  // Client-side filter for search + qty range (API doesn't support these params)
  const rows = useMemo(() => {
    let r = allRows
    if (filters.search) {
      const s = filters.search.toLowerCase()
      r = r.filter(
        (row) =>
          row.listing_title?.toLowerCase().includes(s) ||
          row.location_name?.toLowerCase().includes(s) ||
          row.owner_username?.toLowerCase().includes(s) ||
          row.notes?.toLowerCase().includes(s),
      )
    }
    if (filters.minQuantity) {
      const min = parseInt(filters.minQuantity)
      if (!isNaN(min)) r = r.filter((row) => row.quantity >= min)
    }
    if (filters.maxQuantity) {
      const max = parseInt(filters.maxQuantity)
      if (!isNaN(max)) r = r.filter((row) => row.quantity <= max)
    }
    return r
  }, [allRows, filters.search, filters.minQuantity, filters.maxQuantity])

  // Stats

  // Bulk list / unlist
  const handleBulkListed = useCallback(async (newListed: boolean) => {
    const ids = [...selectionModel.ids].map(String)
    if (ids.length === 0) return
    setBulkLoading(true)
    try {
      await bulkUpdate({
        bulkUpdateStockLotsRequest: {
          updates: ids.map((lot_id) => ({ lot_id, listed: newListed })),
        },
      }).unwrap()
      issueAlert({ message: newListed ? t("AllStockLots.bulkListed", "Lots listed") : t("AllStockLots.bulkUnlisted", "Lots unlisted"), severity: "success" })
      setSelectionModel({ type: "include", ids: new Set() })
    } catch (error) {
      issueAlert(error as { message?: string })
    } finally {
      setBulkLoading(false)
    }
  }, [selectionModel.ids, bulkUpdate, issueAlert, t])

  // Delete
  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmDeleteId) return
    try {
      await deleteLot({ id: confirmDeleteId }).unwrap()
      issueAlert({ message: t("AllStockLots.deleted", "Lot deleted"), severity: "success" })
      setConfirmDeleteId(null)
    } catch (error) {
      issueAlert(error as { message?: string })
    }
  }, [confirmDeleteId, deleteLot, issueAlert, t])

  const hasSelection = selectionModel.ids.size > 0

  const columns: GridColDef[] = useMemo(() => [
    {
      field: "listing_title",
      headerName: t("AllStockLots.listing", "Listing"),
      flex: 2,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar src={params.row.listing_photo || undefined} variant="rounded" sx={{ width: 32, height: 32 }} />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "quality_tier",
      headerName: t("AllStockLots.quality", "Quality"),
      flex: 1.5,
      renderCell: (params: GridRenderCellParams) => {
        const hasBadge = params.row.quality_tier != null || hasDisplayableSource(params.row.crafted_source)
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {params.row.quality_tier != null && <QualityBadge tier={params.row.quality_tier} size="small" />}
            {hasDisplayableSource(params.row.crafted_source) && (
              <Chip label={formatCraftedSource(params.row.crafted_source)} size="small" variant="outlined" />
            )}
            {!hasBadge && <Typography variant="caption" color="text.secondary">—</Typography>}
            <Tooltip title={t("AllStockLots.editQuality", "Edit quality")}>
              <IconButton
                size="small"
                sx={{ ml: 0.5 }}
                onClick={(e) => {
                  e.stopPropagation()
                  setEditQualityLot({ lotId: params.row.lot_id, tier: params.row.quality_tier, source: params.row.crafted_source })
                }}
              >
                <EditRounded sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </Box>
        )
      },
    },
    {
      field: "quantity",
      headerName: t("AllStockLots.quantity", "Qty"),
      width: 80,
      editable: true,
      type: "number",
    },
    {
      field: "location_name",
      headerName: t("AllStockLots.location", "Location"),
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" color={params.value ? "text.primary" : "text.disabled"}>
          {params.value || t("AllStockLots.unspecified", "Unspecified")}
        </Typography>
      ),
    },
    {
      field: "owner_username",
      headerName: t("AllStockLots.owner", "Owner"),
      flex: 1,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.value) return <Typography variant="body2" color="text.disabled">—</Typography>
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar src={params.row.owner_avatar || undefined} variant="rounded" sx={{ width: 24, height: 24 }} />
            <Typography variant="body2">{params.value}</Typography>
          </Box>
        )
      },
    },
    {
      field: "listed",
      headerName: t("AllStockLots.listed", "Listed"),
      width: 80,
      renderCell: (params: GridRenderCellParams) => (
        <Switch
          checked={!!params.value}
          size="small"
          onChange={async () => {
            try {
              await updateLot({ id: params.row.lot_id, updateStockLotRequest: { listed: !params.value } }).unwrap()
            } catch (error) {
              issueAlert(error as { message?: string })
            }
          }}
        />
      ),
    },
    {
      field: "actions",
      headerName: "",
      width: 50,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title={t("AllStockLots.deleteLot", "Delete lot")}>
          <IconButton size="small" onClick={() => setConfirmDeleteId(params.row.lot_id)}>
            <DeleteIcon fontSize="small" color="error" />
          </IconButton>
        </Tooltip>
      ),
    },
  ], [t, updateLot, issueAlert])

  const handleRowUpdate = async (newRow: StockLotRow, oldRow: StockLotRow) => {
    if (newRow.quantity !== oldRow.quantity) {
      try {
        await updateLot({ id: newRow.lot_id, updateStockLotRequest: { quantity_total: newRow.quantity } }).unwrap()
      } catch (error) {
        issueAlert(error as { message?: string })
        return oldRow
      }
    }
    return newRow
  }

  return (
    <Paper>
      <DataGrid
        rows={rows}
        columns={columns}
        processRowUpdate={handleRowUpdate}
        onProcessRowUpdateError={(error) => console.error(error)}
        checkboxSelection
        disableRowSelectionOnClick
        onRowSelectionModelChange={setSelectionModel}
        rowSelectionModel={selectionModel}
        paginationMode="server"
        rowCount={lotsData?.total ?? 0}
        paginationModel={{ page, pageSize }}
        onPaginationModelChange={(m) => { setPage(m.page); setPageSize(m.pageSize) }}
        pageSizeOptions={[24, 48, 96]}
        loading={isLoading}
        slots={{
          toolbar: () => (
            <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="h6">{t("AllStockLots.title", "All Stock Lots")}</Typography>
                {lotsData?.total != null && (
                  <Chip label={lotsData.total} size="small" color="primary" />
                )}
              </Box>
              <Stack direction="row" spacing={1}>
                {hasSelection && (
                  <>
                    <Button
                      size="small"
                      variant="outlined"
                      color="success"
                      startIcon={<ListIcon />}
                      onClick={() => handleBulkListed(true)}
                      disabled={bulkLoading}
                    >
                      {t("AllStockLots.bulkList", "List selected")}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<UnlistIcon />}
                      onClick={() => handleBulkListed(false)}
                      disabled={bulkLoading}
                    >
                      {t("AllStockLots.bulkUnlist", "Unlist selected")}
                    </Button>
                  </>
                )}
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setAddLotOpen(true)}
                >
                  {t("AllStockLots.addLot", "Add Lot")}
                </Button>
              </Stack>
            </Box>
          ),
        }}
        showToolbar
        sx={{ "& .MuiDataGrid-cell": { display: "flex", alignItems: "center" } }}
      />

      <AddLotDialog open={addLotOpen} onClose={() => setAddLotOpen(false)} listings={listings} />
      <QualityEditDialog
        open={!!editQualityLot}
        onClose={() => setEditQualityLot(null)}
        lotId={editQualityLot?.lotId ?? null}
        initialTier={editQualityLot?.tier ?? null}
        initialSource={editQualityLot?.source ?? null}
      />
      <ConfirmDeleteDialog
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      />
    </Paper>
  )
}
