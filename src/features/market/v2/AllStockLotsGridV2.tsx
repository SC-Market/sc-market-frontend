import { useState, useCallback, useMemo } from "react"
import { Box, Button, Chip, IconButton, Paper, Typography } from "@mui/material"
import { ImageAvatar } from "../../../components/avatar/ImageAvatar"
import {
  DeleteRounded as DeleteIcon,
  AddRounded as AddIcon,
} from "@mui/icons-material"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  GridColDef,
  GridRenderCellParams,
  GridRowModel,
  GridRenderEditCellParams,
} from "@mui/x-data-grid"
import { ThemedDataGrid as DataGrid } from "../../../components/grid/ThemedDataGrid"
import { EmptyState } from "../../../components/empty-states/EmptyState"
import { UnderlineLink } from "../../../components/typography/UnderlineLink"
import {
  useGetMyListingsQuery,
  useGetStockLotsQuery,
  useGetListingDetailQuery,
  useSearchResourcesQuery,
  type LocationInfo,
  type VariantAttributes,
} from "../../../store/api/v2/market"
import { getQualityMode } from "../../../util/qualityMode"
import { CreateLotDialogV2 } from "./components/CreateLotDialogV2"
import { MARKET_PATHS } from "../../../routes/paths"
import { useStockLotActions } from "../hooks/useStockLotActions"
import { ConfirmDialog } from "../../../components/dialog/ConfirmDialog"
import { useStockShop, useStockFilter } from "./stockLotFilters"
import { matchesLotSearch } from "./stockLotFilters"
import {
  QuantityEditCell,
  LocationEditCell,
  EditableCell,
} from "./StockLotEditCells"

