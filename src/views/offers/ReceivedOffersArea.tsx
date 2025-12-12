import {
  OfferSearchStatus,
  OfferSessionStub,
  useSearchOfferSessionsQuery,
  useMergeOfferSessionsMutation,
} from "../../store/offer"
import {
  ControlledTable,
  HeadCell,
} from "../../components/table/PaginatedTable"
import React, { MouseEventHandler, useMemo, useState } from "react"
import {
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Paper,
  Tab,
  TableCell,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material"
import { Link } from "react-router-dom"
import {
  Announcement,
  Cancel,
  CheckCircle,
  HourglassTop,
} from "@mui/icons-material"
import { a11yProps } from "../../components/tabs/Tabs"
import { Stack } from "@mui/system"
import { useTheme } from "@mui/material/styles"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useGetUserProfileQuery } from "../../store/profile"
import { OrderSearchSortMethod } from "../../datatypes/Order"
import { UserAvatar } from "../../components/avatar/UserAvatar"
import { useTranslation } from "react-i18next"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { useNavigate } from "react-router-dom"

// Map for all statuses
const statusTextToKey: Record<string, string> = {
  "Waiting for Seller": "waitingSeller",
  "Waiting for Customer": "waitingCustomer",
  Accepted: "accepted",
  Rejected: "rejected",
}

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
}) {
  const { t } = useTranslation()
  const { row, index, isItemSelected, onClick, enableSelection, labelId } = props
  const date = useMemo(() => new Date(row.timestamp), [row.timestamp])
  const theme = useTheme()
  const navigate = useNavigate()

  // Key for translation and colour
  const statusKey = statusTextToKey[row.status] || row.status

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

  const handleRowClick = (event: React.MouseEvent<unknown>) => {
    if (enableSelection && onClick) {
      // Selection mode - use onClick for selection
      onClick(event as React.MouseEvent<Element>)
    } else if (!enableSelection) {
      // Navigation mode - navigate to offer
      navigate(`/offer/${row.id}`)
    }
  }

  return (
    <TableRow
      hover
      onClick={handleRowClick}
      role={enableSelection ? "checkbox" : undefined}
      aria-checked={enableSelection ? isItemSelected : undefined}
      tabIndex={-1}
      key={index}
      selected={isItemSelected}
      style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
    >
      {enableSelection && (
        <TableCell padding="checkbox">
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
      <TableCell>
        <Stack
          spacing={1}
          direction="row"
          alignItems="center"
          justifyContent="left"
        >
          <Paper
            sx={{ padding: 0.5, bgcolor: theme.palette.background.default }}
          >
            <Stack
              direction={"column"}
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant={"subtitle2"} color={"text.secondary"}>
                {date.toLocaleString("default", { month: "short" })}
              </Typography>
              <Typography
                variant={"h5"}
                fontWeight={"bold"}
                color={"text.secondary"}
              >
                {date.getDate()}
              </Typography>
            </Stack>
          </Paper>
          <Stack direction={"column"} sx={{ flex: 1 }}>
            <Link
              to={`/offer/${row.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
              onClick={(e) => e.stopPropagation()}
            >
              <Typography color={"text.secondary"} fontWeight={"bold"}>
                {t("OffersViewPaginated.offer")}{" "}
                {row.id.substring(0, 8).toUpperCase()}
              </Typography>
              <Typography variant={"body2"}>
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
      <TableCell align={"right"}>
        <UserAvatar user={row.customer} />
      </TableCell>
      <TableCell align={"right"}>
        <Chip
          label={t(`OffersViewPaginated.${statusKey}`, row.status)}
          color={statusColor}
          icon={icon}
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
  const { mine, assigned, contractor } = props
  const { data: profile } = useGetUserProfileQuery()
  const [statusFilter, setStatusFilter] = useState<null | OfferSearchStatus>(
    mine ? "to-customer" : "to-seller",
  )
  const [pageSize, setPageSize] = useState(5)
  const [page, setPage] = useState(0)
  const [orderBy, setOrderBy] = useState("timestamp")
  const [order, setOrder] = useState<"asc" | "desc">("desc")
  const [selectedOfferIds, setSelectedOfferIds] = useState<string[]>([])
  const [mergeModalOpen, setMergeModalOpen] = useState(false)
  const [mergeOffers, { isLoading: isMerging }] = useMergeOfferSessionsMutation()
  const issueAlert = useAlertHook()
  const navigate = useNavigate()

  const handleSelectChange = (
    selected: readonly (OfferSessionStub & { customer_name: string })[keyof (OfferSessionStub & { customer_name: string })][],
  ) => {
    // Convert to string array (selected values are the id field values)
    setSelectedOfferIds(selected as string[])
  }

  const { data } = useSearchOfferSessionsQuery({
    status: statusFilter || undefined,
    index: page,
    page_size: pageSize,
    customer: mine ? profile?.username : undefined,
    assigned: assigned ? profile?.username : undefined,
    contractor: contractor,
    sort_method: orderBy as OrderSearchSortMethod,
    reverse_sort: order === "desc",
  })

  const tabs = [
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

  const totalCount = useMemo(
    () => Object.values(data?.item_counts || {}).reduce((x, y) => x + y, 0),
    [data],
  )

  const totals = useMemo(
    () => new Map(Object.entries(data?.item_counts || [])),
    [data],
  )

  const handleMergeOffers = async () => {
    if (selectedOfferIds.length < 2) return

    const result = await mergeOffers({
      offer_session_ids: selectedOfferIds,
    }).unwrap().then(result => {

      issueAlert({
        message: result.message || t("OffersViewPaginated.merge_success"),
        severity: "success",
      })

      setSelectedOfferIds([])
      setMergeModalOpen(false)

      // Navigate to the merged offer
      if (result.merged_offer_session?.id) {
        window.open(`/offer/${result.merged_offer_session.id}`, "_blank")
      }
    }).catch(issueAlert)
  }

  const selectedOffers = useMemo(() => {
    return (data?.items || []).filter((offer) =>
      selectedOfferIds.includes(offer.id),
    )
  }, [data?.items, selectedOfferIds])

  const totalCost = useMemo(() => {
    return selectedOffers.reduce(
      (sum, offer) => sum + Number(offer.most_recent_offer.cost),
      0,
    )
  }, [selectedOffers])

  return (
    <Grid item xs={12}>
      <Paper>
        <Stack
          direction={"row"}
          sx={{ paddingTop: 2, paddingLeft: 2, paddingRight: 2 }}
        >
          <Typography
            variant={"h5"}
            color={"text.secondary"}
            fontWeight={"bold"}
          >
            {t("OffersViewPaginated.offers")}
          </Typography>
          <Tabs
            value={tab}
            // onChange={(_, newPage) => setPage(newPage)}
            aria-label={t("offers.aria.offerTabs")}
            variant="scrollable"
          >
            <Tab
              label={t("OffersViewPaginated.all")}
              icon={<Chip label={totalCount} size={"small"} />}
              {...a11yProps(0)}
              onClick={() => setStatusFilter(null)}
            />
            {tabs.map(([id, tag], index) => (
              <Tab
                key={id}
                label={tag}
                icon={<Chip label={totals.get(id) || 0} size={"small"} />}
                {...a11yProps(index + 1)}
                onClick={() => setStatusFilter(id)}
              />
          ))}
        </Tabs>
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
        page={page}
        onPageSizeChange={setPageSize}
        pageSize={pageSize}
        rowCount={statusFilter ? totals.get(statusFilter) || 0 : totalCount}
        onOrderChange={setOrder}
        order={order}
        onOrderByChange={setOrderBy}
        orderBy={orderBy}
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
