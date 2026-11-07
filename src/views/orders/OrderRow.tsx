import { OrderStub } from "../../features/orders/domain/types"
import React, { MouseEventHandler, useMemo, useCallback } from "react"
import {
  Avatar,
  Button,
  Checkbox,
  Chip,
  Link as MaterialLink,
  Paper,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material"
import { useBreakpointDown } from "../../hooks/layout/useBreakpoint"
import { Link, useNavigate } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { UserAvatar } from "../../components/avatar/UserAvatar"
import { ContractorAvatar } from "../../components/avatar/ContractorAvatar"
import { Stack } from "@mui/system"
import { useGetUserProfileQuery } from "../../features/profile/api/profileApi"
import { useTranslation } from "react-i18next"
import { useLongPress } from "../../components/gestures"
import { useOrderViewerRoles } from "../../features/orders/hooks/useOrderViewerRoles"
import { canClaimOrder } from "../../features/orders/domain/orderRoles"
import {
  statusColors,
  statusNames,
} from "../../features/orders/domain/constants"
import { ORDER_PATHS, SHOP_PATHS } from "../../routes/paths"
import { useFormatters } from "../../util/format"
import { useClaimOrder } from "../../features/orders/hooks/useClaimOrder"

export function OrderRow(props: {
  /** is_test: Admin › Orders with test orders shown; marks the row "Test". */
  row: OrderStub & { mine?: boolean; is_test?: boolean }
  index: number
  onClick?: MouseEventHandler
  isItemSelected: boolean
  labelId: string
  hasSelectedItems?: boolean
}) {
  const fmt = useFormatters()
  const {
    row,
    index,
    isItemSelected,
    hasSelectedItems = false,
    onClick,
  } = props // TODO: Add `assigned_to` column
  const date = useMemo(() => new Date(row.timestamp), [row.timestamp])
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const isMobile = useBreakpointDown("sm")
  const navigate = useNavigate()
  const { data: profile } = useGetUserProfileQuery()
  const claimOrder = useClaimOrder()

  const roles = useOrderViewerRoles({
    customer: row.customer?.username,
    assignedTo: row.assigned_to?.username,
    contractor: row.contractor?.spectrum_id,
  })
  const canClaim = canClaimOrder(
    {
      status: row.status,
      assignedTo: row.assigned_to?.username,
      contractor: row.contractor?.spectrum_id,
    },
    roles,
  )

  // When in selection mode (hasSelectedItems) on mobile, single tap should select
  const isInSelectionMode = isMobile && hasSelectedItems

  const statusColor = useMemo(() => statusColors.get(row.status), [row.status])
  const status = useMemo(
    () => t(statusNames.get(row.status) || ""),
    [row.status, t],
  )

  // Long-press handler - on mobile, directly toggles selection
  const handleLongPressForSelection = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (isMobile && onClick) {
        // On mobile, long-press directly toggles selection
        event.preventDefault()
        event.stopPropagation()
        onClick(event as React.MouseEvent)
      }
    },
    [isMobile, onClick],
  )

  const longPressHandlers = useLongPress({
    onLongPress: handleLongPressForSelection,
    enabled: isMobile,
    delay: 500,
  })

  // Long-press menu actions (for non-selection actions) - only show on desktop or as secondary

  const rowContent = (
    <TableRow
      data-testid="order-row"
      data-id={row.order_id}
      hover
      onClick={isInSelectionMode ? onClick : isMobile ? undefined : onClick}
      role="checkbox"
      aria-checked={isItemSelected}
      tabIndex={-1}
      key={index}
      selected={isItemSelected}
      style={{ textDecoration: "none", color: "inherit" }}
      component={isInSelectionMode ? "div" : isMobile ? "div" : Link}
      to={
        isInSelectionMode
          ? undefined
          : isMobile
            ? undefined
            : ORDER_PATHS.contract(row.order_id)
      }
      {...(isMobile ? longPressHandlers : {})}
      sx={{
        "& .MuiTableCell-root": {
          padding: { xs: theme.spacing(1), sm: theme.spacing(2) },
        },
        cursor: "pointer",
        // On mobile, make the first cell clickable for navigation
        "& .MuiTableCell-root:first-of-type": {
          cursor: "pointer",
        },
      }}
    >
      {/* Checkbox column - matches table header when selection is enabled */}
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
            "aria-labelledby": props.labelId,
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
      <TableCell
        onClick={
          isInSelectionMode
            ? onClick
            : isMobile
              ? () => navigate(ORDER_PATHS.contract(row.order_id))
              : undefined
        }
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
                {fmt.date(date, { month: "short" })}
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
              {row.is_test && (
                <Chip
                  label={t("orders.testChip", "Test")}
                  size="small"
                  color="warning"
                  variant="outlined"
                  sx={{ ml: 1, height: 18, fontSize: "0.7rem" }}
                />
              )}
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
                ? `${fmt.number(row.count)} ${t("orders.items")} • `
                : row.service_name
                  ? `${row.service_name} • `
                  : ""}
              {fmt.number(+row.cost)} aUEC
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
        {row.mine ? (
          row.shop ? (
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ justifyContent: "flex-end" }}
            >
              {row.shop.avatar && (
                <Avatar src={row.shop.avatar} sx={{ width: 32, height: 32 }} />
              )}
              <MaterialLink
                component={Link}
                to={SHOP_PATHS.profile(row.shop.slug)}
                underline="hover"
                color="text.secondary"
                variant="subtitle2"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 160,
                }}
              >
                {row.shop.name}
              </MaterialLink>
            </Stack>
          ) : row.contractor ? (
            <ContractorAvatar contractor={row.contractor} />
          ) : row.assigned_to ? (
            <UserAvatar user={row.assigned_to} />
          ) : null
        ) : (
          <UserAvatar user={row.customer} />
        )}
      </TableCell>
      <TableCell
        align="right"
        sx={{
          width: { xs: "25%", sm: "auto" },
          minWidth: { xs: 70, sm: "auto" },
          padding: { xs: theme.spacing(0.75), sm: theme.spacing(2) },
        }}
      >
        <Stack alignItems="flex-end" spacing={0.5}>
          <Chip
            label={status}
            color={statusColor}
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
                void claimOrder(row.order_id, profile!.username)
              }}
            >
              {t("orders.claimOrder", "Claim")}
            </Button>
          )}
        </Stack>
      </TableCell>

      {/*<TableCell align={'right'}>*/}
      {/*    <Button color={'primary'} variant={'outlined'} onClick={handleAcceptBid}>*/}
      {/*        Accept*/}
      {/*    </Button>*/}
      {/*</TableCell>*/}
    </TableRow>
  )

  return rowContent
}
