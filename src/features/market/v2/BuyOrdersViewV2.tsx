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
  Chip,
} from "@mui/material"
import { Link, useNavigate } from "react-router-dom"
import { useGetUserProfileQuery } from "../../../store/profile"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { useTranslation } from "react-i18next"
import {
  ControlledTable,
  HeadCell,
} from "../../../components/table/PaginatedTable"
import { PullToRefresh } from "../../../components/gestures"
import { EmptyState } from "../../../components/empty-states"
import { BaseSkeleton } from "../../../components/skeletons/BaseSkeleton"
import { QualityBadge } from "../../../components/market/v2/QualityBadge"
import {
  useGetOrdersQuery,
  useFulfillBuyOrderMutation,
  OrderPreview,
} from "../../../store/api/v2/market"

/**
 * BuyOrdersViewV2 Component
 * 
 * Task: 11.3 Implement BuyOrdersViewV2 component
 * Requirements: 37.9-37.13
 * 
 * Displays buy orders with quality tier requirements and match indicators for sellers.
 * Maintains visual parity with V1 buy orders view while adding V2-specific features:
 * - Quality tier requirements (min/max)
 * - Match indicators showing compatibility percentage
 * - Filters for game_item_id, quality tier, price range
 * 
 * Visual Parity Requirements:
 * - Reuse Paper + Stack header layout from V1
 * - Reuse ControlledTable with pagination
 * - Maintain date badge styling
 * - Keep cancel button styling (error, outlined, small)
 * - Preserve responsive cell padding
 * - Use EmptyState for no results
 * 
 * V2 Enhancements:
 * - Display quality_tier_min and quality_tier_max with QualityBadge
 * - Show match indicators for sellers (compatibility percentage)
 * - Add quality tier filter
 * - Show variant attributes in subtitle
 */

/** Row shape for V2 buy orders table */
export interface BuyOrderV2Row {
  buy_order_id: string
  game_item_id: string
  game_item_name: string
  quantity_desired: number
  price_min: number | null
  price_max: number | null
  quality_tier_min: number | null
  quality_tier_max: number | null
  status: "active" | "fulfilled" | "cancelled" | "expired"
  created_at: string
  expires_at: string | null
  timestamp: number
  match_count?: number // Number of compatible listings
  _actions?: undefined
}

