import {
  Badge,
  Box,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material"
import { visuallyHidden } from "@mui/utils"
import { useIsMobile } from "../../../hooks/layout/useBreakpoint"
import {
  DeleteRounded,
  MarkEmailReadRounded,
  MarkEmailUnreadRounded,
  MoreVertRounded,
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
import React, { useCallback, useMemo, useState } from "react"
import {
  LongPressMenu,
  type LongPressMenuAction,
} from "../../../components/gestures"
import { HapticIconButton } from "../../../components/haptic"

/**
 * One notification row: the same row on every screen size and in every
 * list (the /notifications page, the bell popover, the dashboard feed).
 *
 * - MUI ListItem + ListItemButton, with the actions button in the
 *   `secondaryAction` slot so it isn't a button nested inside the link.
 * - Unread: the messages list's treatment (a primary dot Badge on the icon
 *   and a bolder title), plus a screen-reader "Unread:" prefix.
 * - Actions: a "more" menu with the same actions the long-press menu offers
 *   on touch screens (mark read/unread, share, delete).
 */
export function NotificationBase(props: {
  icon: React.ReactNode
  to?: string
  notif: Notification
  onClick?: () => void
  children: React.ReactNode
}) {
  const { icon, to, notif, onClick } = props
  const isMobile = useIsMobile()
  const { t } = useTranslation()
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)

  const [updateNotification] = useNotificationUpdateMutation()
  const [deleteNotification] = useNotificationDeleteMutation()

  const defaultClick = useCallback(async () => {
    await updateNotification({
      notification_id: notif.notification_id,
      read: true,
    })
  }, [notif.notification_id, updateNotification])

  const actions = useMemo(() => {
    const list: LongPressMenuAction[] = []

    list.push(
      notif.read
        ? {
            label: t("notifications.markAsUnread", "Mark as unread"),
            icon: <MarkEmailUnreadRounded />,
            onClick: () => {
              updateNotification({
                notification_id: notif.notification_id,
                read: false,
              })
            },
          }
        : {
            label: t("notifications.markAsRead", "Mark as read"),
            icon: <MarkEmailReadRounded />,
            onClick: () => {
              updateNotification({
                notification_id: notif.notification_id,
                read: true,
              })
            },
          },
    )

    if (to) {
      list.push({
        label: t("notifications.share", "Share"),
        icon: <ShareRounded />,
        onClick: () => {
          const url = `${window.location.origin}${to}`
          if (navigator.share) {
            navigator
              .share({
                title: t("notifications.notification", "Notification"),
                text: t(
                  "notifications.shareNotification",
                  "Check out this notification",
                ),
                url,
              })
              .catch(() => {})
          } else {
            navigator.clipboard?.writeText(url)
          }
        },
      })
    }

    list.push({
      label: t("notifications.delete", "Delete"),
      icon: <DeleteRounded />,
      onClick: () => {
        deleteNotification([notif.notification_id])
      },
      destructive: true,
    })

    return list
  }, [notif, to, updateNotification, deleteNotification, t])

  const menuId = `notif-actions-${notif.notification_id}`

  const actionsButton = (
    <HapticIconButton
      edge="end"
      size="small"
      aria-label={t("notifications.actions", "Notification actions")}
      aria-haspopup="menu"
      aria-controls={menuAnchor ? menuId : undefined}
      aria-expanded={menuAnchor ? "true" : undefined}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        setMenuAnchor(event.currentTarget)
      }}
      sx={{ color: "text.primary" }}
    >
      <MoreVertRounded fontSize="small" />
    </HapticIconButton>
  )

  return (
    <>
      {/* The long-press wrapper is the list's <li>; the row inside is a div
          so the list stays ul > li. */}
      <LongPressMenu actions={actions} enabled={isMobile} component="li">
        <ListItem
          component="div"
          disablePadding
          secondaryAction={actionsButton}
          sx={{
            "& .MuiListItemSecondaryAction-root": {
              top: { xs: 10, sm: 14 },
              transform: "none",
              right: { xs: 12, sm: 16 },
            },
          }}
        >
          <ListItemButton
            component={to ? Link : "div"}
            to={to}
            onClick={onClick || defaultClick}
            alignItems="flex-start"
            sx={{
              minWidth: 0,
              gap: { xs: 1.5, sm: 2 },
              py: { xs: 1.25, sm: 1.5 },
              pl: { xs: 1.5, sm: 2 },
              // room for the actions button
              pr: { xs: 6, sm: 7 },
              minHeight: { xs: 56, sm: 64 },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mt: 0.25,
                color: notif.read ? "text.primary" : "primary.main",
                transition: "color 0.3s",
              }}
            >
              <Badge
                variant="dot"
                color="primary"
                invisible={notif.read}
                overlap="circular"
              >
                {icon}
              </Badge>
            </ListItemIcon>
            <ListItemText
              disableTypography
              sx={{ my: 0, overflow: "hidden", minWidth: 0 }}
            >
              <Typography
                component="div"
                color="text.secondary"
                sx={{
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                  fontWeight: notif.read ? 400 : 600,
                }}
              >
                {!notif.read && (
                  <Box component="span" sx={visuallyHidden}>
                    {t("notifications.unread", "Unread")}:{" "}
                  </Box>
                )}
                {props.children}
              </Typography>
              <Typography
                variant="body2"
                color="text.primary"
                component="div"
                sx={{ mt: 0.5 }}
              >
                {getRelativeTime(new Date(notif.timestamp))}
              </Typography>
            </ListItemText>
          </ListItemButton>
        </ListItem>
      </LongPressMenu>
      <Menu
        id={menuId}
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {actions.flatMap((action, index) => {
          const item = (
            <MenuItem
              key={action.label}
              onClick={() => {
                setMenuAnchor(null)
                action.onClick()
              }}
              sx={action.destructive ? { color: "error.main" } : undefined}
            >
              <ListItemIcon
                sx={action.destructive ? { color: "error.main" } : undefined}
              >
                {action.icon}
              </ListItemIcon>
              <ListItemText>{action.label}</ListItemText>
            </MenuItem>
          )
          // a divider before the destructive action, as in LongPressMenu
          return action.destructive && index > 0
            ? [<Divider key={`${action.label}-divider`} />, item]
            : [item]
        })}
      </Menu>
    </>
  )
}
