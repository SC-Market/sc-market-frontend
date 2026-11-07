import { OfferSessionStub } from "../../features/offers/api/offerApi"
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
import { Link } from "react-router-dom"
import {
  AnnouncementRounded,
  CancelRounded,
  CheckCircleRounded,
  HourglassTopRounded,
} from "@mui/icons-material"
import { Stack } from "@mui/system"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useLongPress } from "../../components/gestures"
import { useGetUserProfileQuery } from "../../features/profile/api/profileApi"
import { useOrderViewerRoles } from "../../features/orders/hooks/useOrderViewerRoles"
import { UserAvatar } from "../../components/avatar/UserAvatar"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { canClaimOffer } from "../../features/offers/domain/status"
import { ORDER_PATHS, SHOP_PATHS } from "../../routes/paths"
import { normalizeOfferStatus } from "../../features/offers/domain/types"
import { useFormatters } from "../../util/format"
import { useClaimOffer } from "../../features/offers/hooks/useOfferActions"

export function OfferRow(props: {
  row: OfferSessionStub
  index: number
  onClick?: MouseEventHandler
  isItemSelected: boolean
  labelId: string
  enableSelection?: boolean
  hasSelectedItems?: boolean
  viewAs?: "buyer" | "shop"
}) {
  const fmt = useFormatters()
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
  const claimOffer = useClaimOffer()

  const isBuyerView = props.viewAs === "buyer"

  const roles = useOrderViewerRoles({
    customer: row.customer?.username,
    assignedTo: row.assigned_to?.username,
    contractor: row.contractor?.spectrum_id,
  })
  const canClaim = canClaimOffer(
    {
      status: row.status,
      assignedTo: row.assigned_to?.username,
      contractor: row.contractor?.spectrum_id,
    },
    roles,
  )

  // Key for translation and colour
  const statusKey = normalizeOfferStatus(row.status)

  const [statusColor, icon] = useMemo(() => {
    if (statusKey === "waitingSeller") {
      return [
        "warning" as const,
        <AnnouncementRounded key={"warning"} />,
      ] as const
    } else if (statusKey === "waitingCustomer") {
      return ["info" as const, <HourglassTopRounded key={"info"} />] as const
    } else if (statusKey === "rejected") {
      return ["error" as const, <CancelRounded key={"error"} />] as const
    } else {
      return [
        "success" as const,
        <CheckCircleRounded key={"success"} />,
      ] as const
    }
  }, [statusKey])

  const isMobile = useBreakpointDown("sm")

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
      navigate(ORDER_PATHS.offer(row.id))
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
      data-testid="offer-row"
      data-id={row.id}
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
              ? () => navigate(ORDER_PATHS.offer(row.id))
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
            <Link
              to={ORDER_PATHS.offer(row.id)}
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
                  ? `${fmt.number(row.most_recent_offer.count)} ${t("OffersViewPaginated.items")} • `
                  : row.most_recent_offer.service_name
                    ? `${row.most_recent_offer.service_name} • `
                    : ""}
                {fmt.number(+row.most_recent_offer.cost)} aUEC
              </Typography>
              {row.shop && !isBuyerView && (
                <Typography
                  variant="caption"
                  color="primary"
                  component={Link}
                  to={SHOP_PATHS.profile(row.shop.slug)}
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  sx={{
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "block",
                  }}
                >
                  {row.shop.name}
                </Typography>
              )}
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
        {isBuyerView && row.shop ? (
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
              variant="body2"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 140,
              }}
            >
              {row.shop.name}
            </MaterialLink>
          </Stack>
        ) : (
          <UserAvatar user={row.customer} />
        )}
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
          {canClaim && props.enableSelection && (
            <Button
              size="small"
              variant="outlined"
              sx={{ fontSize: "0.7rem", py: 0, px: 1, minHeight: 24 }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                void claimOffer(row.id, profile!.username)
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
}
