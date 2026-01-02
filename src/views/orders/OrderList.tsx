import {
  OrderSearchSortMethod,
  OrderSearchStatus,
  OrderStub,
} from "../../datatypes/Order"
import React, { MouseEventHandler, useMemo, useState, useEffect } from "react"
import {
  Avatar,
  Box,
  Button,
  Chip,
  Collapse,
  FormControlLabel,
  Grid,
  Link as MaterialLink,
  Paper,
  Switch,
  Tab,
  TableCell,
  TableRow,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { Link } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import {
  ControlledTable,
  HeadCell,
} from "../../components/table/PaginatedTable"
import { Stack } from "@mui/system"
import { a11yProps } from "../../components/tabs/Tabs"
import SCMarketLogo from "../../assets/scmarket-logo.png"
import { useSearchOrdersQuery } from "../../store/orders"
import { useGetUserProfileQuery } from "../../store/profile"
import { useTranslation } from "react-i18next"
import { useDebounce } from "../../hooks/useDebounce"
import { ExpandLess, ExpandMore, Search } from "@mui/icons-material"

export const statusColors = new Map<
  | "active"
  | "inactive"
  | "fulfilled"
  | "in-progress"
  | "not-started"
  | "cancelled",
  "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"
>()
statusColors.set("fulfilled", "success")
statusColors.set("in-progress", "info")
statusColors.set("cancelled", "warning")
statusColors.set("not-started", "error")
statusColors.set("active", "success")
statusColors.set("inactive", "warning")

export const statusNames = new Map<
  | "active"
  | "inactive"
  | "fulfilled"
  | "in-progress"
  | "not-started"
  | "cancelled",
  string
>()

statusNames.set("fulfilled", "orders.status.fulfilled")
statusNames.set("in-progress", "orders.status.inProgress")
statusNames.set("cancelled", "orders.status.cancelled")
statusNames.set("not-started", "orders.status.notStarted")
statusNames.set("active", "orders.status.active")
statusNames.set("inactive", "orders.status.inactive")

export const OrderHeadCells: readonly HeadCell<
  OrderStub & { other_name: string | null }
>[] = [
  {
    id: "timestamp",
    numeric: false,
    disablePadding: false,
    label: "orders.table.order",
  },
  {
    id: "other_name",
    numeric: true,
    disablePadding: false,
    label: "orders.table.customer",
  },
  {
    id: "status",
    numeric: true,
    disablePadding: false,
    label: "orders.table.status",
  },
]

export const MyOrderHeadCells: readonly HeadCell<
  OrderStub & { other_name: string | null }
>[] = [
  {
    id: "timestamp",
    numeric: false,
    disablePadding: false,
    label: "orders.table.order",
  },
  {
    id: "other_name",
    numeric: true,
    disablePadding: false,
    label: "orders.table.contractor",
  },
  {
    id: "status",
    numeric: true,
    disablePadding: false,
    label: "orders.table.status",
  },
]

export function OrderRow(props: {
  row: OrderStub & { mine?: boolean }
  index: number
  onClick?: MouseEventHandler
  isItemSelected: boolean
  labelId: string
}) {
  const { row, index, isItemSelected } = props // TODO: Add `assigned_to` column
  const date = useMemo(() => new Date(row.timestamp), [row.timestamp])
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const statusColor = useMemo(() => statusColors.get(row.status), [row.status])
  const status = useMemo(
    () => t(statusNames.get(row.status) || ""),
    [row.status, t],
  )

  return (
    <TableRow
      hover
      // onClick={onClick}
      role="checkbox"
      aria-checked={isItemSelected}
      tabIndex={-1}
      key={index}
      selected={isItemSelected}
      style={{ textDecoration: "none", color: "inherit" }}
      component={Link}
      to={`/contract/${row.order_id}`}
      sx={{
        "& .MuiTableCell-root": {
          padding: { xs: theme.spacing(1), sm: theme.spacing(2) },
        },
      }}
    >
      <TableCell
        sx={{
          width: { xs: "45%", sm: "auto" },
          minWidth: { xs: 0, sm: "auto" },
          padding: { xs: theme.spacing(0.75), sm: theme.spacing(2) },
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
              direction={"column"}
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography
                variant={"subtitle2"}
                color={"text.secondary"}
                sx={{ fontSize: { xs: "0.625rem", sm: "0.875rem" } }}
              >
                {date.toLocaleString("default", { month: "short" })}
              </Typography>
              <Typography
                variant={"h5"}
                fontWeight={"bold"}
                color={"text.secondary"}
                sx={{ fontSize: { xs: "1rem", sm: "1.5rem" } }}
              >
                {date.getDate()}
              </Typography>
            </Stack>
          </Paper>
          <Stack direction={"column"} sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              color={"text.secondary"}
              fontWeight={"bold"}
              sx={{
                fontSize: { xs: "0.875rem", sm: "1rem" },
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {t("orders.orderLabel")}{" "}
              {row.order_id.substring(0, 8).toUpperCase()}
            </Typography>
            <Typography
              variant={"body2"}
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {row.count
                ? `${row.count.toLocaleString(undefined)} ${t("orders.items")} • `
                : row.service_name
                  ? `${row.service_name} • `
                  : ""}
              {(+row.cost).toLocaleString(undefined)} aUEC
            </Typography>
          </Stack>
        </Stack>
      </TableCell>
      <TableCell
        align="right"
        sx={{
          display: { xs: "table-cell", md: "table-cell" },
          textAlign: { xs: "left", sm: "right" },
          width: { xs: "30%", sm: "auto" },
          minWidth: { xs: 80, sm: "auto" },
          padding: { xs: theme.spacing(0.75), sm: theme.spacing(2) },
        }}
      >
        <Stack
          spacing={{
            xs: theme.layoutSpacing.compact / 2,
            sm: theme.layoutSpacing.compact,
          }}
          direction={"row"}
          justifyContent={{ xs: "flex-start", sm: "flex-end" }}
          alignItems={"center"}
        >
          <Avatar
            sx={{
              width: { xs: 28, sm: 40 },
              height: { xs: 28, sm: 40 },
              flexShrink: 0,
            }}
            src={
              (row.mine
                ? row.contractor?.avatar || row.assigned_to?.avatar
                : row.customer.avatar) || SCMarketLogo
            }
          />
          <Stack
            direction={"column"}
            justifyContent={"center"}
            alignItems={{ xs: "flex-start", sm: "center" }}
            sx={{ minWidth: 0, flex: 1 }}
          >
            <MaterialLink
              component={Link}
              to={
                row.mine
                  ? row.contractor
                    ? `/contractor/${row.contractor?.spectrum_id}`
                    : row.assigned_to
                      ? `/user/${row.assigned_to?.username}`
                      : "#"
                  : `/user/${row.customer.username}`
              }
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <UnderlineLink
                color={"text.secondary"}
                variant={"subtitle1"}
                fontWeight={"bold"}
                sx={{
                  fontSize: { xs: "0.75rem", sm: "1rem" },
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "100%",
                }}
              >
                {row.mine
                  ? row.contractor?.spectrum_id ||
                    row.assigned_to?.username ||
                    t("orders.public")
                  : row.customer.username}
              </UnderlineLink>
            </MaterialLink>
            <Typography
              variant={"subtitle2"}
              sx={{
                fontSize: { xs: "0.625rem", sm: "0.875rem" },
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "100%",
              }}
            >
              {row.mine
                ? row.assigned_to?.display_name || row.contractor?.name
                : row.customer.display_name}
            </Typography>
          </Stack>
        </Stack>
      </TableCell>
      <TableCell
        align="right"
        sx={{
          width: { xs: "25%", sm: "auto" },
          minWidth: { xs: 70, sm: "auto" },
          padding: { xs: theme.spacing(0.75), sm: theme.spacing(2) },
        }}
      >
        <Chip
          label={status}
          color={statusColor}
          size={isMobile ? "small" : "medium"}
        />
      </TableCell>
      {/*<TableCell align="right">*/}
      {/*  <Typography variant={"subtitle1"} color={"text.primary"}>*/}
      {/*    {(+row.cost).toLocaleString("en-US")} aUEC*/}
      {/*  </Typography>*/}
      {/*</TableCell>*/}

      {/*<TableCell align={'right'}>*/}
      {/*    <Button color={'primary'} variant={'outlined'} onClick={handleAcceptBid}>*/}
      {/*        Accept*/}
      {/*    </Button>*/}
      {/*</TableCell>*/}
    </TableRow>
  )
}

export function OrdersViewPaginated(props: {
  title: string
  mine?: boolean
  assigned?: boolean
  contractor?: string
}) {
  const { title, mine, assigned, contractor } = props
  const theme = useTheme<ExtendedTheme>()
  const { data: profile } = useGetUserProfileQuery()
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "past" | OrderSearchStatus
  >("active")
  const [pageSize, setPageSize] = useState(5)
  const [page, setPage] = useState(0)
  const [orderBy, setOrderBy] = useState("timestamp")
  const [order, setOrder] = useState<"asc" | "desc">("desc")
  const { t } = useTranslation()

  // Filter state
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [buyerUsername, setBuyerUsername] = useState("")
  const [sellerUsername, setSellerUsername] = useState("")
  const [hasMarketListings, setHasMarketListings] = useState<
    boolean | undefined
  >(undefined)
  const [hasService, setHasService] = useState<boolean | undefined>(undefined)

  // Debounce username inputs
  const debouncedBuyerUsername = useDebounce(buyerUsername, 500)
  const debouncedSellerUsername = useDebounce(sellerUsername, 500)

  // Reset page when filters change
  useEffect(() => {
    setPage(0)
  }, [
    debouncedBuyerUsername,
    debouncedSellerUsername,
    hasMarketListings,
    hasService,
  ])

  const { data: orders } = useSearchOrdersQuery({
    status: statusFilter === "all" ? undefined : statusFilter,
    index: page,
    page_size: pageSize,
    customer: mine ? profile?.username : undefined,
    assigned: assigned ? profile?.username : undefined,
    contractor: contractor,
    sort_method: orderBy as OrderSearchSortMethod,
    reverse_sort: order === "desc",
    buyer_username:
      !mine && debouncedBuyerUsername ? debouncedBuyerUsername : undefined,
    seller_username:
      mine && debouncedSellerUsername ? debouncedSellerUsername : undefined,
    has_market_listings: hasMarketListings,
    has_service: hasService,
  })

  const tabs = [
    ["all", t("orders.tabs.all")],
    ["active", t("orders.tabs.active")],
    ["past", t("orders.tabs.past")],
    ["fulfilled", t("orders.tabs.fulfilled")],
    ["in-progress", t("orders.tabs.inProgress")],
    ["not-started", t("orders.tabs.notStarted")],
    ["cancelled", t("orders.tabs.cancelled")],
  ] as const

  const tab = useMemo(
    () =>
      [
        "all",
        "active",
        "past",
        "fulfilled",
        "in-progress",
        "not-started",
        "cancelled",
      ].indexOf(statusFilter),
    [statusFilter],
  )

  const totalCounts = useMemo(() => {
    if (!orders?.item_counts) {
      return {
        all: 0,
        active: 0,
        past: 0,
        fulfilled: 0,
        "in-progress": 0,
        "not-started": 0,
        cancelled: 0,
      }
    }

    return {
      all: Object.values(orders?.item_counts || {}).reduce((x, y) => x + y, 0),
      active:
        (orders?.item_counts["not-started"] || 0) +
        (orders?.item_counts["in-progress"] || 0),
      past:
        (orders?.item_counts["cancelled"] || 0) +
        (orders?.item_counts["fulfilled"] || 0),
      ...orders?.item_counts,
    }
  }, [orders])

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (debouncedBuyerUsername) count++
    if (debouncedSellerUsername) count++
    if (hasMarketListings !== undefined) count++
    if (hasService !== undefined) count++
    return count
  }, [
    debouncedBuyerUsername,
    debouncedSellerUsername,
    hasMarketListings,
    hasService,
  ])

  const clearFilters = () => {
    setBuyerUsername("")
    setSellerUsername("")
    setHasMarketListings(undefined)
    setHasService(undefined)
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
            variant={"h5"}
            fontWeight={"bold"}
            color={"text.secondary"}
            sx={{
              whiteSpace: "nowrap",
              textOverflow: "display",
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
              flexShrink: 0,
            }}
          >
            {title}
          </Typography>
          <Button
            startIcon={<Search />}
            endIcon={filtersOpen ? <ExpandLess /> : <ExpandMore />}
            onClick={() => setFiltersOpen(!filtersOpen)}
            sx={{
              ml: { xs: 0, sm: 2 },
              alignSelf: { xs: "flex-start", sm: "center" },
              flexShrink: 0,
            }}
            size="small"
          >
            {t("orders.filters", "Filters")}
            {activeFiltersCount > 0 && (
              <Chip
                label={activeFiltersCount}
                size="small"
                sx={{ ml: 1, height: 20, minWidth: 20 }}
              />
            )}
          </Button>
          <Box
            sx={{
              flex: { xs: 1, sm: "1 1 auto" },
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            <Tabs
              value={tab}
              // onChange={(_, newPage) => setPage(newPage)}
              aria-label={t("orders.aria.orderTabs")}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                minHeight: { xs: 48, sm: 64 },
                width: "100%",
                "& .MuiTab-root": {
                  minHeight: { xs: 48, sm: 64 },
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  padding: { xs: "8px 12px", sm: "12px 16px" },
                  whiteSpace: "nowrap",
                },
                "& .MuiTabs-scrollButtons": {
                  display: "flex",
                },
              }}
            >
              {tabs.map(([id, tag], index) => (
                <Tab
                  key={id}
                  label={tag}
                  icon={<Chip label={totalCounts[id] || 0} size={"small"} />}
                  {...a11yProps(index)}
                  onClick={() => setStatusFilter(id)}
                />
              ))}
            </Tabs>
          </Box>
        </Stack>

        {/* Filter Panel */}
        <Collapse in={filtersOpen}>
          <Paper sx={{ p: 1, m: 1, bgcolor: "background.default" }}>
            <Stack>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="subtitle2">
                  {t("orders.filter_orders", "Filter Orders")}
                </Typography>
                {activeFiltersCount > 0 && (
                  <Button size="small" onClick={clearFilters}>
                    {t("orders.clear_filters", "Clear All")}
                  </Button>
                )}
              </Stack>

              <Grid container spacing={theme.layoutSpacing.compact}>
                {/* Buyer/Seller Username Filter */}
                {!mine ? (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={t("orders.buyer_username", "Buyer Username")}
                      value={buyerUsername}
                      onChange={(e) => setBuyerUsername(e.target.value)}
                      size="small"
                      placeholder={t(
                        "orders.buyer_username_placeholder",
                        "Enter buyer username",
                      )}
                    />
                  </Grid>
                ) : (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={t("orders.seller_username", "Seller Username")}
                      value={sellerUsername}
                      onChange={(e) => setSellerUsername(e.target.value)}
                      size="small"
                      placeholder={t(
                        "orders.seller_username_placeholder",
                        "Enter seller username or spectrum ID",
                      )}
                    />
                  </Grid>
                )}

                {/* Has Market Listings Toggle */}
                <Grid item xs={12} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={hasMarketListings === true}
                        onChange={(e) =>
                          setHasMarketListings(
                            e.target.checked ? true : undefined,
                          )
                        }
                      />
                    }
                    label={t(
                      "orders.has_market_listings",
                      "Has Market Listings",
                    )}
                  />
                </Grid>

                {/* Has Service Toggle */}
                <Grid item xs={12} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={hasService === true}
                        onChange={(e) =>
                          setHasService(e.target.checked ? true : undefined)
                        }
                      />
                    }
                    label={t("orders.has_service", "Has Service")}
                  />
                </Grid>
              </Grid>

              {/* Active Filters Chips */}
              {activeFiltersCount > 0 && (
                <Stack
                  direction="row"
                  spacing={theme.layoutSpacing.compact}
                  flexWrap="wrap"
                  gap={theme.layoutSpacing.compact}
                >
                  {debouncedBuyerUsername && (
                    <Chip
                      label={`${t("orders.buyer", "Buyer")}: ${debouncedBuyerUsername}`}
                      onDelete={() => setBuyerUsername("")}
                      size="small"
                    />
                  )}
                  {debouncedSellerUsername && (
                    <Chip
                      label={`${t("orders.seller", "Seller")}: ${debouncedSellerUsername}`}
                      onDelete={() => setSellerUsername("")}
                      size="small"
                    />
                  )}
                  {hasMarketListings !== undefined && (
                    <Chip
                      label={t(
                        "orders.has_market_listings",
                        "Has Market Listings",
                      )}
                      onDelete={() => setHasMarketListings(undefined)}
                      size="small"
                    />
                  )}
                  {hasService !== undefined && (
                    <Chip
                      label={t("orders.has_service", "Has Service")}
                      onDelete={() => setHasService(undefined)}
                      size="small"
                    />
                  )}
                </Stack>
              )}
            </Stack>
          </Paper>
        </Collapse>

        <ControlledTable
          rows={(orders?.items || []).map((o) => ({
            ...o,
            other_name: mine
              ? o.assigned_to?.username || o.contractor?.spectrum_id || null
              : o.customer.username,
            mine,
          }))}
          initialSort={"timestamp"}
          onPageChange={setPage}
          page={page}
          onPageSizeChange={setPageSize}
          pageSize={pageSize}
          rowCount={+(totalCounts[statusFilter] || 0)}
          onOrderChange={setOrder}
          order={order}
          onOrderByChange={setOrderBy}
          orderBy={orderBy}
          generateRow={OrderRow}
          keyAttr={"order_id"}
          headCells={(mine ? MyOrderHeadCells : OrderHeadCells).map((cell) => ({
            ...cell,
            label: t(cell.label),
          }))}
          disableSelect
        />
      </Paper>
    </Grid>
  )
}
