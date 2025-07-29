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
  Tooltip,
  Typography,
} from "@mui/material"
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded"
import React, { useCallback, useMemo, useState } from "react"
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
  MarkEmailReadRounded,
  UpdateRounded,
} from "@mui/icons-material"
import {
  useGetNotificationsQuery,
  useNotificationDeleteMutation,
  useNotificationUpdateMutation,
} from "../../store/notification"
import { MarketBid } from "../../datatypes/MarketListing"
import { useMarketGetListingByIDQuery } from "../../store/market"
import { OfferSession } from "../../store/offer"
import { useTranslation } from "react-i18next"

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
    await updateNotification([
      { notification_id: notif.notification_id, read: true },
    ])
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
        }}
      >
        <Typography>{props.children}</Typography>
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
  const { t } = useTranslation() // ✅ додано

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
  const { t } = useTranslation() // ✅ додано

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

  const [
    acceptInvite,
  ] = useAcceptContractorInviteMutation()
  const [
    declineInvite,
  ] = useDeclineContractorInviteMutation()

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
        {t("notifications.contractor_invite_from")}{" "}
        <Link
          to={`/contractor/${invite.spectrum_id}`}
          style={{
            textDecoration: "none",
            color: theme.palette.secondary.main,
          }}
        >
          <UnderlineLink>{invite.spectrum_id}</UnderlineLink>
        </Link>
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
  const { data: listing } = useMarketGetListingByIDQuery(bid.listing_id)
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

export function NotificationsButton() {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  const notifOpen = Boolean(anchorEl)
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()

  const { data: notifications } = useGetNotificationsQuery(undefined, {
    pollingInterval: 60000,
  })

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const [updateNotifications] = useNotificationUpdateMutation()
  const [deleteNotifications] = useNotificationDeleteMutation()

  const markAllReadCallback = useCallback(async () => {
    if (notifications) {
      await updateNotifications(
        notifications.map((notif) => ({
          notification_id: notif.notification_id,
          read: true,
        })),
      )
    }
  }, [notifications, updateNotifications])

  const deleteAllCallback = useCallback(async () => {
    if (notifications) {
      await deleteNotifications(
        notifications.map((notif) => notif.notification_id),
      )
    }
  }, [deleteNotifications, notifications])

  return (
    <>
      <IconButton sx={{ marginRight: 2 }} onClick={handleClick}>
        <Badge
          badgeContent={(notifications || []).filter((n) => !n.read).length}
          color={"primary"}
        >
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
          <Typography variant={"h6"} fontWeight={600}>
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
        </Box>
      </Popover>
    </>
  )
}
