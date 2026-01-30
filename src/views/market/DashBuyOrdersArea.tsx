import React, { useMemo, useState } from "react"
import {
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  TableCell,
  TableRow,
  Typography,
  useMediaQuery,
} from "@mui/material"
import { Link, useNavigate } from "react-router-dom"
import {
  useGetBuyOrderListingsQuery,
  useCancelBuyOrderMutation,
  type MarketAggregate,
} from "../../features/market"
import { useGetUserProfileQuery } from "../../store/profile"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTranslation } from "react-i18next"
import {
  ControlledTable,
  HeadCell,
} from "../../components/table/PaginatedTable"
import { PullToRefresh } from "../../components/gestures"
import { EmptyState } from "../../components/empty-states"
import { BaseSkeleton } from "../../components/skeletons/BaseSkeleton"

/** Row shape for the buy orders table (flattened from aggregate + buy_order) */
export interface BuyOrderDashboardRow {
  buy_order_id: string
  aggregate_title: string
  game_item_id: string | null
  quantity: number
  price: number | null
  negotiable?: boolean
  expiry: string
  timestamp: number
  _actions?: undefined
}

export const BuyOrderHeadCells: readonly HeadCell<BuyOrderDashboardRow>[] = [
  {
    id: "aggregate_title",
    numeric: false,
    disablePadding: false,
    label: "market.buyOrder",
  },
  {
    id: "quantity",
    numeric: true,
    disablePadding: false,
    label: "market.quantity",
  },
  {
    id: "price",
    numeric: true,
    disablePadding: false,
    label: "market.price",
  },
  {
    id: "_actions",
    numeric: true,
    disablePadding: false,
    label: "orders.actions",
    noSort: true,
  },
]

/** Skeleton for buy order table rows (3 columns, no checkbox). */
function BuyOrderRowSkeleton({ index = 0 }: { index?: number }) {
  const theme = useTheme<ExtendedTheme>()
  return (
    <TableRow>
      <TableCell
        sx={{
          width: { xs: "45%", sm: "auto" },
          minWidth: 0,
          padding: { xs: theme.spacing(0.75), sm: theme.spacing(2) },
        }}
      >
        <Stack
          spacing={theme.layoutSpacing.compact}
          direction="row"
          alignItems="center"
        >
          <Paper
            sx={{
              padding: { xs: 0.25, sm: 0.5 },
              bgcolor: theme.palette.background.default,
              minWidth: { xs: 40, sm: 50 },
              flexShrink: 0,
            }}
          >
            <Stack direction="column" alignItems="center">
              <BaseSkeleton
                variant="text"
                width={30}
                height={12}
                sx={{ mb: 0.5 }}
              />
              <BaseSkeleton variant="text" width={24} height={20} />
            </Stack>
          </Paper>
          <Stack direction="column" sx={{ flex: 1, minWidth: 0 }}>
            <BaseSkeleton
              variant="text"
              width="80%"
              height={18}
              sx={{ mb: 0.5 }}
            />
            <BaseSkeleton variant="text" width="60%" height={14} />
          </Stack>
        </Stack>
      </TableCell>
      <TableCell
        align="right"
        sx={{ padding: { xs: theme.spacing(0.75), sm: theme.spacing(2) } }}
      >
        <BaseSkeleton
          variant="text"
          width={40}
          height={18}
          sx={{ ml: "auto" }}
        />
      </TableCell>
      <TableCell
        align="right"
        sx={{ padding: { xs: theme.spacing(0.75), sm: theme.spacing(2) } }}
      >
        <BaseSkeleton
          variant="text"
          width={60}
          height={18}
          sx={{ ml: "auto" }}
        />
      </TableCell>
      <TableCell
        align="right"
        sx={{
          padding: { xs: theme.spacing(0.75), sm: theme.spacing(2) },
          minWidth: 100,
        }}
      >
        <BaseSkeleton
          variant="rectangular"
          width={70}
          height={32}
          sx={{ borderRadius: 1, ml: "auto" }}
        />
      </TableCell>
    </TableRow>
  )
}

