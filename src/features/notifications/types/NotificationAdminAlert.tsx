import { Box, Typography } from "@mui/material"
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded"
import { Notification } from "../../../hooks/login/UserProfile"
import { useTranslation } from "react-i18next"
import { NotificationBase } from "../components/NotificationBase"
import { useNotificationUpdateMutation } from "../api/notificationApi"
import { MarkdownRender } from "../../../components/markdown/Markdown.lazy"

/** The admin alert a notification of entity_type admin_alerts points at. */
export interface AdminAlertNotice {
  alert_id: string
  title: string
  content?: string
  link?: string | null
}

/**
 * The alert's link if it is an absolute http(s) URL, else null. The server
 * only accepts those; this keeps a javascript: or data: link stored before
 * that check (or by any other path) from ever being opened.
 */
export function safeAlertLink(link: string | null | undefined): string | null {
  if (!link) return null
  try {
    const { protocol } = new URL(link)
    return protocol === "http:" || protocol === "https:" ? link : null
  } catch {
    return null
  }
}

export function NotificationAdminAlert(props: { notif: Notification }) {
  const { notif } = props
  const { t } = useTranslation()

  const [updateNotification] = useNotificationUpdateMutation()

  const alertEntity =
    notif.entity && typeof notif.entity === "object" && "title" in notif.entity
      ? (notif.entity as { title: string; content?: string; link?: string })
      : null
  const link = safeAlertLink(alertEntity?.link)

  const handleClick = async () => {
    await updateNotification({
      notification_id: notif.notification_id,
      read: true,
    })

    if (link) window.open(link, "_blank", "noopener,noreferrer")
  }

  return (
    <NotificationBase
      icon={<NotificationsActiveRoundedIcon />}
      notif={notif}
      onClick={link ? handleClick : undefined}
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
      {link && (
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
