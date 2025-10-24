import {
  Badge,
  Box,
  Button,
  Collapse,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  TablePagination,
  Tooltip,
  Typography,
} from "@mui/material"
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import EmailRoundedIcon from "@mui/icons-material/EmailRounded"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import CreateRoundedIcon from "@mui/icons-material/CreateRounded"
import { Link } from "react-router-dom"
import { UnderlineLink } from "../typography/UnderlineLink"
import {
  useAcceptContractorInviteMutation,
  useDeclineContractorInviteMutation,
} from "../../store/contractor"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { Order, OrderComment, OrderReview } from "../../datatypes/Order"
import { ContractorInvite } from "../../datatypes/Contractor"
import { Notification } from "../../hooks/login/UserProfile"
import { getRelativeTime } from "../../util/time"
import {
  ClearAllRounded,
  CloseRounded,
  EditRounded,
  MarkEmailReadRounded,
  UpdateRounded,
} from "@mui/icons-material"
import {
  useGetNotificationsQuery,
  useNotificationDeleteMutation,
  useNotificationUpdateMutation,
  useNotificationBulkUpdateMutation,
  useNotificationBulkDeleteMutation,
} from "../../store/notification"
import { MarketBid } from "../../datatypes/MarketListing"
import { useGetMarketListingQuery } from "../../store/market"
import { OfferSession } from "../../store/offer"
import { Trans, useTranslation } from "react-i18next"
import { MarkdownRender } from "../markdown/Markdown"

/*
VALUES ('order_create', 'orders'),
       ('order_assigned', 'orders'),
       ('order_review', 'order_reviews'),
       ('order_status_fulfilled', 'orders'),
       ('order_status_in_progress', 'orders'),
       ('order_status_not_started', 'orders'),
       ('order_status_cancelled', 'orders'),
       ('order_comment', 'order_comments'),
       ('contractor_invite', 'contractor_invites'),
       ('market_item_bid', 'market_listing'),
       ('market_item_offer', 'market_listing')
 */
export function NotificationEntry(props: { notif: Notification }) {
  const { notif } = props
  switch (notif.action) {
    case "order_create":
      return <NotificationOrderCreate notif={notif} />
    case "offer_create":
    case "counter_offer_create":
      return <NotificationOfferCreate notif={notif} />
    case "offer_message":
      return <NotificationOfferMessage notif={notif} />
    case "contractor_invite":
      return <NotificationContractorInvite notif={notif} />
    case "order_assigned":
      return <NotificationOrderCreate notif={notif} />
    case "order_comment":
      return <NotificationOrderComment notif={notif} />
    case "order_review":
      return <NotificationOrderReview notif={notif} />
    case "order_message":
      return <NotificationOrderMessage notif={notif} />
    case "order_status_fulfilled":
    case "order_status_in_progress":
    case "order_status_not_started":
    case "order_status_cancelled":
      return <NotificationOrderUpdateStatus notif={notif} />
    case "market_item_bid":
      return <NotificationBid notif={notif} />
    case "admin_alert":
      return <NotificationAdminAlert notif={notif} />
    case "order_review_revision_requested":
      return <NotificationReviewRevisionRequest notif={notif} />
    default:
      return null
  }
}

export function NotificationBase(props: {
  icon: React.ReactNode
  to?: string
  notif: Notification
  onClick?: () => void
  children: React.ReactNode
}) {
  const theme = useTheme<ExtendedTheme>()
  const { icon, to, notif, onClick } = props

  const [updateNotification] = useNotificationUpdateMutation()

  const defaultClick = useCallback(async () => {
    await updateNotification({
      notification_id: notif.notification_id,
      read: true,
    })
  }, [notif.notification_id, updateNotification])

  return (
    <ListItemButton
      component={to ? Link : "div"}
      to={to}
      onClick={onClick || defaultClick}
      sx={{ position: "relative" }}
    >
      <ListItemIcon
        sx={{
          color: notif.read
            ? theme.palette.text.primary
            : theme.palette.primary.main,
          transition: "0.3s",
          fontSize: "0.9em",
        }}
      >
        {icon}
      </ListItemIcon>
      <ListItemText
        sx={{
          maxWidth: 300,
          color: "text.secondary",
          wordWrap: "break-word",
          overflowWrap: "break-word",
        }}
      >
        <Typography sx={{ wordBreak: "break-word" }}>
          {props.children}
        </Typography>
        <Typography variant={"subtitle2"} color={"text.primary"}>
          {getRelativeTime(new Date(notif.timestamp))}
        </Typography>
      </ListItemText>
      <NotificationDeleteButton notif={notif} />
    </ListItemButton>
  )
}