function flattenMyBuyOrders(
  listings: MarketAggregate[] | undefined,
  username: string | undefined,
): BuyOrderDashboardRow[] {
  if (!username || !listings?.length) return []
  const rows: BuyOrderDashboardRow[] = []
  for (const aggregate of listings) {
    if (!aggregate.buy_orders?.length) continue
    const gameItemId = aggregate.details.game_item_id ?? null
    const title = aggregate.details.title ?? aggregate.details.item_name ?? ""
    for (const bo of aggregate.buy_orders) {
      if (bo.buyer?.username !== username) continue
      rows.push({
        buy_order_id: bo.buy_order_id,
        aggregate_title: title,
        game_item_id: gameItemId,
        quantity: bo.quantity,
        price: bo.price ?? null,
        negotiable: bo.negotiable,
        expiry: bo.expiry,
        timestamp: new Date(bo.expiry).getTime(),
      })
    }
  }
  return rows.sort((a, b) => b.timestamp - a.timestamp)
}

export function BuyOrderRow(props: {
  row: BuyOrderDashboardRow
  index: number
  onClick?: React.MouseEventHandler
  isItemSelected: boolean
  labelId: string
}) {
  const { row } = props
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const issueAlert = useAlertHook()
  const [cancelBuyOrder, { isLoading: isCancelling }] =
    useCancelBuyOrderMutation()
  const date = useMemo(() => new Date(row.expiry), [row.expiry])

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation()
    cancelBuyOrder(row.buy_order_id)
      .unwrap()
      .then(() => {
        issueAlert({
          message: t("MarketAggregateView.cancelled", "Buy order cancelled"),
          severity: "success",
        })
      })
      .catch(issueAlert)
  }

  return (
    <TableRow
      hover
      onClick={() => navigate(`/market/aggregate/${row.game_item_id ?? ""}`)}
      tabIndex={-1}
      sx={{
        cursor: "pointer",
        "& .MuiTableCell-root": {
          padding: { xs: theme.spacing(0.75), sm: theme.spacing(2) },
        },
      }}
    >
      <TableCell
        sx={{
          width: { xs: "45%", sm: "auto" },
          minWidth: { xs: 0, sm: "auto" },
        }}
      >
        <Stack
          spacing={theme.layoutSpacing.compact}
          direction="row"
          alignItems="center"
          justifyContent="left"
        >
          <Paper
            sx={{
              padding: { xs: 0.25, sm: 0.5 },
              bgcolor: theme.palette.background.default,
              minWidth: { xs: 40, sm: 50 },
              flexShrink: 0,
            }}
          >
            <Stack
              direction="column"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ fontSize: { xs: "0.625rem", sm: "0.875rem" } }}
              >
                {date.toLocaleString("default", { month: "short" })}
              </Typography>
              <Typography
                variant="h5"
                fontWeight="bold"
                color="text.secondary"
                sx={{ fontSize: { xs: "1rem", sm: "1.5rem" } }}
              >
                {date.getDate()}
              </Typography>
            </Stack>
          </Paper>
          <Stack direction="column" sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              color="text.secondary"
              fontWeight="bold"
              sx={{
                fontSize: { xs: "0.875rem", sm: "1rem" },
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {row.aggregate_title || t("market.buyOrder", "Buy order")}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {row.quantity.toLocaleString(undefined)} {t("market.unit", "ea")}{" "}
              •{" "}
              {row.negotiable || row.price == null
                ? row.price != null && row.price >= 1
                  ? t(
                      "buyorder.negotiableSuggested",
                      "Negotiable (~{{price}} aUEC)",
                      {
                        price: (+row.price).toLocaleString(undefined),
                      },
                    )
                  : t("buyorder.negotiable", "Negotiable")
                : `${(+row.price).toLocaleString(undefined)} aUEC`}
            </Typography>
          </Stack>
        </Stack>
      </TableCell>
      <TableCell align="right" sx={{ width: { xs: "25%", sm: "auto" } }}>
        <Typography variant="body2">
          {row.quantity.toLocaleString(undefined)}
        </Typography>
      </TableCell>
      <TableCell align="right" sx={{ width: { xs: "30%", sm: "auto" } }}>
        <Typography variant="body2">
          {row.price != null
            ? `${row.negotiable ? "~" : ""}${(row.price * row.quantity).toLocaleString(undefined)} aUEC`
            : t("buyorder.negotiable", "Negotiable")}
        </Typography>
      </TableCell>
      <TableCell
        align="right"
        onClick={(e) => e.stopPropagation()}
        sx={{ width: { xs: "auto", sm: "auto" }, minWidth: 100 }}
      >
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={handleCancel}
          disabled={isCancelling}
        >
          {t("MarketAggregateView.cancel", "Cancel")}
        </Button>
      </TableCell>
    </TableRow>
  )
}

/**
 * Paginated table view of the current user's buy orders.
 * Same layout as OrdersViewPaginated / OffersViewPaginated: Paper, Stack header, ControlledTable, PullToRefresh.
 */
