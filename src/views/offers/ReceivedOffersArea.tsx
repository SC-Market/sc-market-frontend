import {
  OfferSearchStatus,
  OfferSessionStub,
  useSearchOfferSessionsQuery,
  useMergeOfferSessionsMutation,
} from "../../features/offers/api/offerApi"
import {
  ControlledTable,
  HeadCell,
} from "../../components/table/PaginatedTable"
import React, {
  MouseEventHandler,
  useMemo,
  useCallback,
} from "react"
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
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
import { Link } from "react-router-dom"
import {
  Announcement,
  Cancel,
  CheckCircle,
  Close,
  ExpandLess,
  ExpandMore,
  HourglassTop,
  Search,
} from "@mui/icons-material"
import { a11yProps } from "../../components/tabs/Tabs"
import { Stack } from "@mui/system"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { EmptyOrders } from "../../components/empty-states"
import { useLongPress } from "../../components/gestures"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useGetUserProfileQuery } from "../../features/profile/api/profileApi"
import { OrderSearchSortMethod } from "../../features/orders/domain/types"
import { UserAvatar } from "../../components/avatar/UserAvatar"
import { useTranslation } from "react-i18next"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { useNavigate } from "react-router-dom"
import { useDebounce } from "../../hooks/useDebounce"
import { OfferRowSkeleton } from "../../components/skeletons"
import { useAssignOfferMutation } from "../../features/offers/api/offerApi"
import { has_permission } from "../contractor/OrgRoles"
import { useOfferSearch } from "../../features/offers/hooks/useOfferSearch"

// Map for all statuses
import { normalizeOfferStatus } from "../../features/offers/domain/types"

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
    label: "User",
  },
  {
    id: "status",
    numeric: true,
    disablePadding: false,
    label: "Status",
  },
]

