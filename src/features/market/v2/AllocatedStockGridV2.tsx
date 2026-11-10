import { useMemo } from "react"
import { Box, Chip, Paper, Typography } from "@mui/material"
import { ImageAvatar } from "../../../components/avatar/ImageAvatar"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid"
import { ThemedDataGrid as DataGrid } from "../../../components/grid/ThemedDataGrid"
import { EmptyState } from "../../../components/empty-states/EmptyState"
import { UnderlineLink } from "../../../components/typography/UnderlineLink"
import { useGetStockLotsQuery } from "../../../store/api/v2/market"
import { MARKET_PATHS } from "../../../routes/paths"
import { useFormatters } from "../../../util/format"
import { useStockShop, useStockFilter } from "./stockLotFilters"

/* ── Allocated Stock Grid ── */

export function AllocatedStockGridV2() {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const { filters } = useStockFilter()
  const { shopId } = useStockShop()

  const { data: lotsData, isLoading } = useGetStockLotsQuery({
    listingId: filters.listingId ?? undefined,
    locationId: filters.locationId ?? undefined,
    shopId,
    pageSize: 100,
  })

  const allocatedLots = useMemo(
    () =>
      (lotsData?.lots ?? [])
        .filter((lot) => lot.quantity_allocated > 0)
        .map((lot) => ({
          id: lot.lot_id,
          lot_id: lot.lot_id,
          game_item_name:
            lot.game_item_name || t("marketUi.bulkStock.customItem"),
          variant_display_name: lot.variant.display_name || "—",
          quantity_allocated: lot.quantity_allocated,
          quantity_total: lot.quantity_total,
          location_name:
            lot.location?.name ?? t("marketUi.bulkStock.unspecified"),
          listing_id: lot.listing_id,
          listing_title: lot.listing_title,
          listing_photo: lot.listing_photo,
        })),
    [lotsData, t],
  )

  const columns: GridColDef[] = [
    {
      field: "game_item_name",
      headerName: t("inventory.item", "Item"),
      flex: 1.5,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight={600}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "variant_display_name",
      headerName: t("inventory.variant", "Variant"),
      flex: 1.2,
    },
    {
      field: "quantity_allocated",
      headerName: t("stock.allocated", "Allocated"),
      flex: 0.8,
      align: "right" as const,
      headerAlign: "right" as const,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight={600}>
          {fmt.number(params.value)} / {fmt.number(params.row.quantity_total)}
        </Typography>
      ),
    },
    {
      field: "location_name",
      headerName: t("inventory.location", "Location"),
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" color="text.secondary">
          {params.value}
        </Typography>
      ),
    },
    {
      field: "listing_title",
      headerName: t("inventory.listing", "Listing"),
      flex: 1.8,
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
  ]

  return (
    <Paper>
      <DataGrid
        rows={allocatedLots}
        columns={columns}
        loading={isLoading}
        autoHeight
        pageSizeOptions={[10, 25, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        slots={{
          noRowsOverlay: () => (
            <EmptyState
              title={t("stock.noAllocations", "No allocated stock")}
              description={t(
                "stock.noAllocationsDesc",
                "Stock will appear here when orders are placed against your listings.",
              )}
              sx={{ minHeight: 200, pb: 4 }}
            />
          ),
          toolbar: () => (
            <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h6">
                {t("stock.allocatedStock", "Allocated Stock")}
              </Typography>
              <Chip label={allocatedLots.length} size="small" color="primary" />
            </Box>
          ),
        }}
        showToolbar
        sx={{
          "& .MuiDataGrid-cell": { display: "flex", alignItems: "center" },
        }}
      />
    </Paper>
  )
}