export function NotificationDeleteButton(props: { notif: Notification }) {
  const [deleteNotification] = useNotificationDeleteMutation()
  const { t } = useTranslation()

  return (
    <Tooltip title={t("notifications.delete_notification")}>
      <IconButton
        size={"small"}
        onClick={(event) => {
          deleteNotification([props.notif.notification_id])
          event.preventDefault()
          event.stopPropagation()
          return false
        }}
      >
        <CloseRounded />
      </IconButton>
    </Tooltip>
  )
}

export function NotificationOrderReview(props: { notif: Notification }) {
  const { notif } = props
  const theme = useTheme<ExtendedTheme>()
  const review = useMemo(() => notif.entity as OrderReview, [notif.entity])
  const { t } = useTranslation()

  return (
    <NotificationBase
      icon={<CreateRoundedIcon />}
      to={`/contract/${review.order_id}`}
      notif={notif}
    >
      {t("notifications.new_review_by")}{" "}
      <Link
        to={
          review.user_author
            ? `/user/${review.user_author.username}`
            : `/contractor/${review.contractor_author!.spectrum_id}`
        }
        style={{
          textDecoration: "none",
          color: theme.palette.secondary.main,
        }}
      >
        <UnderlineLink>
          {review.user_author?.username ||
            review.contractor_author!.spectrum_id}
        </UnderlineLink>
      </Link>
    </NotificationBase>
  )
}

export function NotificationOrderComment(props: { notif: Notification }) {
  const { notif } = props
  const theme = useTheme<ExtendedTheme>()
  const comment = useMemo(() => notif.entity as OrderComment, [notif.entity])
  const { t } = useTranslation()

  return (
    <NotificationBase
      icon={<CreateRoundedIcon />}
      to={`/contract/${comment.order_id}`}
      notif={notif}
    >
      {t("notifications.new_order_comment_by")}{" "}
      <Link
        to={`/user/${comment.author.username}`}
        style={{
          textDecoration: "none",
          color: theme.palette.secondary.main,
        }}
      >
        <UnderlineLink>{comment.author.username}</UnderlineLink>
      </Link>
    </NotificationBase>
  )
}

export function NotificationOrderMessage(props: { notif: Notification }) {
  const { notif } = props
  const theme = useTheme<ExtendedTheme>()
  const comment = useMemo(() => notif.entity as Order, [notif.entity])
  const { t } = useTranslation()

  return (
    <NotificationBase
      icon={<CreateRoundedIcon />}
      to={`/contract/${comment.order_id}`}
      notif={notif}
    >
      {t("notifications.new_order_message_by")}{" "}
      <Link
        to={`/user/${notif.actors[0].username}`}
        style={{
          textDecoration: "none",
          color: theme.palette.secondary.main,
        }}
      >
        <UnderlineLink>{notif.actors[0].username}</UnderlineLink>
      </Link>
    </NotificationBase>
  )
}

export function NotificationOrderCreate(props: { notif: Notification }) {
  const { notif } = props
  const theme = useTheme<ExtendedTheme>()
  const order = useMemo(() => notif.entity as Order, [notif.entity])
  const { t } = useTranslation()

  return (
    <NotificationBase
      icon={<CreateRoundedIcon />}
      to={`/contract/${order.order_id}`}
      notif={notif}
    >
      {t("notifications.new_order_placed_by")}{" "}
      <Link
        to={`/user/${order.customer}`}
        style={{
          textDecoration: "none",
          color: theme.palette.secondary.main,
        }}
      >
        <UnderlineLink>{order.customer}</UnderlineLink>
      </Link>
    </NotificationBase>
  )
}