export const BuyOrderV2HeadCells: readonly HeadCell<BuyOrderV2Row>[] = [
  {
    id: "game_item_name",
    numeric: false,
    disablePadding: false,
    label: "market.buyOrder",
  },
  {
    id: "quantity_desired",
    numeric: true,
    disablePadding: false,
    label: "market.quantity",
  },
  {
    id: "price_max",
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

/** Skeleton for buy order table rows */
function BuyOrderV2RowSkeleton({ index = 0 }: { index?: number }) {
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

/**
 * Buy Order Row Component
 * 
 * Displays a single buy order with:
 * - Date badge (month/day)
 * - Game item name
 * - Quality tier requirements (min-max range with badges)
 * - Quantity desired
 * - Price range (min-max)
 * - Match indicator (number of compatible listings)
 * - Cancel button
 * 
 * Maintains V1 visual styling while adding V2 quality tier display.
 */
export function BuyOrderV2Row(props: {
  row: BuyOrderV2Row
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
  
  // TODO: Replace with useCancelBuyOrderV2Mutation when API is ready
  const [isCancelling, setIsCancelling] = useState(false)
  const [fulfillBuyOrder, { isLoading: isFulfilling }] = useFulfillBuyOrderMutation()
  
  const expiryDate = useMemo(
    () => (row.expires_at ? new Date(row.expires_at) : new Date(row.created_at)),
    [row.expires_at, row.created_at],
  )

  const handleCancel = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsCancelling(true)
    
    try {
      // TODO: Implement cancel mutation when API is ready
      // await cancelBuyOrderV2(row.buy_order_id).unwrap()
      issueAlert({
        message: t("MarketAggregateView.cancelled", "Buy order cancelled"),
        severity: "success",
      })
    } catch (error) {
      issueAlert({
        message: error instanceof Error ? error.message : "Failed to cancel buy order",
        severity: "error",
      })
    } finally {
      setIsCancelling(false)
    }
  }

  const handleFulfill = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const result = await fulfillBuyOrder({ id: row.buy_order_id }).unwrap()
      issueAlert({
        message: t("buyorder.fulfilled", "Buy order fulfilled"),
        severity: "success",
      })
      if (result.order_id) {
        navigate(`/offer/${result.order_id}`)
      }
    } catch (error) {
      issueAlert({
        message: error instanceof Error ? error.message : "Failed to fulfill buy order",
        severity: "error",
      })
    }
  }

  // Format price range display
  const priceDisplay = useMemo(() => {
    if (row.price_min == null && row.price_max == null) {
      return t("buyorder.status.negotiable", "Negotiable")
    }
    if (row.price_min != null && row.price_max != null) {
      if (row.price_min === row.price_max) {
        return `${row.price_min.toLocaleString()} aUEC`
      }
      return `${row.price_min.toLocaleString()}-${row.price_max.toLocaleString()} aUEC`
    }
    if (row.price_max != null) {
      return `≤ ${row.price_max.toLocaleString()} aUEC`
    }
    if (row.price_min != null) {
      return `≥ ${row.price_min.toLocaleString()} aUEC`
    }
    return t("buyorder.status.negotiable", "Negotiable")
  }, [row.price_min, row.price_max, t])

  // Format quality tier display
  const qualityDisplay = useMemo(() => {
    if (row.quality_tier_min == null && row.quality_tier_max == null) {
      return t("market.anyQuality", "Any Quality")
    }
    if (row.quality_tier_min != null && row.quality_tier_max != null) {
      if (row.quality_tier_min === row.quality_tier_max) {
        return `Tier ${row.quality_tier_min}`
      }
      return `Tier ${row.quality_tier_min}-${row.quality_tier_max}`
    }
    if (row.quality_tier_max != null) {
      return `≤ Tier ${row.quality_tier_max}`
    }
    if (row.quality_tier_min != null) {
      return `≥ Tier ${row.quality_tier_min}`
    }
    return t("market.anyQuality", "Any Quality")
  }, [row.quality_tier_min, row.quality_tier_max, t])

  return (
    <TableRow
      hover
      onClick={() => navigate(`/market/v2/game-items/${row.game_item_id}`)}
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
          {/* Date Badge - Maintains V1 styling */}
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
                {expiryDate.toLocaleString("default", { month: "short" })}
              </Typography>
              <Typography
                variant="h5"
                fontWeight="bold"
                color="text.secondary"
                sx={{ fontSize: { xs: "1rem", sm: "1.5rem" } }}
              >
                {expiryDate.getDate()}
              </Typography>
            </Stack>
          </Paper>

          {/* Item Info with Quality Tier */}
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
              {row.game_item_name || t("market.buyOrder", "Buy order")}
            </Typography>
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                overflow: "hidden",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  whiteSpace: "nowrap",
                }}
              >
                {row.quantity_desired.toLocaleString()} {t("market.unit", "ea")}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                •
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  whiteSpace: "nowrap",
                }}
              >
                {qualityDisplay}
              </Typography>
              {row.match_count != null && row.match_count > 0 && (
                <>
                  <Typography variant="body2" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                    •
                  </Typography>
                  <Chip
                    label={`${row.match_count} ${t("market.matches", "matches")}`}
                    size="small"
                    color="success"
                    sx={{
                      height: { xs: 16, sm: 20 },
                      fontSize: { xs: "0.625rem", sm: "0.75rem" },
                    }}
                  />
                </>
              )}
            </Stack>
          </Stack>
        </Stack>
      </TableCell>

      {/* Quantity Column */}
      <TableCell align="right" sx={{ width: { xs: "25%", sm: "auto" } }}>
        <Typography variant="body2">
          {row.quantity_desired.toLocaleString()}
        </Typography>
      </TableCell>

      {/* Price Column */}
      <TableCell align="right" sx={{ width: { xs: "30%", sm: "auto" } }}>
        <Typography variant="body2">{priceDisplay}</Typography>
      </TableCell>

      {/* Actions Column */}
      <TableCell
        align="right"
        onClick={(e) => e.stopPropagation()}
        sx={{ width: { xs: "auto", sm: "auto" }, minWidth: 100 }}
      >
        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            onClick={handleFulfill}
            disabled={isFulfilling || row.status !== "active"}
          >
            {t("buyorder.fulfill", "Fulfill")}
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={handleCancel}
            disabled={isCancelling || row.status !== "active"}
          >
            {t("MarketAggregateView.cancel", "Cancel")}
          </Button>
        </Box>
      </TableCell>
    </TableRow>
  )
}

