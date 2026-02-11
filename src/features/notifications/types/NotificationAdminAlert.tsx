import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded"
import { Notification } from "../../../hooks/login/UserProfile"
import { useTranslation } from "react-i18next"
import { NotificationBase } from "../components/NotificationBase"
import { useNotificationUpdateMutation } from "../../../store/notification"
import { MarkdownRender } from "../../../components/markdown/Markdown"

import Alert from '@mui/material/Alert';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { responsiveFontSizes } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Fab from '@mui/material/Fab';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Modal from '@mui/material/Modal';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import { useTheme } from '@mui/material/styles';
import CarRentalRounded from '@mui/icons-material/CarRentalRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import MarkEmailReadRounded from '@mui/icons-material/MarkEmailReadRounded';
import MarkEmailUnreadRounded from '@mui/icons-material/MarkEmailUnreadRounded';
import ShareRounded from '@mui/icons-material/ShareRounded';
import AddAPhotoRounded from '@mui/icons-material/AddAPhotoRounded';
import SaveRounded from '@mui/icons-material/SaveRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import StorefrontRounded from '@mui/icons-material/StorefrontRounded';

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
