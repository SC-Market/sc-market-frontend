import {
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import {
  CloseRounded,
  DeleteRounded,
  MarkEmailReadRounded,
  MarkEmailUnreadRounded,
  ShareRounded,
} from "@mui/icons-material"
import { Link } from "react-router-dom"
import { Notification } from "../../../hooks/login/UserProfile"
import { getRelativeTime } from "../../../util/time"
import {
  useNotificationDeleteMutation,
  useNotificationUpdateMutation,
} from "../api/notificationApi"
import { useTranslation } from "react-i18next"
import { useCallback, useMemo } from "react"
import { LongPressMenu } from "../../../components/gestures"

export function NotificationBase(props: {
  icon: React.ReactNode
  to?: string
  notif: Notification
  onClick?: () => void
  children: React.ReactNode
}) {
  const theme = useTheme<ExtendedTheme>()
  const { icon, to, notif, onClick } = props
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const { t } = useTranslation()

  const [updateNotification] = useNotificationUpdateMutation()
  const [deleteNotification] = useNotificationDeleteMutation()

  const defaultClick = useCallback(async () => {
    await updateNotification({
      notification_id: notif.notification_id,
      read: true,
    })
  }, [notif.notification_id, updateNotification])

  const longPressActions = useMemo(() => {
    const actions = []

    if (notif.read) {
      actions.push({
        label: t("notifications.markAsUnread", {
          defaultValue: "Mark as Unread",
        }),
        icon: <MarkEmailUnreadRounded />,
        onClick: async () => {
          await updateNotification({
            notification_id: notif.notification_id,
            read: false,
          })
        },
      })
    } else {
      actions.push({
        label: t("notifications.markAsRead", { defaultValue: "Mark as Read" }),
        icon: <MarkEmailReadRounded />,
        onClick: async () => {
          await updateNotification({
            notification_id: notif.notification_id,
            read: true,
          })
        },
      })
    }

    if (to) {
      actions.push({
        label: t("notifications.share", { defaultValue: "Share" }),
        icon: <ShareRounded />,
        onClick: () => {
          const url = `${window.location.origin}${to}`
          if (navigator.share) {
            navigator
              .share({
                title: t("notifications.notification", {
                  defaultValue: "Notification",
                }),
                text: t("notifications.shareNotification", {
                  defaultValue: "Check out this notification",
                }),
                url,
              })
              .catch(() => {})
          } else {
            navigator.clipboard.writeText(url)
          }
        },
      })
    }

    actions.push({
      label: t("notifications.delete", { defaultValue: "Delete" }),
      icon: <DeleteRounded />,
      onClick: () => {
        deleteNotification([notif.notification_id])
      },
      destructive: true,
    })

    return actions
  }, [notif, to, updateNotification, deleteNotification, t])

  const listItemButton = (
    <ListItemButton
      component={to ? Link : "div"}
      to={to}
      onClick={onClick || defaultClick}
      sx={{ position: "relative", minWidth: 0 }}
    >
      <ListItemIcon
        sx={{
          color: notif.read
            ? theme.palette.text.primary
            : theme.palette.primary.main,
          transition: "0.3s",
          fontSize: "0.9em",
          flexShrink: 0,
        }}
      >
        {icon}
      </ListItemIcon>
      <ListItemText
        sx={{
          color: "text.secondary",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        <Typography sx={{ wordBreak: "break-word", overflowWrap: "break-word" }}>
          {props.children}
        </Typography>
        <Typography variant={"subtitle2"} color={"text.primary"}>
          {getRelativeTime(new Date(notif.timestamp))}
        </Typography>
      </ListItemText>
      <NotificationDeleteButton notif={notif} />
    </ListItemButton>
  )

  if (isMobile && longPressActions.length > 0) {
    return (
      <LongPressMenu actions={longPressActions} enabled={isMobile}>
        {listItemButton}
      </LongPressMenu>
    )
  }

  return listItemButton
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
