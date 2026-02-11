import {
  getPushPermissionStatus,
  requestPushPermission,
} from "../../../util/push-subscription"
import { useState, useCallback } from "react"
import { useTranslation } from "react-i18next"

import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import Paper from '@mui/material/Paper';
import Fade from '@mui/material/Fade';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ButtonProps } from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MaterialLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { GridProps } from '@mui/material/Grid';
import ButtonGroup from '@mui/material/ButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { responsiveFontSizes } from '@mui/material/styles';
import ThemeOptions from '@mui/material/ThemeOptions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Chip from '@mui/material/Chip';
import CookieRounded from '@mui/icons-material/CookieRounded';
import ZoomIn from '@mui/icons-material/ZoomIn';
import ZoomOut from '@mui/icons-material/ZoomOut';
import FitScreen from '@mui/icons-material/FitScreen';
import Close from '@mui/icons-material/Close';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRounded from '@mui/icons-material/KeyboardArrowUpRounded';
import ReportIcon from '@mui/icons-material/Report';
import KeyboardArrowLeftRounded from '@mui/icons-material/KeyboardArrowLeftRounded';
import ShareRounded from '@mui/icons-material/ShareRounded';
import PlayArrow from '@mui/icons-material/PlayArrow';
import Map from '@mui/icons-material/Map';
import VideoLibrary from '@mui/icons-material/VideoLibrary';

export function PushNotificationStatus() {
  const { t } = useTranslation()
  const permissionStatus = getPushPermissionStatus()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleRequestPermission = useCallback(async () => {
    setError(null)
    try {
      const permission = await requestPushPermission()
      if (permission === "granted") {
        setSuccess(t("settings.pushNotifications.permissionGrantedMessage"))
      } else {
        setError(
          t("settings.pushNotifications.permissionDeniedError", {
            status: permission,
          }),
        )
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to request permission",
      )
    }
  }, [t])

  const isPermissionGranted = permissionStatus === "granted"
  const isPermissionDenied = permissionStatus === "denied"

  return (
    <Box sx={{ mb: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {t("settings.pushNotifications.permissionStatus")}:
      </Typography>
      <Chip
        label={
          permissionStatus === "granted"
            ? t("settings.pushNotifications.granted")
            : permissionStatus === "denied"
              ? t("settings.pushNotifications.denied")
              : t("settings.pushNotifications.notRequested")
        }
        color={
          permissionStatus === "granted"
            ? "success"
            : permissionStatus === "denied"
              ? "error"
              : "default"
        }
        size="small"
        sx={{ mr: 1 }}
      />
      {!isPermissionGranted && !isPermissionDenied && (
        <Button
          size="small"
          variant="outlined"
          onClick={handleRequestPermission}
        >
          {t("settings.pushNotifications.requestPermission")}
        </Button>
      )}
      {isPermissionDenied && (
        <Typography
          variant="caption"
          color="error"
          display="block"
          sx={{ mt: 1 }}
        >
          {t("settings.pushNotifications.permissionDeniedMessage")}
        </Typography>
      )}
    </Box>
  )
}
