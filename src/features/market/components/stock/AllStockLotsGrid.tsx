/**
 * All Stock Lots Grid (V2)
 *
 * Data grid showing all stock lots using V2 endpoints with proper types.
 * Displays listing name, quality chips, quantity, location, owner, listed toggle.
 */

import React, { useState, useMemo } from "react"
import {
  GridColDef,
  GridRenderCellParams,
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
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
} from "@mui/material"
import { Delete as DeleteIcon } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import {
  useGetStockLotsQuery,
  useGetMyListingsQuery,
  useUpdateStockLotMutation,
  useDeleteStockLotMutation,
  StockLotDetail,
  MyListingItem,
} from "../../../../store/api/v2/market"
import { QualityBadge } from "../../../../components/market/v2/QualityBadge"
import { formatCraftedSource } from "../../../../util/variantDisplay"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"

interface StockLotRow {
  id: string
  lot_id: string
  listing_id: string
  listing_title: string
  listing_photo?: string
  quantity: number
  location_name: string | null
  owner_username: string | null
  owner_avatar: string | null
  listed: boolean
  notes: string | null
  quality_tier: number | null
  crafted_source: string | null
}

export function AllStockLotsGrid() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()

  const { data: lotsData } = useGetStockLotsQuery({ page: 1, pageSize: 200 })
  const { data: listingsData } = useGetMyListingsQuery({ status: "active", page: 1, pageSize: 200 })
  const [updateLot] = useUpdateStockLotMutation()
  const [deleteLot] = useDeleteStockLotMutation()

  const [editingQualityLotId, setEditingQualityLotId] = useState<string | null>(null)
  const [qualityTier, setQualityTier] = useState<number | "">("")
  const [craftedSource, setCraftedSource] = useState<string>("")

  // Build a listing lookup map
  const listingMap = useMemo(() => {
    const map = new Map<string, MyListingItem>()
    for (const l of listingsData?.listings || []) {
      map.set(l.listing_id, l)
    }
    return map
  }, [listingsData])

  // Map lots to grid rows
  const rows: StockLotRow[] = useMemo(() => {
    return (lotsData?.lots || []).map((lot: StockLotDetail) => {
      // Find listing for this lot — need to get listing_id from the lot
      // StockLotDetail has item_id but not listing_id directly, we need to match via listings
      const listing = listingsData?.listings.find((l) =>
        l.listing_id === (lot as unknown as { listing_id?: string }).listing_id
      )
      return {
        id: lot.lot_id,
        lot_id: lot.lot_id,
        listing_id: (lot as unknown as { listing_id?: string }).listing_id || "",
        listing_title: listing?.title || "Unknown",
        listing_photo: listing?.photo,
        quantity: lot.quantity_total,
        location_name: lot.location?.name || null,
        owner_username: lot.owner?.username || null,
        owner_avatar: lot.owner?.avatar || null,
        listed: lot.listed,
        notes: lot.notes,
        quality_tier: lot.variant.attributes.quality_tier ?? null,
        crafted_source: lot.variant.attributes.crafted_source ?? null,
      }
    })
  }, [lotsData, listingsData])

  const columns: GridColDef[] = useMemo(() => [
    {
      field: "listing_title",
      headerName: t("AllStockLots.listing", "Listing"),
      flex: 2,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar
            src={params.row.listing_photo || undefined}
            variant="rounded"
            sx={{ width: 32, height: 32 }}
          />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "quality_tier",
      headerName: t("AllStockLots.quality", "Quality"),
      flex: 1.5,
      renderCell: (params: GridRenderCellParams) => {
        const hasVariant = params.row.quality_tier != null || params.row.crafted_source
        return (
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: hasVariant ? "pointer" : "default" }}
            onClick={hasVariant ? () => {
              setQualityTier(params.row.quality_tier ?? "")
              setCraftedSource(params.row.crafted_source ?? "")
              setEditingQualityLotId(params.row.lot_id)
            } : undefined}
          >
            {params.row.quality_tier != null && (
              <QualityBadge tier={params.row.quality_tier} size="small" />
            )}
            {params.row.crafted_source && (
              <Chip
                label={formatCraftedSource(params.row.crafted_source)}
                size="small"
                variant="outlined"
              />
            )}
            {!hasVariant && (
              <Typography variant="caption" color="text.secondary">—</Typography>
            )}
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
          {params.value || "Unspecified"}
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
            <Avatar
              src={params.row.owner_avatar || undefined}
              variant="rounded"
              sx={{ width: 24, height: 24 }}
            />
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
              await updateLot({
                id: params.row.lot_id,
                updateStockLotRequest: { listed: !params.value },
              }).unwrap()
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
        <IconButton
          size="small"
          onClick={async () => {
            try {
              await deleteLot({ id: params.row.lot_id }).unwrap()
              issueAlert({ message: "Lot deleted", severity: "success" })
            } catch (error) {
              issueAlert(error as { message?: string })
            }
          }}
        >
          <DeleteIcon fontSize="small" color="error" />
        </IconButton>
      ),
    },
  ], [t, updateLot, deleteLot, issueAlert])

  const handleRowUpdate = async (newRow: StockLotRow, oldRow: StockLotRow) => {
    if (newRow.quantity !== oldRow.quantity) {
      try {
        await updateLot({
          id: newRow.lot_id,
          updateStockLotRequest: { quantity_total: newRow.quantity },
        }).unwrap()
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
        pageSizeOptions={[24, 48, 96]}
        initialState={{
          pagination: { paginationModel: { pageSize: 24 } },
        }}
        sx={{
          "& .MuiDataGrid-cell": {
            display: "flex",
            alignItems: "center",
          },
        }}
      />

      {/* Quality Edit Dialog */}
      <Dialog
        open={!!editingQualityLotId}
        onClose={() => setEditingQualityLotId(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Edit Quality</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            size="small"
            label="Quality Tier"
            value={qualityTier}
            onChange={(e) => setQualityTier(e.target.value === "" ? "" : Number(e.target.value))}
            sx={{ mt: 1, mb: 2 }}
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value={1}>Tier 1</MenuItem>
            <MenuItem value={2}>Tier 2</MenuItem>
            <MenuItem value={3}>Tier 3</MenuItem>
            <MenuItem value={4}>Tier 4</MenuItem>
            <MenuItem value={5}>Tier 5</MenuItem>
          </TextField>
          <TextField
            select
            fullWidth
            size="small"
            label="Source"
            value={craftedSource}
            onChange={(e) => setCraftedSource(e.target.value)}
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="store">Store-Bought</MenuItem>
            <MenuItem value="crafted">Crafted</MenuItem>
            <MenuItem value="looted">Looted</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingQualityLotId(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (!editingQualityLotId) return
              const variant_attributes: Record<string, unknown> = {}
              if (qualityTier !== "") variant_attributes.quality_tier = qualityTier
              if (craftedSource) variant_attributes.crafted_source = craftedSource

              try {
                await updateLot({
                  id: editingQualityLotId,
                  updateStockLotRequest: { variant_attributes },
                }).unwrap()
                issueAlert({ message: "Quality updated", severity: "success" })
                setEditingQualityLotId(null)
              } catch (error) {
                issueAlert(error as { message?: string })
              }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}
