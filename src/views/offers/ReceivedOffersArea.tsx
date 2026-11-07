import {
  OfferSearchStatus,
  OfferSessionStub,
} from "../../features/offers/api/offerApi"
import {
  ControlledTable,
  HeadCell,
} from "../../components/table/PaginatedTable"
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
import {
  ExpandLessRounded,
  ExpandMoreRounded,
  SearchRounded,
} from "@mui/icons-material"
import { a11yProps } from "../../components/tabs/Tabs"
import { Stack } from "@mui/system"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { EmptyOrders } from "../../components/empty-states"
import { useOptionalShopRouteContext } from "../../components/router/ShopContextFromRoute"
import { useTranslation } from "react-i18next"
import { OfferRowSkeleton } from "../../components/skeletons"
import { useOfferSearch } from "../../features/offers/hooks/useOfferSearch"

// Map for all statuses
import { usePageReady } from "../../components/metadata/PageReady"
import { OfferRow } from "./OfferRow"
import { MergeOffersDialog } from "./MergeOffersDialog"
import { OfferFiltersPanel } from "./OfferFiltersPanel"

// Status icon mapping for offer rows

export const OffersHeadCells: readonly HeadCell<
  OfferSessionStub & { customer_name: string }
>[] = [
  {
    id: "timestamp",
    numeric: false,
    disablePadding: false,
    label: "Offer",
  },
  {
    id: "customer",
    numeric: true,
    disablePadding: false,
    label: "Customer",
  },
  {
    id: "status",
    numeric: true,
    disablePadding: false,
    label: "Status",
  },
]

const MyOffersHeadCells: readonly HeadCell<
  OfferSessionStub & { customer_name: string }
>[] = [
  {
    id: "timestamp",
    numeric: false,
    disablePadding: false,
    label: "Offer",
  },
  {
    id: "customer",
    numeric: true,
    disablePadding: false,
    label: "Shop",
  },
  {
    id: "status",
    numeric: true,
    disablePadding: false,
    label: "Status",
  },
]

export function ReceivedOffersArea({
  unassigned,
}: { unassigned?: boolean } = {}) {
  const shopCtx = useOptionalShopRouteContext()
  const shopId = shopCtx?.shop.shop_id || undefined

  return (
    <OffersViewPaginated
      assigned={!shopId && !unassigned}
      unassigned={unassigned}
      shop_id={shopId}
    />
  )
}

export function SentOffersArea() {
  return <OffersViewPaginated mine />
}

export function OffersViewPaginated(props: {
  mine?: boolean
  assigned?: boolean
  unassigned?: boolean
  contractor?: string
  shop_id?: string
}) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { mine, assigned, unassigned, contractor, shop_id } = props

  const search = useOfferSearch({
    mine,
    assigned,
    unassigned,
    contractor,
    shop_id,
  })
  const {
    data,
    awaitingData,
    filtersOpen,
    selectedOfferIds,
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
    totalCount,
    totals,
    handleSelectChange,
    setMergeModalOpen,
    setFiltersOpen,
    activeFiltersCount,
  } = search
  // Offer lists are primary content on the orders and dashboard pages.
  usePageReady(awaitingData)

  const tabs = useMemo(() => {
    const t_ = [
      [null, t("OffersViewPaginated.all", { defaultValue: "All" })],
      ...(!mine
        ? [
            [
              "unclaimed",
              t("OffersViewPaginated.unclaimed", { defaultValue: "Unclaimed" }),
            ],
          ]
        : []),
      [
        "to-seller",
        mine
          ? t("OffersViewPaginated.waitingForSeller", {
              defaultValue: "Waiting for seller",
            })
          : t("OffersViewPaginated.yourTurn", { defaultValue: "Your turn" }),
      ],
      [
        "to-customer",
        mine
          ? t("OffersViewPaginated.yourTurn", { defaultValue: "Your turn" })
          : t("OffersViewPaginated.waitingForBuyer", {
              defaultValue: "Waiting for buyer",
            }),
      ],
      ["accepted", t("OffersViewPaginated.accepted")],
      ["rejected", t("OffersViewPaginated.rejected")],
    ] as [string | null, string][]
    return t_
  }, [mine, t])

  const tab = useMemo(
    () => tabs.findIndex(([key]) => key === statusFilter),
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
            color={"text.secondary"}
            fontWeight={"bold"}
            sx={{
              whiteSpace: "nowrap",
              textOverflow: "display",
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
              flexShrink: 0,
            }}
          >
            {mine
              ? t("OffersViewPaginated.myOffers", "My Offers")
              : t("OffersViewPaginated.offers")}
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
            {t("OffersViewPaginated.filters", "Filters")}
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
              aria-label={t("offers.aria.offerTabs")}
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
                  key={id || "all"}
                  label={tag}
                  icon={
                    <Chip
                      label={id ? totals.get(id) || 0 : totalCount}
                      size={"small"}
                    />
                  }
                  {...a11yProps(index)}
                  onClick={() =>
                    setStatusFilter(
                      id as OfferSearchStatus | "unclaimed" | null,
                    )
                  }
                />
              ))}
            </Tabs>
          </Box>
          {!mine && selectedOfferIds.length >= 2 && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setMergeModalOpen(true)}
              sx={{ ml: "auto" }}
            >
              {t("OffersViewPaginated.merge_offers", {
                count: selectedOfferIds.length,
              })}
            </Button>
          )}
        </Stack>

        {/* Filter Panel */}
        <OfferFiltersPanel search={search} mine={mine} />

        <ControlledTable
          rows={(data?.items || []).map((o) => ({
            ...o,
            customer_name: o.customer.username,
          }))}
          initialSort={"timestamp"}
          generateRow={(props) => (
            <OfferRow
              {...props}
              enableSelection={!mine}
              viewAs={mine ? "buyer" : "shop"}
            />
          )}
          keyAttr={"id"}
          headCells={(mine ? MyOffersHeadCells : OffersHeadCells).map(
            (cell) => ({
              ...cell,
              label: t(
                `OffersViewPaginated.${cell.label.toLowerCase()}`,
                cell.label,
              ),
            }),
          )}
          disableSelect={mine}
          selected={!mine ? selectedOfferIds : undefined}
          onSelectChange={!mine ? handleSelectChange : undefined}
          onPageChange={setPage}
          emptyStateComponent={
            !awaitingData && (data?.items || []).length === 0 ? (
              <EmptyOrders
                isOffers={true}
                isSent={mine}
                showCreateAction={false}
                sx={{ py: 4 }}
              />
            ) : undefined
          }
          page={page}
          onPageSizeChange={setPageSize}
          pageSize={pageSize}
          rowCount={
            statusFilter === "unclaimed"
              ? totalCount
              : statusFilter
                ? totals.get(statusFilter) || 0
                : totalCount
          }
          onOrderChange={setOrder}
          order={order}
          onOrderByChange={setOrderBy}
          orderBy={orderBy}
          loading={awaitingData}
          loadingRowComponent={OfferRowSkeleton}
        />
        <MergeOffersDialog search={search} />
      </Paper>
    </Grid>
  )
}