export function BuyOrdersViewPaginated() {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const { data: profile } = useGetUserProfileQuery()
  const {
    data: listings,
    isLoading,
    isFetching,
    refetch,
  } = useGetBuyOrderListingsQuery()

  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(5)
  const [order, setOrder] = useState<"asc" | "desc">("desc")
  const [orderBy, setOrderBy] =
    useState<keyof BuyOrderDashboardRow>("aggregate_title")

  const rows = useMemo(
    () => flattenMyBuyOrders(listings, profile?.username),
    [listings, profile?.username],
  )

  const sortedRows = useMemo(() => {
    const key = orderBy
    return [...rows].sort((a, b) => {
      const aVal = a[key]
      const bVal = b[key]
      if (typeof aVal === "number" && typeof bVal === "number")
        return order === "asc" ? aVal - bVal : bVal - aVal
      const sa = String(aVal ?? "")
      const sb = String(bVal ?? "")
      return order === "asc" ? sa.localeCompare(sb) : sb.localeCompare(sa)
    })
  }, [rows, order, orderBy])

  const paginatedRows = useMemo(
    () => sortedRows.slice(page * pageSize, page * pageSize + pageSize),
    [sortedRows, page, pageSize],
  )

  if (!profile?.username) {
    return null
  }

  return (
    <Grid item xs={12}>
      <Paper>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{
            xs: theme.layoutSpacing.component,
            sm: theme.layoutSpacing.layout,
          }}
          sx={{ paddingTop: 2, paddingLeft: 2, paddingRight: 2 }}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            color="text.secondary"
            sx={{
              whiteSpace: "nowrap",
              textOverflow: "display",
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
              flexShrink: 0,
            }}
          >
            {t("market.buyOrders", "Buy Orders")}
          </Typography>
          <Box sx={{ flex: 1, minWidth: 0 }} />
          <Button
            component={Link}
            to="/buyorders"
            variant="outlined"
            size="small"
            sx={{ flexShrink: 0 }}
          >
            {t("dashboard.viewAllBuyOrders", "View all buy orders")}
          </Button>
        </Stack>

        <PullToRefresh
          onRefresh={async () => {
            await refetch()
          }}
          enabled={isMobile}
        >
          <Box
            sx={{
              "& .MuiTableHead .MuiTableCell-root:first-of-type": {
                display: { xs: "none", sm: "table-cell" },
              },
            }}
          >
            <ControlledTable
              rows={paginatedRows}
              initialSort="aggregate_title"
              onPageChange={setPage}
              page={page}
              onPageSizeChange={(size) => {
                setPageSize(size)
                setPage(0)
              }}
              pageSize={pageSize}
              rowCount={rows.length}
              onOrderChange={setOrder}
              order={order}
              onOrderByChange={(key) =>
                setOrderBy(key as keyof BuyOrderDashboardRow)
              }
              orderBy={orderBy}
              generateRow={BuyOrderRow}
              keyAttr="buy_order_id"
              headCells={BuyOrderHeadCells.map((cell) => ({
                ...cell,
                label: t(cell.label),
              }))}
              disableSelect={true}
              loading={isLoading || isFetching}
              loadingRowComponent={BuyOrderRowSkeleton}
              emptyStateComponent={
                !(isLoading || isFetching) && rows.length === 0 ? (
                  <EmptyState
                    title={t("dashboard.noBuyOrders", "No buy orders")}
                    description={t(
                      "dashboard.noBuyOrdersDescription",
                      "Your active buy orders will appear here.",
                    )}
                    sx={{ py: 4 }}
                  />
                ) : undefined
              }
            />
          </Box>
        </PullToRefresh>
      </Paper>
    </Grid>
  )
}

/**
 * Dashboard section showing the current user's buy orders.
 * Uses the same format as orders/offers (Paper, ControlledTable, PullToRefresh).
 * Renders nothing if the user has no buy orders (section is hidden).
 */
export function DashBuyOrdersArea() {
  const { data: profile } = useGetUserProfileQuery()
  const { data: listings, isLoading } = useGetBuyOrderListingsQuery()

  const hasMyBuyOrders = useMemo(() => {
    if (!profile?.username || !listings?.length) return false
    return listings.some((agg) =>
      agg.buy_orders?.some((bo) => bo.buyer?.username === profile.username),
    )
  }, [listings, profile?.username])

  if (isLoading || !profile?.username) {
    return null
  }

  if (!hasMyBuyOrders) {
    return null
  }

  return <BuyOrdersViewPaginated />
}