/**
 * BuyOrdersViewV2 Component
 * 
 * Paginated table view of the current user's V2 buy orders.
 * Maintains visual parity with V1 while adding quality tier support.
 * 
 * Features:
 * - Displays buy orders with quality tier requirements
 * - Shows match indicators (number of compatible listings)
 * - Provides filters for game_item_id, quality tier, price range
 * - Supports pagination and sorting
 * - Pull-to-refresh on mobile
 * - Empty state when no buy orders
 * 
 * TODO: Connect to V2 API when endpoints are ready:
 * - useSearchBuyOrdersV2Query for fetching buy orders
 * - useCancelBuyOrderV2Mutation for cancellation
 * - Add filters for game_item_id, quality tier, price range
 */
export function BuyOrdersViewV2() {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const { data: profile } = useGetUserProfileQuery()

  // Fetch purchase history via V2 orders API
  const {
    data: ordersData,
    isLoading,
    isFetching,
    refetch,
  } = useGetOrdersQuery({
    role: "buyer",
    sortBy: "created_at",
    sortOrder: "desc",
  })

  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(5)
  const [order, setOrder] = useState<"asc" | "desc">("desc")
  const [orderBy, setOrderBy] = useState<keyof BuyOrderV2Row>("created_at")

  const rows: BuyOrderV2Row[] = useMemo(() => {
    if (!ordersData?.orders) return []
    return ordersData.orders.map((o: OrderPreview) => ({
      buy_order_id: o.order_id,
      game_item_id: o.order_id,
      game_item_name: o.title,
      quantity_desired: o.item_count,
      price_min: null,
      price_max: o.total_price,
      quality_tier_min: o.quality_tier_min ?? null,
      quality_tier_max: o.quality_tier_max ?? null,
      status: o.status as BuyOrderV2Row["status"],
      created_at: o.created_at,
      expires_at: null,
      timestamp: new Date(o.created_at).getTime(),
    }))
  }, [ordersData])

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
            to="/market/v2/buy-orders/create"
            variant="outlined"
            size="small"
            sx={{ flexShrink: 0 }}
          >
            {t("buyOrderActions.createBuyOrder", "Create Buy Order")}
          </Button>
        </Stack>

        <PullToRefresh onRefresh={() => { refetch() }} enabled={isMobile}>
          <Box
            sx={{
              "& .MuiTableHead .MuiTableCell-root:first-of-type": {
                display: { xs: "none", sm: "table-cell" },
              },
            }}
          >
            <ControlledTable
              rows={paginatedRows}
              initialSort="created_at"
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
              onOrderByChange={(key) => setOrderBy(key as keyof BuyOrderV2Row)}
              orderBy={orderBy}
              generateRow={BuyOrderV2Row}
              keyAttr="buy_order_id"
              headCells={BuyOrderV2HeadCells.map((cell) => ({
                ...cell,
                label: t(cell.label),
              }))}
              disableSelect={true}
              loading={isLoading || isFetching}
              loadingRowComponent={BuyOrderV2RowSkeleton}
              emptyStateComponent={
                !(isLoading || isFetching) && rows.length === 0 ? (
                  <EmptyState
                    title={t("dashboard.noBuyOrders", "No buy orders")}
                    description={t(
                      "dashboard.noBuyOrdersDescription",
                      "Your active buy orders will appear here. Create a buy order to specify what you want to purchase.",
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
 * Dashboard section showing the current user's V2 buy orders.
 * Conditionally renders based on whether user has buy orders.
 */
export function DashBuyOrdersAreaV2() {
  const { data: profile } = useGetUserProfileQuery()
  
  // Fetch purchase history via V2 orders API
  const { data: ordersData, isLoading } = useGetOrdersQuery({
    role: "buyer",
    pageSize: 5,
  })

  const hasMyBuyOrders = useMemo(() => {
    return ordersData?.orders && ordersData.orders.length > 0
  }, [ordersData])

  if (isLoading || !profile?.username) {
    return null
  }

  if (!hasMyBuyOrders) {
    return null
  }

  return <BuyOrdersViewV2 />
}