export function NotificationOfferCreate(props: { notif: Notification }) {
  const { notif } = props
  const theme = useTheme<ExtendedTheme>()
  const offer = useMemo(() => notif.entity as OfferSession, [notif.entity])
  const { t } = useTranslation()

  return (
    <NotificationBase
      icon={<CreateRoundedIcon />}
      to={`/offer/${offer.id}`}
      notif={notif}
    >
      {notif.action === "offer_create"
        ? t("notifications.new_offer_received_from")
        : t("notifications.counter_offer_received_from")}{" "}
      <Link
        to={`/user/${offer.customer.username}`}
        style={{
          textDecoration: "none",
          color: theme.palette.secondary.main,
        }}
      >
        <UnderlineLink>{offer.customer.display_name}</UnderlineLink>
      </Link>
    </NotificationBase>
  )
}

export function NotificationOfferMessage(props: { notif: Notification }) {
  const { notif } = props
  const theme = useTheme<ExtendedTheme>()
  const offer = useMemo(() => notif.entity as OfferSession, [notif.entity])
  const { t } = useTranslation()

  return (
    <NotificationBase
      icon={<CreateRoundedIcon />}
      to={`/offer/${offer.id}`}
      notif={notif}
    >
      {t("notifications.new_offer_message_from")}{" "}
      <Link
        to={`/user/${offer.customer.username}`}
        style={{
          textDecoration: "none",
          color: theme.palette.secondary.main,
        }}
      >
        <UnderlineLink>{offer.customer.display_name}</UnderlineLink>
      </Link>
    </NotificationBase>
  )
}

export function NotificationOrderUpdateStatus(props: { notif: Notification }) {
  const theme = useTheme<ExtendedTheme>()
  const { notif } = props
  const order = useMemo(() => notif.entity as Order, [notif.entity])
  const status = notif.action
    .replaceAll("order_status_", "")
    .replaceAll("_", "-") as
    | "fulfilled"
    | "in-progress"
    | "not-started"
    | "cancelled"
  const { t } = useTranslation()

  return (
    <NotificationBase
      icon={<UpdateRounded />}
      to={`/contract/${order.order_id}`}
      notif={notif}
    >
      {t("notifications.order_status_updated_to", { status })}{" "}
      <Link
        to={`/user/${notif.actors[0].username}`}
        style={{
          textDecoration: "none",
          color: theme.palette.secondary.main,
        }}
      >
        <UnderlineLink>{notif.actors[0].username}</UnderlineLink>
      </Link>
    </NotificationBase>
  )
}

export function NotificationContractorInvite(props: { notif: Notification }) {
  const theme = useTheme<ExtendedTheme>()
  const [open, setOpen] = useState(false)
  const { notif } = props
  const invite = useMemo(() => notif.entity as ContractorInvite, [notif.entity])
  const { t } = useTranslation()

  const [acceptInvite] = useAcceptContractorInviteMutation()
  const [declineInvite] = useDeclineContractorInviteMutation()

  const issueAlert = useAlertHook()

  async function submitInviteForm(
    choice: "accept" | "decline",
  ): Promise<boolean | void> {
    const funs = {
      accept: acceptInvite,
      decline: declineInvite,
    }

    funs[choice]({
      contractor: invite.spectrum_id,
    })
      .unwrap()
      .then(() => {
        issueAlert({
          message: t("notifications.submitted"),
          severity: "success",
        })
      })
      .catch((err) => issueAlert(err))

    return false
  }

  return (
    <>
      <NotificationBase
        icon={<EmailRoundedIcon />}
        onClick={() => setOpen((o) => !o)}
        notif={notif}
      >
        <Trans
          i18nKey="notifications.contractor_invite_from"
          t={t}
          values={{ spectrum_id: invite.spectrum_id }}
          components={{
            contractorLink: (
              <Link
                to={`/contractor/${invite.spectrum_id}`}
                style={{
                  textDecoration: "none",
                  color: theme.palette.secondary.main,
                }}
              >
                <UnderlineLink>Placeholder</UnderlineLink>
              </Link>
            ),
          }}
        />
      </NotificationBase>
      <Collapse in={open}>
        <ListItem>
          <Box>{invite.message}</Box>

          <Button
            color={"success"}
            sx={{ marginRight: 1, marginLeft: 1 }}
            onClick={() => submitInviteForm("accept")}
          >
            {t("notifications.accept")}
          </Button>
          <Button color={"error"} onClick={() => submitInviteForm("decline")}>
            {t("notifications.decline")}
          </Button>
        </ListItem>
      </Collapse>
    </>
  )
}

