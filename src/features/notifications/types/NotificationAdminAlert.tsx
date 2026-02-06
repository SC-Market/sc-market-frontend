import { Box, Typography } from "@mui/material"
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded"
import { Notification } from "../../../hooks/login/UserProfile"
import { useTranslation } from "react-i18next"
import { NotificationBase } from "../components/NotificationBase"
import { useNotificationUpdateMutation } from "../../../store/notification"
import { MarkdownRender } from "../../../components/markdown/Markdown"

export function NotificationAdminAlert(props: { notif: Notification }) {
  const { notif } = props
  const { t } = useTranslation()

  const [updateNotification] = useNotificationUpdateMutation()

  const alertEntity =
    notif.entity && typeof notif.entity === "object" && "title" in notif.entity
      ? (notif.entity as any)
      : null

  const handleClick = async () => {
    await updateNotification({
      notification_id: notif.notification_id,
      read: true,
    })

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
