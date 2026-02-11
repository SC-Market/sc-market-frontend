import { useState, useCallback, useEffect } from "react"
import {
  useGetPushSubscriptionsQuery,
  useSubscribePushMutation,
} from "../api/pushApi"
import {
  subscribeToPush,
  isPushNotificationSupported,
  getPushPermissionStatus,
  getCurrentPushSubscription,
} from "../../../util/push-subscription"
import { VITE_VAPID_PUBLIC_KEY } from "../../../util/constants"

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

export function usePushSubscription() {
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { data: subscriptions } = useGetPushSubscriptionsQuery()
  const [subscribePush] = useSubscribePushMutation()

  // Check browser support
  const isSupported = isPushNotificationSupported()
  const permissionStatus = getPushPermissionStatus()
  const isPermissionGranted = permissionStatus === "granted"

  // Get VAPID public key from environment
  const vapidPublicKey = VITE_VAPID_PUBLIC_KEY
  const isConfigured = !!vapidPublicKey

  // Handle subscribe
  const handleSubscribe = useCallback(async () => {
    if (!vapidPublicKey) {
      setError("Push notifications are not configured. Please contact support.")
      return
    }

    setIsSubscribing(true)
    setError(null)
    setSuccess(null)

    try {
      await subscribeToPush(vapidPublicKey, async (subscriptionData) => {
        await subscribePush(subscriptionData).unwrap()
      })
      setSuccess("Successfully subscribed to push notifications!")
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to subscribe to push notifications"
      setError(errorMessage)
    } finally {
      setIsSubscribing(false)
    }
  }, [vapidPublicKey, subscribePush])

  return {
    subscriptions,
    isSubscribing,
    isSupported,
    permissionStatus,
    isPermissionGranted,
    isConfigured,
    error,
    success,
    setError,
    setSuccess,
    handleSubscribe,
  }
}