export function NotificationBid(props: { notif: Notification }) {
  const { notif } = props
  const theme = useTheme<ExtendedTheme>()
  const bid = useMemo(() => notif.entity as MarketBid, [notif.entity])
  const { data: listing } = useGetMarketListingQuery(bid.listing_id)
  const { t } = useTranslation()

  return (
    <NotificationBase
      icon={<CreateRoundedIcon />}
      to={`/market/${bid.listing_id}`}
      notif={notif}
    >
      {t("notifications.new_bid_placed_by")}{" "}
      <Link
        to={
          bid.user_bidder
            ? `/user/${bid.user_bidder.username}`
            : `/contractor/${bid.contractor_bidder?.spectrum_id}`
        }
        style={{
          textDecoration: "none",
          color: theme.palette.secondary.main,
        }}
      >
        <UnderlineLink>
          {bid.user_bidder
            ? bid.user_bidder.display_name
            : bid.contractor_bidder!.name}
        </UnderlineLink>
      </Link>{" "}
      {t("notifications.for")}{" "}
      <Link
        to={`/market/${bid.listing_id}`}
        style={{
          textDecoration: "none",
          color: theme.palette.secondary.main,
        }}
      >
        <UnderlineLink>{listing?.details.title}</UnderlineLink>
      </Link>
    </NotificationBase>
  )
}

export function NotificationAdminAlert(props: { notif: Notification }) {
  const { notif } = props
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()

  const [updateNotification] = useNotificationUpdateMutation()

  const alertEntity =
    notif.entity && typeof notif.entity === "object" && "title" in notif.entity
      ? (notif.entity as any)
      : null

  const handleClick = async () => {
    // Mark notification as read first
    await updateNotification({
      notification_id: notif.notification_id,
      read: true,
    })

    // Then open the link if it exists
    if (alertEntity?.link) {
      window.open(alertEntity.link, "_blank")
    }
  }

  return (
    <NotificationBase
      icon={<NotificationsActiveRoundedIcon />}
      notif={notif}
      onClick={alertEntity?.link ? handleClick : undefined}
    >
      {alertEntity?.title && (
        <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
          {alertEntity.title}
        </Typography>
      )}
      {alertEntity?.content ? (
        <Box sx={{ maxHeight: "200px", overflow: "hidden" }}>
          <MarkdownRender text={alertEntity.content} />
        </Box>
      ) : (
        <Typography variant="body2">
          {t(
            "notifications.new_admin_alert",
            "You have received a new admin alert",
          )}
        </Typography>
      )}
      {alertEntity?.link && (
        <Typography
          variant="body2"
          sx={{ mt: 1, color: "primary.main", fontWeight: "bold" }}
        >
          {t("notifications.click_to_open_link", "Click to open link")}
        </Typography>
      )}
    </NotificationBase>
  )
}

export function NotificationReviewRevisionRequest(props: {
  notif: Notification
}) {
  const { notif } = props
  const { t } = useTranslation()

  const reviewEntity =
    notif.entity &&
    typeof notif.entity === "object" &&
    "review_id" in notif.entity
      ? (notif.entity as OrderReview)
      : null

  // Get the requester from the actors array (first actor is the requester)
  const requester =
    notif.actors && notif.actors.length > 0 ? notif.actors[0] : null

  return (
    <NotificationBase
      icon={<EditRounded />}
      to={
        reviewEntity?.order_id ? `/order/${reviewEntity.order_id}` : undefined
      }
      notif={notif}
    >
      <Trans
        i18nKey="notifications.reviewRevisionRequested"
        values={{
          requester: requester?.username || "Unknown user",
          message: reviewEntity?.revision_message,
        }}
        components={{
          strong: <strong />,
          message: (
            <div style={{ fontStyle: "italic", marginTop: "4px" }}>
              reviewEntity?.revision_message
            </div>
          ),
        }}
      />
    </NotificationBase>
  )
}

