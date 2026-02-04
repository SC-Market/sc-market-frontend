/**
 * AllAllocatedLotsGrid Component
 *
 * Displays all stock lots that are currently allocated to orders
 */

import { DataGrid, GridColDef } from "@mui/x-data-grid"
import { Paper, Typography, Box, Chip } from "@mui/material"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { useCurrentOrg } from "../../../../hooks/login/CurrentOrg"
import { useGetContractorAllocationsQuery } from "../../../../store/api/stockLotsApi"

export function AllAllocatedLotsGrid() {
  const { t } = useTranslation()
  const [currentOrg] = useCurrentOrg()

  const { data, isLoading } = useGetContractorAllocationsQuery(
    { contractor_spectrum_id: currentOrg?.spectrum_id || "" },
    { skip: !currentOrg?.spectrum_id },
  )

  const allocations = data?.allocations || []

  const columns: GridColDef[] = [
    {
      field: "listing_id",
      headerName: t("stock.listing", "Listing"),
      flex: 1,
      valueGetter: (value, row) => row.lot?.listing_id,
      renderCell: (params) =>
        params.value ? (
          <Link to={`/market/listing/${params.value}`}>
            {params.value.substring(0, 8).toUpperCase()}
          </Link>
        ) : (
          "-"
        ),
    },
    {
      field: "order_id",
      headerName: t("stock.order", "Order"),
      flex: 1,
      renderCell: (params) => (
        <Link to={`/contracts/${params.value}`}>
          {params.value.substring(0, 8).toUpperCase()}
        </Link>
      ),
    },
    {
      field: "quantity",
      headerName: t("stock.quantity", "Quantity"),
      width: 120,
    },
    {
      field: "location_name",
      headerName: t("stock.location", "Location"),
      flex: 1,
      valueGetter: (value, row) => row.lot?.location?.name || "Unspecified",
    },
    {
      field: "created_at",
      headerName: t("stock.allocatedAt", "Allocated"),
      width: 150,
      valueFormatter: (value) =>
        value ? new Date(value).toLocaleDateString() : "-",
    },
  ]

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="h6">
          {t("stock.allocatedStock", "Allocated Stock")}
        </Typography>
        <Chip label={allocations.length} size="small" color="primary" />
      </Box>
      <DataGrid
        rows={allocations}
        columns={columns}
        loading={isLoading}
        getRowId={(row) => row.allocation_id}
        autoHeight
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
      />
    </Paper>
  )
}
