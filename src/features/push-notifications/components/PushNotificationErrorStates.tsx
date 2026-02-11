import { FlatSection } from "../../../components/paper/Section"
import { usePWAInstallPrompt } from "../../../hooks/pwa/usePWAInstallPrompt"
import { useState } from "react"

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
import MaterialLink from '@mui/material/Link';
import Collapse from '@mui/material/Collapse';
import ListItem from '@mui/material/ListItem';
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
import UpdateRounded from '@mui/icons-material/UpdateRounded';
import GetAppRounded from '@mui/icons-material/GetAppRounded';

interface PushNotificationErrorStatesProps {
  isSupported: boolean
  isAndroid: boolean
  androidErrorMessage: string | null
  pwaInstalled: boolean
  requiresPWAInstall: boolean
  pwaInstallMessage: string
  isConfigured: boolean
}

export function PushNotificationErrorStates({
  isSupported,
  isAndroid,
  androidErrorMessage,
  pwaInstalled,
  requiresPWAInstall,
  pwaInstallMessage,
  isConfigured,
}: PushNotificationErrorStatesProps) {
  const { canInstall, triggerInstall } = usePWAInstallPrompt()
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!isSupported) {
    return (
      <FlatSection title="Push Notifications">
        <Alert severity="warning">
          Push notifications are not supported in this browser.
        </Alert>
      </FlatSection>
    )
  }

  if (isAndroid && androidErrorMessage) {
    return (
      <FlatSection title="Push Notifications">
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Android Push Notification Requirements
          </Typography>
          <Typography variant="body2">{androidErrorMessage}</Typography>
        </Alert>
        {!pwaInstalled && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Please install this app as a PWA to enable push notifications on
              Android.
            </Typography>
            {canInstall && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<GetAppRounded />}
                onClick={async () => {
                  const success = await triggerInstall()
                  if (success) {
                    setSuccess(
                      "App installed! You can now enable push notifications.",
                    )
                  } else {
                    setError(
                      "Installation was cancelled or failed. Please try again.",
                    )
                  }
                }}
              >
                Install App
              </Button>
            )}
          </Box>
        )}
      </FlatSection>
    )
  }

  if (!isConfigured) {
    return (
      <FlatSection title="Push Notifications">
        <Alert severity="warning" sx={{ mb: 2 }}>
          Push notifications are not configured on this server. Please contact
          support if you believe this is an error.
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Push notification functionality requires server configuration. The
          feature is currently disabled.
        </Typography>
      </FlatSection>
    )
  }

  if (requiresPWAInstall) {
    return (
      <FlatSection title="Push Notifications">
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Installation Required
          </Typography>
          <Typography variant="body2">{pwaInstallMessage}</Typography>
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Once installed, you can return here to enable push notifications.
          </Typography>
          {canInstall && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<GetAppRounded />}
              onClick={async () => {
                const success = await triggerInstall()
                if (success) {
                  setSuccess(
                    "App installed! You can now enable push notifications.",
                  )
                } else {
                  setError(
                    "Installation was cancelled or failed. Please try again.",
                  )
                }
              }}
              sx={{ mb: 2 }}
            >
              Install App
            </Button>
          )}
          {!pwaInstalled && (
            <Typography variant="body2" color="text.secondary">
              Current status: Not installed as PWA
            </Typography>
          )}
        </Box>
      </FlatSection>
    )
  }

  return null
}