export function AllStockLotsGridV2() {
  const { t } = useTranslation()
  const { filters } = useStockFilter()
  const { shopId, canEditLots } = useStockShop()

  const { data: lotsData, isLoading } = useGetStockLotsQuery({
    listingId: filters.listingId ?? undefined,
    locationId: filters.locationId ?? undefined,
    shopId,
    pageSize: 100,
  })

  const { data: listingsData } = useGetMyListingsQuery({
    pageSize: 100,
    sortBy: "updated_at",
    sortOrder: "desc",
    shopId,
  })
  const listings = listingsData?.listings ?? []

  const { deleteLot, updateLot } = useStockLotActions()

  const [addLotListingId, setAddLotListingId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  // Fetch listing detail to determine game item type when a listing is filtered
  const { data: listingDetailData } = useGetListingDetailQuery(
    { id: filters.listingId! },
    { skip: !filters.listingId },
  )
  const gameItem = listingDetailData?.items?.[0]?.game_item
  const qualityMode = getQualityMode(gameItem?.type)
  const gameItemName = gameItem?.name

  // Fetch quality bands for commodity items
  const { data: resourceData } = useSearchResourcesQuery(
    { text: gameItemName || undefined, pageSize: 1 },
    { skip: qualityMode !== "value" || !gameItemName },
  )
  const qualityBands = resourceData?.resources?.[0]?.quality_bands

  const lots = useMemo(() => lotsData?.lots ?? [], [lotsData?.lots])

  const locations = useMemo(() => {
    const map = new Map<string, LocationInfo>()
    lots.forEach((lot) => {
      if (lot.location) map.set(lot.location.location_id, lot.location)
    })
    return Array.from(map.values())
  }, [lots])

  const renderLocationEditCell = useCallback(
    (props: GridRenderEditCellParams) => (
      <LocationEditCell {...props} locations={locations} />
    ),
    [locations],
  )

  const allLots = lots
    .filter((lot) => !lot.notes?.includes("allocated"))
    .map((lot) => ({
      id: lot.lot_id,
      lot_id: lot.lot_id,
      item_id: lot.item_id,
      listing_id: lot.listing_id,
      listing_title: lot.listing_title,
      listing_photo: lot.listing_photo ?? null,
      game_item_name: lot.game_item_name ?? null,
      variant_display_name: lot.variant.display_name,
      quality_tier: lot.variant.attributes.quality_tier ?? null,
      quality_value: lot.variant.attributes.quality_value ?? null,
      crafted_source: lot.variant.attributes.crafted_source ?? null,
      quantity: lot.quantity_total,
      location_id: lot.location?.location_id ?? null,
      location_name: lot.location?.name ?? null,
      listed: lot.listed,
      notes: lot.notes ?? "",
    }))

  const rows = allLots.filter((row) => matchesLotSearch(row, filters.search))

  const columns: GridColDef[] = [
    {
      field: "game_item_name",
      headerName: t("inventory.item", "Item"),
      flex: 1.5,
      // Minimum widths: on a phone the grid scrolls sideways instead of
      // squeezing every column to a few letters
      minWidth: 140,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight={600}>
          {params.value || t("marketUi.bulkStock.customItem")}
        </Typography>
      ),
    },
    {
      field: "variant_display_name",
      headerName: t("inventory.variant", "Variant"),
      flex: 1.5,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">{params.value || "—"}</Typography>
      ),
    },
    {
      field: "quantity",
      headerName: t("inventory.quantity", "Qty"),
      flex: 0.7,
      minWidth: 90,
      editable: canEditLots,
      type: "number" as const,
      align: "right" as const,
      headerAlign: "right" as const,
      valueParser: (value: string) => Math.max(0, Number(value) || 0),
      renderEditCell: (params: GridRenderEditCellParams) => (
        <QuantityEditCell {...params} />
      ),
      renderCell: (params: GridRenderCellParams) => (
        <EditableCell params={params} canEdit={canEditLots} />
      ),
    },
    {
      field: "location_id",
      headerName: t("inventory.location", "Location"),
      flex: 1.2,
      minWidth: 160,
      editable: canEditLots,
      renderEditCell: renderLocationEditCell,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" color="text.secondary">
          {locations.find((l) => l.location_id === params.value)?.name ??
            t("marketUi.bulkStock.unspecified")}
        </Typography>
      ),
    },
    {
      field: "listing_title",
      headerName: t("inventory.listing", "Listing"),
      flex: 1.8,
      minWidth: 160,
      renderCell: (params: GridRenderCellParams) => {
        const photo = params.row.listing_photo
        const listingId = params.row.listing_id
        const title = params.value || "—"
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {photo && (
              <ImageAvatar
                alt=""
                src={photo}
                variant="rounded"
                sx={{ width: 28, height: 28 }}
              />
            )}
            {listingId ? (
              <UnderlineLink
                component={Link}
                to={MARKET_PATHS.listing(listingId)}
                variant="body2"
                noWrap
              >
                {title}
              </UnderlineLink>
            ) : (
              <Typography variant="body2" color="text.primary">
                {title}
              </Typography>
            )}
          </Box>
        )
      },
    },
    {
      field: "listed",
      headerName: t("inventory.status", "Status"),
      flex: 0.8,
      minWidth: 100,
      editable: canEditLots,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={
            params.value
              ? t("inventory.listed", "Listed")
              : t("inventory.personal", "Personal")
          }
          color={params.value ? "success" : "default"}
          size="small"
          variant="outlined"
        />
      ),
    },
    ...(canEditLots
      ? [
          {
            field: "actions",
            headerName: "",
            flex: 0.5,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
              <IconButton
                size="small"
                color="error"
                onClick={() => setPendingDelete(params.row.lot_id)}
                aria-label={t("AllStockLots.deleteLot", "Delete lot")}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            ),
          },
        ]
      : []),
  ]

  const handleDelete = async (lotId: string) => {
    setPendingDelete(null)
    await deleteLot(lotId)
  }

  const handleRowUpdate = async (
    newRow: GridRowModel,
    oldRow: GridRowModel,
  ) => {
    if (String(newRow.id).startsWith("new-")) return newRow

    // When quality bands are available, the quality_tier column carries a band
    // mapped value that should be sent as quality_value instead of quality_tier.
    const isBandMode = !!qualityBands?.length
    const qualityTierChanged = newRow.quality_tier !== oldRow.quality_tier
    const qualityValueChanged = newRow.quality_value !== oldRow.quality_value
    const qualityChanged = qualityTierChanged || qualityValueChanged

    let variantAttrs: VariantAttributes | undefined
    if (qualityChanged) {
      if (isBandMode && qualityTierChanged) {
        // The quality_tier field was edited via QualityBandSelect — interpret as quality_value
        variantAttrs = {
          quality_value: newRow.quality_tier ?? undefined,
          quality_tier: undefined,
          crafted_source: newRow.crafted_source ?? undefined,
        }
        // Update the row model so the returned row reflects the correct fields
        newRow.quality_value = newRow.quality_tier ?? null
        newRow.quality_tier = null
      } else {
        variantAttrs = {
          quality_tier: newRow.quality_tier ?? undefined,
          quality_value: newRow.quality_value ?? undefined,
          crafted_source: newRow.crafted_source ?? undefined,
        }
      }
    }

    const lot = await updateLot(newRow.lot_id, {
      quantity_total: Number(newRow.quantity),
      location_id: newRow.location_id ?? undefined,
      listed: newRow.listed,
      notes: newRow.notes || null,
      variant_attributes: variantAttrs,
    })
    if (!lot) return oldRow
    return {
      id: lot.lot_id,
      lot_id: lot.lot_id,
      listing_id: lot.item_id,
      variant_display_name: lot.variant.display_name,
      quality_tier: lot.variant.attributes.quality_tier ?? null,
      quality_value: lot.variant.attributes.quality_value ?? null,
      crafted_source: lot.variant.attributes.crafted_source ?? null,
      quantity: lot.quantity_total,
      location_id: lot.location?.location_id ?? null,
      location_name: lot.location?.name ?? null,
      listed: lot.listed,
      notes: lot.notes ?? "",
    }
  }

  const handleAddRow = () => {
    // Default to first listing or the currently filtered listing
    const defaultListing =
      filters.listingId || (listings.length > 0 ? listings[0].listing_id : "")
    setAddLotListingId(defaultListing)
  }

  return (
    <Paper>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={isLoading}
        processRowUpdate={handleRowUpdate}
        onProcessRowUpdateError={(error) => console.error(error)}
        pageSizeOptions={[24, 48, 96]}
        initialState={{ pagination: { paginationModel: { pageSize: 24 } } }}
        disableRowSelectionOnClick
        slots={{
          noRowsOverlay: () => (
            <EmptyState
              title={t("stock.noLots", "No stock lots")}
              description={t("stock.noLotsDesc")}
              guide="stockLots"
              action={
                canEditLots && listings.length > 0
                  ? {
                      label: t("AllStockLots.addLot", "Add Lot"),
                      onClick: handleAddRow,
                    }
                  : undefined
              }
              sx={{ minHeight: 200, pb: 4 }}
            />
          ),
          toolbar: () => (
            <Box sx={{ p: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="h6">
                    {t("AllStockLots.title", "All Stock Lots")}
                  </Typography>
                  <Chip label={rows.length} size="small" color="primary" />
                </Box>
                {canEditLots && (
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddRow}
                    disabled={listings.length === 0}
                  >
                    {t("AllStockLots.addLot", "Add Lot")}
                  </Button>
                )}
              </Box>
              {canEditLots && (
                <Typography variant="caption" color="text.secondary">
                  {t(
                    "AllStockLots.editHint",
                    "Double-click a quantity, location or status (or use the pencil) to edit it. Enter saves, Esc cancels.",
                  )}
                </Typography>
              )}
            </Box>
          ),
        }}
        showToolbar
        sx={{
          "& .MuiDataGrid-cell": { display: "flex", alignItems: "center" },
        }}
      />
      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && void handleDelete(pendingDelete)}
        title={t("AllStockLots.confirmDeleteTitle", "Delete lot?")}
        message={t(
          "AllStockLots.confirmDeleteBody",
          "This lot will be permanently deleted and cannot be recovered.",
        )}
        cancelLabel={t("common.cancel", "Cancel")}
        confirmLabel={t("common.delete", "Delete")}
        destructive
      />
      {addLotListingId && (
        <CreateLotDialogV2
          listings={listings}
          defaultListingId={addLotListingId}
          locations={locations}
          open={!!addLotListingId}
          onClose={() => setAddLotListingId(null)}
        />
      )}
    </Paper>
  )
}