export function NotificationsButton() {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  const notifOpen = Boolean(anchorEl)
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(5)

  const { data: notificationsData } = useGetNotificationsQuery(
    {
      page,
      pageSize,
    },
    {
      pollingInterval: 120000,
    },
  )

  const notifications = notificationsData?.notifications || []
  const total = notificationsData?.pagination?.total || 0
  const unreadCount = notificationsData?.unread_count || 0

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const [bulkUpdate] = useNotificationBulkUpdateMutation()
  const [bulkDelete] = useNotificationBulkDeleteMutation()
  const issueAlert = useAlertHook()

  const markAllReadCallback = useCallback(async () => {
    try {
      const result = await bulkUpdate({ read: true }).unwrap()
      issueAlert({
        severity: "success",
        message: t("notifications.marked_all_read", {
          count: result.affected_count,
        }),
      })
    } catch (error) {
      issueAlert({
        severity: "error",
        message: t("notifications.mark_all_read_failed"),
      })
    }
  }, [bulkUpdate, issueAlert, t])

  const deleteAllCallback = useCallback(async () => {
    try {
      const result = await bulkDelete({}).unwrap()
      issueAlert({
        severity: "success",
        message: t("notifications.cleared_all", {
          count: result.affected_count,
        }),
      })
    } catch (error) {
      issueAlert({
        severity: "error",
        message: t("notifications.clear_all_failed"),
      })
    }
  }, [bulkDelete, issueAlert, t])

  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage)
  }, [])

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPageSize(parseInt(event.target.value, 10))
      setPage(0)
    },
    [],
  )

  return (
    <>
      <IconButton sx={{ marginRight: 2 }} onClick={handleClick}>
        <Badge badgeContent={unreadCount} color={"primary"}>
          <NotificationsActiveRoundedIcon
            style={{ color: theme.palette.text.secondary }}
          />
        </Badge>
      </IconButton>
      <Popover
        open={notifOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        PaperProps={{
          variant: "outlined",
          sx: {
            borderRadius: 3,
            borderColor: theme.palette.outline.main,
            maxWidth: 400,
            width: "100%",
          },
        }}
      >
        <Box
          sx={{
            padding: 2,
            bgcolor: "secondary.main",
            color: "secondary.contrastText",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant={"h6"} sx={{ fontWeight: 600 }}>
            {t("notifications.notifications")}
          </Typography>
          <Box>
            <Tooltip title={t("notifications.clear_all")}>
              <IconButton onClick={deleteAllCallback}>
                <ClearAllRounded />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("notifications.mark_all_as_read")}>
              <IconButton onClick={markAllReadCallback}>
                <MarkEmailReadRounded />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Divider light />
        <Box>
          <List
            sx={{
              "&>:first-child": {
                borderTop: `1px solid ${theme.palette.outline.main}`,
              },
              "&>:last-child": {
                borderBottom: "none",
              },
              "& > *": {
                borderBottom: `1px solid ${theme.palette.outline.main}`,
              },
              padding: 0,
              maxHeight: 400,
              overflow: "scroll",
              minHeight: 20,
            }}
          >
            {(notifications || []).map((notification, idx) => (
              <NotificationEntry notif={notification} key={idx} />
            ))}
          </List>

          {total > 5 && (
            <TablePagination
              labelRowsPerPage={t("rows_per_page")}
              labelDisplayedRows={({ from, to, count }) =>
                t("displayed_rows", { from, to, count })
              }
              rowsPerPageOptions={[5, 10, 20]}
              component="div"
              count={total}
              rowsPerPage={pageSize}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              color={"primary"}
              nextIconButtonProps={{ color: "primary" }}
              backIconButtonProps={{ color: "primary" }}
              size="small"
            />
          )}
        </Box>
      </Popover>
    </>
  )
}
