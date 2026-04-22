/**
 * StockManagerV2 — V2 equivalent of V1 AllStockLotsGrid.
 *
 * Uses LazyDataGrid with inline editing, matching V1's column layout:
 * listing (variant display_name), quantity, location, listed, notes, actions.
 * Adds V2-specific quality tier column.
 * Uses V2 RTK Query hooks exclusively.
 */

import React, { useState, useCallback, useMemo } from "react"
import {
  GridColDef,
  GridRenderCellParams,
  GridRenderEditCellParams,
  useGridApiContext,
} from "@mui/x-data-grid"
import { LazyDataGrid as DataGrid } from "../../../components/grid/LazyDataGrid"
import {
  Paper,
  Typography,
  Chip,
  IconButton,
  Box,
  Button,
  Autocomplete,
  TextField,
} from "@mui/material"
import {
  Delete as DeleteIcon,
  Save as SaveIcon,
  Add as AddIcon,
} from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import {
  useGetStockLotsQuery,
  useGetListingDetailQuery,
  useCreateStockLotMutation,
  useUpdateStockLotMutation,
  useDeleteStockLotMutation,
  type StockLotDetail,
  type LocationInfo,
} from "../../../store/api/v2/market"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { getQualityMode, formatQuality, type QualityMode } from "../../../util/qualityMode"

export interface StockManagerV2Props {
  listingId: string
  itemId: string
  onClose?: () => void
}

