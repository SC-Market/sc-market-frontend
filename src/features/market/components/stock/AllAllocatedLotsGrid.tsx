/**
 * AllAllocatedLotsGrid Component
 *
 * Displays all stock lots that are currently allocated to orders
 */

import { GridColDef } from "@mui/x-data-grid"
import { LazyDataGrid as DataGrid } from "../../../../components/grid/LazyDataGrid"
import { Paper, Typography, Box, Chip, Avatar } from "@mui/material"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { useCurrentOrg } from "../../../../hooks/login/CurrentOrg"
import { useGetContractorAllocationsQuery } from "../../../../store/api/stockLotsApi"
import { UnderlineLink } from "../../../../components/typography/UnderlineLink"

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
      flex: 1.5,
      valueGetter: (value, row) => row.lot?.listing_id,
      renderCell: (params) => {
        const photo = params.row.lot?.photos?.[0]
        const title =
          params.row.lot?.title || params.value.substring(0, 8).toUpperCase()
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              src={photo}
              variant="rounded"
              sx={{ width: 32, height: 32 }}
            />
            <Link
              to={`/market/${params.value}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <UnderlineLink>{title}</UnderlineLink>
            </Link>
          </Box>
        )
      },
    },
    {
      field: "order_id",
      headerName: t("stock.order", "Order"),
      flex: 1.5,
      renderCell: (params) => (
        <Link
          to={`/contract/${params.value}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <UnderlineLink>
            {params.row.order_title ||
              params.value.substring(0, 8).toUpperCase()}
          </UnderlineLink>
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
      field: "owner",
      headerName: t("stock.user", "User"),
      flex: 1,
      valueGetter: (value, row) =>
        row.lot?.owner?.display_name || row.lot?.owner?.username || "—",
      renderCell: (params) => {
        if (!params.row.lot?.owner) {
          return (
            <Typography variant="body2" color="text.disabled">
              —
            </Typography>
          )
        }
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              src={params.row.lot.owner.avatar || undefined}
              sx={{ width: 24, height: 24 }}
            />
            <Typography variant="body2" color="text.secondary">
              {params.value}
            </Typography>
          </Box>
        )
      },
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
    <Paper>
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
        slots={{
          toolbar: () => (
            <Box
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Typography variant="h6">
                {t("stock.allocatedStock", "Allocated Stock")}
              </Typography>
              <Chip label={allocations.length} size="small" color="primary" />
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
