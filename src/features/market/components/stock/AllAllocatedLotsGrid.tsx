/**
 * AllAllocatedLotsGrid Component
 *
 * Displays all stock lots that are currently allocated to orders
 */

import { DataGrid, GridColDef } from "@mui/x-data-grid"
import { Paper, Typography, Box, Chip } from "@mui/material"
import { useSearchLotsQuery } from "../../../../store/api/stockLotsApi"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { useGetUserProfileQuery } from "../../../../store/profile"
import { useCurrentOrg } from "../../../../hooks/login/CurrentOrg"

export function AllAllocatedLotsGrid() {
  const { t } = useTranslation()
  const { data: profile } = useGetUserProfileQuery()
  const [currentOrg] = useCurrentOrg()

  const { data, isLoading } = useSearchLotsQuery({
    user_id: profile?.user_id,
    contractor_spectrum_id: currentOrg?.spectrum_id,
  })

  // Filter to only allocated lots (those with order_id)
  const allocatedLots = data?.lots.filter((lot) => lot.order_id) || []

  const columns: GridColDef[] = [
    {
      field: "listing_id",
      headerName: t("stock.listing", "Listing"),
      flex: 1,
      renderCell: (params) => (
        <Link to={`/market/listing/${params.value}`}>
          {params.value.substring(0, 8).toUpperCase()}
        </Link>
      ),
    },
    {
      field: "order_id",
      headerName: t("stock.order", "Order"),
      flex: 1,
      renderCell: (params) =>
        params.value ? (
          <Link to={`/contracts/${params.value}`}>
            {params.value.substring(0, 8).toUpperCase()}
          </Link>
        ) : (
          "-"
        ),
    },
    {
      field: "quantity_total",
      headerName: t("stock.quantity", "Quantity"),
      width: 120,
    },
    {
      field: "location_name",
      headerName: t("stock.location", "Location"),
      flex: 1,
      valueGetter: (value, row) => row.location?.name || "Unspecified",
    },
    {
      field: "created_at",
      headerName: t("stock.allocatedAt", "Allocated"),
      width: 150,
      valueFormatter: (value) => new Date(value).toLocaleDateString(),
    },
  ]

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="h6">
          {t("stock.allocatedStock", "Allocated Stock")}
        </Typography>
        <Chip label={allocatedLots.length} size="small" color="primary" />
      </Box>
      <DataGrid
        rows={allocatedLots}
        columns={columns}
        loading={isLoading}
        getRowId={(row) => row.lot_id}
        autoHeight
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
      />
    </Paper>
  )
}