export function OfferRow(props: {
  row: OfferSessionStub
  index: number
  onClick?: MouseEventHandler
  isItemSelected: boolean
  labelId: string
  enableSelection?: boolean
  hasSelectedItems?: boolean
}) {
  const { t } = useTranslation()
  const {
    row,
    index,
    isItemSelected,
    onClick,
    enableSelection,
    labelId,
    hasSelectedItems = false,
  } = props
  const date = useMemo(() => new Date(row.timestamp), [row.timestamp])
  const theme = useTheme<ExtendedTheme>()
  const navigate = useNavigate()
  const { data: profile } = useGetUserProfileQuery()
  const [currentOrg] = useCurrentOrg()
  const [assignOffer] = useAssignOfferMutation()
  const issueAlert = useAlertHook()

  const canClaim = useMemo(() => {
    if (row.assigned_to || !currentOrg || !profile) return false
    const normalized = normalizeOfferStatus(row.status)
    if (normalized !== "waitingSeller" && normalized !== "waitingCustomer") return false
    return has_permission(currentOrg, profile, "claim_orders", profile.contractors)
  }, [row.assigned_to, row.status, currentOrg, profile])

  // Key for translation and colour
  const statusKey = normalizeOfferStatus(row.status)

  const [statusColor, icon] = useMemo(() => {
    if (statusKey === "waitingSeller") {
      return ["warning" as const, <Announcement key={"warning"} />] as const
    } else if (statusKey === "waitingCustomer") {
      return ["info" as const, <HourglassTop key={"info"} />] as const
    } else if (statusKey === "rejected") {
      return ["error" as const, <Cancel key={"error"} />] as const
    } else {
      return ["success" as const, <CheckCircle key={"success"} />] as const
    }
  }, [statusKey])

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  // When in selection mode (hasSelectedItems) on mobile, single tap should select
  const isInSelectionMode = isMobile && hasSelectedItems

  const handleRowClick = (event: React.MouseEvent<unknown>) => {
    if (isInSelectionMode && onClick) {
      // In selection mode on mobile - use onClick for selection
      onClick(event as React.MouseEvent<Element>)
    } else if (enableSelection && onClick) {
      // Selection mode - use onClick for selection
      onClick(event as React.MouseEvent<Element>)
    } else if (!enableSelection) {
      // Navigation mode - navigate to offer
      navigate(`/offer/${row.id}`)
    }
  }

  // Long-press handler - on mobile, directly toggles selection
  const handleLongPressForSelection = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (isMobile && enableSelection && onClick) {
        // On mobile, long-press directly toggles selection
        event.preventDefault()
        event.stopPropagation()
        onClick(event as React.MouseEvent<Element>)
      }
    },
    [isMobile, enableSelection, onClick],
  )

  const longPressHandlers = useLongPress({
    onLongPress: handleLongPressForSelection,
    enabled: isMobile && enableSelection,
    delay: 500,
  })

  const shouldUseDiv = isInSelectionMode || (isMobile && enableSelection)

  return (
    <TableRow
      hover
      onClick={
        isInSelectionMode
          ? handleRowClick
          : isMobile && enableSelection
            ? undefined
            : handleRowClick
      }
      role={enableSelection ? "checkbox" : undefined}
      aria-checked={enableSelection ? isItemSelected : undefined}
      tabIndex={-1}
      key={index}
      selected={isItemSelected}
      style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
      {...(shouldUseDiv ? { component: "div" as const } : {})}
      {...(isMobile && enableSelection ? longPressHandlers : {})}
      sx={{
        "& .MuiTableCell-root": {
          padding: { xs: theme.spacing(0.75), sm: theme.spacing(2) },
        },
      }}
    >
      {enableSelection && (
        <TableCell
          padding="checkbox"
          sx={{
            display: { xs: "none", sm: "table-cell" }, // Hide checkbox on mobile
          }}
        >
          <Checkbox
            color="primary"
            checked={isItemSelected}
            inputProps={{
              "aria-labelledby": labelId,
            }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              e.stopPropagation()
              if (onClick) {
                // Leverage the table's selection handler
                onClick(e as unknown as React.MouseEvent<Element>)
              }
            }}
          />
        </TableCell>
      )}
      <TableCell
        onClick={
          isInSelectionMode
            ? handleRowClick
            : isMobile && enableSelection
              ? () => navigate(`/offer/${row.id}`)
              : undefined
        }
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
            <Link
              to={`/offer/${row.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
              onClick={(e) => e.stopPropagation()}
            >
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
                {t("OffersViewPaginated.offer")}{" "}
                {row.id.substring(0, 8).toUpperCase()}
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
                {row.most_recent_offer.count
                  ? `${row.most_recent_offer.count.toLocaleString(
                      undefined,
                    )} ${t("OffersViewPaginated.items")} • `
                  : row.most_recent_offer.service_name
                    ? `${row.most_recent_offer.service_name} • `
                    : ""}
                {(+row.most_recent_offer.cost).toLocaleString(undefined)} aUEC
              </Typography>
            </Link>
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
        }}
      >
        <UserAvatar user={row.customer} />
      </TableCell>
      <TableCell
        align="right"
        sx={{
          width: { xs: "25%", sm: "auto" },
          minWidth: { xs: 70, sm: "auto" },
        }}
      >
        <Stack alignItems="flex-end" spacing={0.5}>
          <Chip
            label={t(`OffersViewPaginated.${statusKey}`, row.status)}
            color={statusColor}
            icon={icon}
            size={isMobile ? "small" : "medium"}
          />
          {canClaim && (
            <Button
              size="small"
              variant="outlined"
              sx={{ fontSize: "0.7rem", py: 0, px: 1, minHeight: 24 }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                assignOffer({ session_id: row.id, username: profile!.username })
                  .unwrap()
                  .then(() => issueAlert({ message: t("orders.claimed", "Offer claimed"), severity: "success" }))
                  .catch(issueAlert)
              }}
            >
              {t("orders.claimOrder", "Claim")}
            </Button>
          )}
        </Stack>
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

export function ReceivedOffersArea() {
  const [currentOrg] = useCurrentOrg()

  return (
    <OffersViewPaginated
      assigned={!currentOrg}
      contractor={currentOrg?.spectrum_id}
    />
  )
}

export function SentOffersArea() {
  return <OffersViewPaginated mine />
}

export function OffersViewPaginated(props: {
  mine?: boolean
  assigned?: boolean
  contractor?: string
}) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { mine, assigned, contractor } = props

  const {
    data, isLoading, isFetching,
    page, setPage, pageSize, setPageSize,
    order, setOrder, orderBy, setOrderBy,
    statusFilter, setStatusFilter,
    totalCount, totals,
    selectedOfferIds, handleSelectChange,
    mergeModalOpen, setMergeModalOpen,
    isMerging, handleMergeOffers,
    selectedOffers, totalCost,
    filtersOpen, setFiltersOpen,
    buyerUsername, setBuyerUsername,
    sellerUsername, setSellerUsername,
    hasMarketListings, setHasMarketListings,
    hasService, setHasService,
    debouncedBuyerUsername, debouncedSellerUsername,
    activeFiltersCount, clearFilters,
    profile, issueAlert,
  } = useOfferSearch({ mine, assigned, contractor })

  const tabs = [
    [null, t("OffersViewPaginated.all", { defaultValue: "All" })],
    ["to-seller", t("OffersViewPaginated.waitingSeller")],
    ["to-customer", t("OffersViewPaginated.waitingCustomer")],
    ["accepted", t("OffersViewPaginated.accepted")],
    ["rejected", t("OffersViewPaginated.rejected")],
  ] as const

  const tab = useMemo(
    () =>
      [null, "to-seller", "to-customer", "accepted", "rejected"].indexOf(
        statusFilter,
      ),
    [statusFilter],
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
                  onClick={() => setStatusFilter(id)}
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
        <Collapse in={filtersOpen}>
          <Paper sx={{ p: 1, m: 1, bgcolor: "background.default" }}>
            <Stack>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="subtitle2">
                  {t("OffersViewPaginated.filter_offers", "Filter Offers")}
                </Typography>
                {activeFiltersCount > 0 && (
                  <Button size="small" onClick={clearFilters}>
                    {t("OffersViewPaginated.clear_filters", "Clear All")}
                  </Button>
                )}
              </Stack>

              <Grid container spacing={theme.layoutSpacing.compact}>
                {/* Buyer/Seller Username Filter */}
                {!mine ? (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={t(
                        "OffersViewPaginated.buyer_username",
                        "Buyer Username",
                      )}
                      value={buyerUsername}
                      onChange={(e) => setBuyerUsername(e.target.value)}
                      size="small"
                      placeholder={t(
                        "OffersViewPaginated.buyer_username_placeholder",
                        "Enter buyer username",
                      )}
                    />
                  </Grid>
                ) : (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={t(
                        "OffersViewPaginated.seller_username",
                        "Seller Username",
                      )}
                      value={sellerUsername}
                      onChange={(e) => setSellerUsername(e.target.value)}
                      size="small"
                      placeholder={t(
                        "OffersViewPaginated.seller_username_placeholder",
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
                      "OffersViewPaginated.has_market_listings",
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
                    label={t("OffersViewPaginated.has_service", "Has Service")}
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
                      label={`${t("OffersViewPaginated.buyer", "Buyer")}: ${debouncedBuyerUsername}`}
                      onDelete={() => setBuyerUsername("")}
                      size="small"
                    />
                  )}
                  {debouncedSellerUsername && (
                    <Chip
                      label={`${t("OffersViewPaginated.seller", "Seller")}: ${debouncedSellerUsername}`}
                      onDelete={() => setSellerUsername("")}
                      size="small"
                    />
                  )}
                  {hasMarketListings !== undefined && (
                    <Chip
                      label={t(
                        "OffersViewPaginated.has_market_listings",
                        "Has Market Listings",
                      )}
                      onDelete={() => setHasMarketListings(undefined)}
                      size="small"
                    />
                  )}
                  {hasService !== undefined && (
                    <Chip
                      label={t(
                        "OffersViewPaginated.has_service",
                        "Has Service",
                      )}
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
          rows={(data?.items || []).map((o) => ({
            ...o,
            customer_name: o.customer.username,
          }))}
          initialSort={"timestamp"}
          generateRow={(props) => (
            <OfferRow {...props} enableSelection={!mine} />
          )}
          keyAttr={"id"}
          headCells={OffersHeadCells.map((cell) => ({
            ...cell,
            label: t(
              `OffersViewPaginated.${cell.label.toLowerCase()}`,
              cell.label,
            ),
          }))}
          disableSelect={mine}
          selected={!mine ? selectedOfferIds : undefined}
          onSelectChange={!mine ? handleSelectChange : undefined}
          onPageChange={setPage}
          emptyStateComponent={
            !(isLoading || isFetching) && (data?.items || []).length === 0 ? (
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
          rowCount={statusFilter ? totals.get(statusFilter) || 0 : totalCount}
          onOrderChange={setOrder}
          order={order}
          onOrderByChange={setOrderBy}
          orderBy={orderBy}
          loading={isLoading || isFetching}
          loadingRowComponent={OfferRowSkeleton}
        />
        <Dialog
          open={mergeModalOpen}
          onClose={() => {
            if (!isMerging) {
              setMergeModalOpen(false)
            }
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {t("OffersViewPaginated.merge_offers_confirm_title")}
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              {t("OffersViewPaginated.merge_offers_confirm_body", {
                count: selectedOfferIds.length,
              })}
            </DialogContentText>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {t("OffersViewPaginated.merge_offers_selected_count", {
                count: selectedOfferIds.length,
              })}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {t("OffersViewPaginated.merge_offers_combined_cost", {
                cost: totalCost.toLocaleString(),
              })}
            </Typography>
            <DialogContentText variant="body2" color="warning.main">
              {t("OffersViewPaginated.merge_offers_warning")}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                if (!isMerging) {
                  setMergeModalOpen(false)
                }
              }}
              disabled={isMerging}
            >
              {t("OffersViewPaginated.merge_offers_confirm_cancel")}
            </Button>
            <Button
              onClick={handleMergeOffers}
              color="primary"
              variant="contained"
              disabled={isMerging || selectedOfferIds.length < 2}
            >
              {t("OffersViewPaginated.merge_offers_confirm_button")}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Grid>
  )
}
