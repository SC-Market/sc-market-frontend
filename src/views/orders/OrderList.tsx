import { OrderStub } from "../../features/orders/domain/types"
import { useMemo } from "react"
import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import {
  ControlledTable,
  HeadCell,
} from "../../components/table/PaginatedTable"
import { Stack } from "@mui/system"
import { a11yProps } from "../../components/tabs/Tabs"
import { useGetUserProfileQuery } from "../../features/profile/api/profileApi"
import { useTranslation } from "react-i18next"
import {
  useOrderSearch,
  type OrderSearchResult,
} from "../../features/orders/hooks/useOrderSearch"
import {
  ExpandLessRounded,
  ExpandMoreRounded,
  SearchRounded,
} from "@mui/icons-material"
import { OrderRowSkeleton } from "../../components/skeletons"
import { EmptyOrders } from "../../components/empty-states"

import {
  statusColors,
  statusNames,
} from "../../features/orders/domain/constants"
import { usePageReady } from "../../components/metadata/PageReady"
import { OrderRow } from "./OrderRow"
import { OrderFiltersPanel } from "./OrderFiltersPanel"

export { statusColors, statusNames }

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
    label: "orders.table.shop",
  },
  {
    id: "status",
    numeric: true,
    disablePadding: false,
    label: "orders.table.status",
  },
]

export function OrdersViewPaginated(props: {
  title: string
  mine?: boolean
  assigned?: boolean
  unassigned?: boolean
  contractor?: string
  shop_id?: string
}) {
  const { title, mine, assigned, unassigned, contractor, shop_id } = props
  const { data: profile } = useGetUserProfileQuery()
  const search = useOrderSearch({
    mine,
    assigned,
    unassigned,
    contractor,
    shop_id,
    username: profile?.username,
  })
  return (
    <OrdersTableView
      title={title}
      mine={mine}
      unassigned={unassigned}
      search={search}
    />
  )
}

/**
 * The order list (status tabs, filters, table) for a search's state and
 * results: useOrderSearch (OrdersViewPaginated) or Admin › Orders'
 * useAdminOrderSearch.
 */
export function OrdersTableView(props: {
  title: string
  mine?: boolean
  unassigned?: boolean
  search: OrderSearchResult
}) {
  const { title, mine, unassigned, search } = props
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()

  const {
    orders,
    awaitingData,
    page,
    setPage,
    pageSize,
    setPageSize,
    order,
    setOrder,
    orderBy,
    setOrderBy,
    statusFilter,
    setStatusFilter,
    totalCounts,
    filtersOpen,
    setFiltersOpen,
    activeFiltersCount,
  } = search
  // Order lists are primary content on the orders and dashboard pages.
  usePageReady(awaitingData)

  const tabs = useMemo(
    (): [string, string][] => [
      ["all", t("orders.tabs.all")],
      ...(unassigned !== undefined
        ? [
            ["unassigned", t("orders.tabs.unclaimed", "Unclaimed")] as [
              string,
              string,
            ],
          ]
        : []),
      ["active", t("orders.tabs.active")],
      ["past", t("orders.tabs.past")],
      ["fulfilled", t("orders.tabs.fulfilled")],
      ["in-progress", t("orders.tabs.inProgress")],
      ["not-started", t("orders.tabs.notStarted")],
      ["cancelled", t("orders.tabs.cancelled")],
    ],
    [t, unassigned],
  )

  const tab = useMemo(
    () => tabs.findIndex(([id]) => id === statusFilter),
    [statusFilter, tabs],
  )

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
            startIcon={<SearchRounded />}
            endIcon={
              filtersOpen ? <ExpandLessRounded /> : <ExpandMoreRounded />
            }
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
                  icon={
                    <Chip
                      label={totalCounts[id as keyof typeof totalCounts] || 0}
                      size={"small"}
                    />
                  }
                  {...a11yProps(index)}
                  onClick={() => setStatusFilter(id as typeof statusFilter)}
                />
              ))}
            </Tabs>
          </Box>
        </Stack>

        <OrderFiltersPanel search={search} mine={mine} />

        <ControlledTable
          rows={(orders?.items || []).map((o) => ({
            ...o,
            other_name: mine
              ? o.shop?.name ||
                o.assigned_to?.username ||
                o.contractor?.spectrum_id ||
                null
              : o.customer.username,
            mine,
          }))}
          initialSort={"timestamp"}
          onPageChange={setPage}
          page={page}
          onPageSizeChange={setPageSize}
          pageSize={pageSize}
          rowCount={
            +(totalCounts[statusFilter as keyof typeof totalCounts] || 0)
          }
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
          disableSelect={false}
          loading={awaitingData}
          loadingRowComponent={OrderRowSkeleton}
          emptyStateComponent={
            !awaitingData && (orders?.items || []).length === 0 ? (
              <EmptyOrders
                isOffers={false}
                isSent={mine}
                showCreateAction={mine}
                sx={{ py: 4 }}
              />
            ) : undefined
          }
        />
      </Paper>
    </Grid>
  )
}
