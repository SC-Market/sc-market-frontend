import React, { useState } from "react"
import {
  Avatar,
  Grid,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { useGetShopCustomersQuery } from "../../../store/api/v2/market"
import { useShopRouteContext } from "../../../components/router/ShopContextFromRoute"
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout"
import { ControlledTable, HeadCell } from "../../../components/table/PaginatedTable"
import { Link } from "react-router-dom"
import { Stack } from "@mui/system"

interface CustomerRow {
  user_id: string
  username: string
  display_name: string
  avatar: string | null
  order_count: number
  fulfilled_count: number
  total_spent: number
  last_order_at: string | null
}

const headCells: readonly HeadCell<CustomerRow>[] = [
  { id: "username", numeric: false, disablePadding: false, label: "Customer" },
  { id: "order_count", numeric: true, disablePadding: false, label: "Orders" },
  { id: "fulfilled_count", numeric: true, disablePadding: false, label: "Fulfilled" },
  { id: "total_spent", numeric: true, disablePadding: false, label: "Total Spent" },
  { id: "last_order_at", numeric: true, disablePadding: false, label: "Last Order" },
]

function CustomerRowComponent(props: {
  row: CustomerRow
  index: number
  isItemSelected: boolean
  labelId: string
}) {
  const { row } = props

  return (
    <TableRow
      hover
      component={Link}
      to={`/user/${row.username}`}
      sx={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
    >
      <TableCell padding="checkbox" sx={{ display: "none" }} />
      <TableCell>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar src={row.avatar || undefined} sx={{ width: 32, height: 32 }} />
          <Stack>
            <Typography variant="body2" fontWeight="bold">
              {row.display_name || row.username}
            </Typography>
            {row.display_name && (
              <Typography variant="caption" color="text.secondary">
                {row.username}
              </Typography>
            )}
          </Stack>
        </Stack>
      </TableCell>
      <TableCell align="right">{row.order_count}</TableCell>
      <TableCell align="right">{row.fulfilled_count}</TableCell>
      <TableCell align="right">{row.total_spent.toLocaleString()} aUEC</TableCell>
      <TableCell align="right">
        {row.last_order_at
          ? new Date(row.last_order_at).toLocaleDateString()
          : "—"}
      </TableCell>
    </TableRow>
  )
}

export function ShopCustomers() {
  const { shop } = useShopRouteContext()
  const { t } = useTranslation()
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [orderBy, setOrderBy] = useState("order_count")
  const [order, setOrder] = useState<"asc" | "desc">("desc")

  const { data, isLoading } = useGetShopCustomersQuery({
    shopId: shop.shop_id,
    page,
    pageSize,
  })

  return (
    <StandardPageLayout
      title="Customers"
      headerTitle="Customers"
      sidebarOpen={true}
      maxWidth="lg"
    >
      <Grid item xs={12}>
        <ControlledTable
          rows={data?.items || []}
          headCells={[...headCells]}
          generateRow={CustomerRowComponent}
          keyAttr="user_id"
          initialSort="order_count"
          page={page}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          rowCount={data?.total || 0}
          orderBy={orderBy}
          onOrderByChange={setOrderBy}
          order={order}
          onOrderChange={setOrder}
          disableSelect
        />
      </Grid>
    </StandardPageLayout>
  )
}