export function StockManagerV2({ listingId, itemId, onClose }: StockManagerV2Props) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()

  const { data: lotsData } = useGetStockLotsQuery({ listingId })
  const { data: listingDetail } = useGetListingDetailQuery({ id: listingId }, { skip: !listingId })
  const [createLot] = useCreateStockLotMutation()
  const [updateLot] = useUpdateStockLotMutation()
  const [deleteLot] = useDeleteStockLotMutation()

  const qualityMode: QualityMode = useMemo(
    () => getQualityMode(listingDetail?.items?.[0]?.game_item?.type),
    [listingDetail],
  )

  const [newRows, setNewRows] = useState<any[]>([])

  const lots = lotsData?.lots ?? []

  // Extract unique locations from lot data
  const locations = useMemo(() => {
    const map = new Map<string, LocationInfo>()
    lots.forEach((lot) => {
      if (lot.location) map.set(lot.location.location_id, lot.location)
    })
    return Array.from(map.values())
  }, [lots])

  // Location edit cell — matches V1 LocationEditCell pattern
  function LocationEditCell(props: GridRenderEditCellParams) {
    const { id, value, field } = props
    const apiRef = useGridApiContext()
    const [inputValue, setInputValue] = useState("")

    const filtered = locations.filter((loc) =>
      loc.name.toLowerCase().includes(inputValue.toLowerCase()),
    )
    const selected = locations.find((l) => l.location_id === value) ?? null

    return (
      <Autocomplete
        value={selected}
        onChange={(_, v) =>
          apiRef.current.setEditCellValue({ id, field, value: v?.location_id ?? null })
        }
        inputValue={inputValue}
        onInputChange={(_, v) => setInputValue(v)}
        options={filtered}
        getOptionLabel={(o) => o.name}
        renderInput={(params) => (
          <TextField {...params} size="medium" placeholder={t("AllStockLots.selectLocation", "Select location...")} />
        )}
        fullWidth
        size="medium"
        disablePortal={false}
        sx={{ height: "100%" }}
      />
    )
  }

  const renderLocationEditCell = useCallback(
    (props: GridRenderEditCellParams) => <LocationEditCell {...props} />,
    [locations, t],
  )

  // Map lots to rows
  const allLots = lots.map((lot) => ({
    id: lot.lot_id,
    lot_id: lot.lot_id,
    variant_display_name: lot.variant.display_name,
    variant_short_name: lot.variant.short_name,
    quality_tier: lot.variant.attributes.quality_tier ?? null,
    quality_value: lot.variant.attributes.quality_value ?? null,
    crafted_source: lot.variant.attributes.crafted_source ?? null,
    quantity: lot.quantity_total,
    location_id: lot.location?.location_id ?? null,
    location_name: lot.location?.name ?? null,
    listed: lot.listed,
    notes: lot.notes ?? "",
  }))

  const rows = [...newRows, ...allLots]

  const columns: GridColDef[] = [
    {
      field: "variant_display_name",
      headerName: t("AllStockLots.listing", "Variant"),
      flex: 2,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">{params.value}</Typography>
      ),
    },
    {
      field: "quality_tier",
      headerName: t("StockManagerV2.qualityTier", "Quality"),
      flex: 1,
      editable: qualityMode !== "none",
      type: qualityMode === "numeric" ? "number" as const : undefined,
      renderCell: (params: GridRenderCellParams) => {
        if (qualityMode === "none") return <Typography variant="body2" color="text.disabled">—</Typography>
        if (qualityMode === "numeric") {
          const qv = params.row.quality_value as number | null
          return qv != null
            ? <Chip label={`Q${qv}`} size="small" variant="outlined" />
            : <Typography variant="body2" color="text.disabled">—</Typography>
        }
        // tiered
        const tier = params.value as number | null
        if (!tier) return <Typography variant="body2" color="text.disabled">—</Typography>
        return (
          <Chip
            label={`Tier ${tier}`}
            size="small"
            color={tier >= 4 ? "success" : tier >= 3 ? "primary" : "default"}
            variant="outlined"
          />
        )
      },
      renderEditCell: qualityMode === "tiered"
        ? (params: GridRenderEditCellParams) => {
            const api = useGridApiContext()
            return (
              <TextField
                select
                fullWidth
                size="small"
                value={params.value ?? ""}
                onChange={(e) => {
                  const val = e.target.value === "" ? null : Number(e.target.value)
                  api.current.setEditCellValue({ id: params.id, field: "quality_tier", value: val })
                }}
                SelectProps={{ native: true }}
              >
                <option value="">—</option>
                <option value="1">Tier 1</option>
                <option value="2">Tier 2</option>
                <option value="3">Tier 3</option>
                <option value="4">Tier 4</option>
                <option value="5">Tier 5</option>
              </TextField>
            )
          }
        : undefined,
      valueGetter: qualityMode === "numeric"
        ? (_value: any, row: any) => row.quality_value
        : undefined,
      valueSetter: qualityMode === "numeric"
        ? (value: any, row: any) => ({ ...row, quality_value: value })
        : undefined,
    },
    {
      field: "quantity",
      headerName: t("AllStockLots.quantity", "Quantity"),
      flex: 1,
      editable: true,
      type: "number" as const,
      valueParser: (value: string) => {
        const parsed = Number(value)
        return isNaN(parsed) ? 0 : Math.max(0, parsed)
      },
    },
    {
      field: "location_id",
      headerName: t("AllStockLots.location", "Location"),
      flex: 1.5,
      minWidth: 200,
      editable: true,
      renderEditCell: renderLocationEditCell,
      valueFormatter: (value: string) => {
        const loc = locations.find((l) => l.location_id === value)
        return loc?.name ?? "Unspecified"
      },
    },
    {
      field: "listed",
      headerName: t("AllStockLots.listed", "Listed"),
      flex: 1,
      editable: true,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value ? t("ui.yes", "Yes") : t("ui.no", "No")}
          color={params.value ? "success" : "default"}
          size="small"
        />
      ),
    },
    {
      field: "notes",
      headerName: t("AllStockLots.notes", "Notes"),
      flex: 2,
      editable: true,
    },
    {
      field: "actions",
      headerName: t("AllStockLots.actions", "Actions"),
      flex: 1,
      renderCell: (params: GridRenderCellParams) => {
        const isNew = String(params.row.id).startsWith("new-")
        return (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {isNew && (
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleSaveNew(params.row)}
              >
                <SaveIcon />
              </IconButton>
            )}
            <IconButton
              size="small"
              onClick={() =>
                isNew
                  ? handleCancelNew(params.row.id)
                  : handleDelete(params.row.lot_id)
              }
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        )
      },
    },
  ]

  const handleDelete = async (lotId: string) => {
    try {
      await deleteLot({ id: lotId }).unwrap()
      issueAlert({ message: t("AllStockLots.deleted", "Lot deleted"), severity: "success" })
    } catch (error) {
      issueAlert(error as any)
    }
  }

  const handleRowUpdate = async (newRow: any, oldRow: any) => {
    if (String(newRow.id).startsWith("new-")) return newRow

    // Build variant_attributes if quality changed
    const qualityChanged =
      newRow.quality_tier !== oldRow.quality_tier ||
      newRow.quality_value !== oldRow.quality_value
    const variantAttrs = qualityChanged
      ? {
          quality_tier: newRow.quality_tier ?? undefined,
          quality_value: newRow.quality_value ?? undefined,
          crafted_source: newRow.crafted_source ?? undefined,
        }
      : undefined

    try {
      const result = await updateLot({
        id: newRow.lot_id,
        updateStockLotRequest: {
          quantity_total: Number(newRow.quantity),
          location_id: newRow.location_id ?? undefined,
          listed: newRow.listed,
          notes: newRow.notes || null,
          variant_attributes: variantAttrs,
        },
      }).unwrap()

      issueAlert({ message: t("AllStockLots.updated", "Lot updated"), severity: "success" })

      const lot = result.lot
      return {
        id: lot.lot_id,
        lot_id: lot.lot_id,
        variant_display_name: lot.variant.display_name,
        variant_short_name: lot.variant.short_name,
        quality_tier: lot.variant.attributes.quality_tier ?? null,
        quality_value: lot.variant.attributes.quality_value ?? null,
        crafted_source: lot.variant.attributes.crafted_source ?? null,
        quantity: lot.quantity_total,
        location_id: lot.location?.location_id ?? null,
        location_name: lot.location?.name ?? null,
        listed: lot.listed,
        notes: lot.notes ?? "",
      }
    } catch (error) {
      issueAlert(error as any)
      return oldRow
    }
  }

  const handleSaveNew = async (row: any) => {
    try {
      await createLot({
        createStockLotRequest: {
          item_id: itemId,
          quantity: Number(row.quantity) || 0,
          variant_attributes: {},
          location_id: row.location_id ?? undefined,
          listed: row.listed ?? true,
          notes: row.notes || undefined,
        },
      }).unwrap()

      issueAlert({ message: t("AllStockLots.created", "Lot created"), severity: "success" })
      setNewRows((prev) => prev.filter((r) => r.id !== row.id))
    } catch (error) {
      issueAlert(error as any)
    }
  }

  const handleCancelNew = (rowId: string) => {
    setNewRows((prev) => prev.filter((r) => r.id !== rowId))
  }

  const handleAddRow = () => {
    const newId = `new-${Date.now()}`
    setNewRows((prev) => [
      ...prev,
      {
        id: newId,
        lot_id: null,
        variant_display_name: "New Lot",
        variant_short_name: "",
        quality_tier: null,
        quality_value: null,
        crafted_source: null,
        quantity: 0,
        location_id: null,
        location_name: null,
        listed: true,
        notes: "",
      },
    ])
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
        disableRowSelectionOnClick
        slots={{
          toolbar: () => (
            <Box
              sx={{
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">
                {t("AllStockLots.title", "All Stock Lots")}
              </Typography>
              <Button
                size="small"
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddRow}
              >
                {t("AllStockLots.addLot", "Add Lot")}
              </Button>
            </Box>
          ),
        }}
        showToolbar
        sx={{
          "& .MuiDataGrid-cell": {
            display: "flex",
            alignItems: "center",
          },
        }}
      />
    </Paper>
  )
}
