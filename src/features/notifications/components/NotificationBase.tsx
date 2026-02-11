import { useTheme, ThemeProvider, createTheme } from "@mui/material/styles";
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { Link } from "react-router-dom"
import { Notification } from "../../../hooks/login/UserProfile"
import { getRelativeTime } from "../../../util/time"
import {
  useNotificationDeleteMutation,
  useNotificationUpdateMutation,
} from "../../../store/notification"
import { useTranslation } from "react-i18next"
import { useCallback, useMemo } from "react"
import { LongPressMenu } from "../../../components/gestures"

import Alert from '@mui/material/Alert';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import { responsiveFontSizes } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CarRentalRounded from '@mui/icons-material/CarRentalRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import MarkEmailReadRounded from '@mui/icons-material/MarkEmailReadRounded';
import MarkEmailUnreadRounded from '@mui/icons-material/MarkEmailUnreadRounded';
import ShareRounded from '@mui/icons-material/ShareRounded';

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
