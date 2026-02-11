import { useCallback, useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import {
  useAddEmailMutation,
  useUpdateEmailMutation,
  useDeleteEmailMutation,
  useRequestVerificationMutation,
} from "../api/emailApi"

import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Breakpoint } from '@mui/material/styles';
import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import MaterialLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import StorefrontRounded from '@mui/icons-material/StorefrontRounded';
import LinkRounded from '@mui/icons-material/LinkRounded';

export function useEmailActions() {
  const { t } = useTranslation()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState<number>(0)

  const [addEmail] = useAddEmailMutation()
  const [updateEmail] = useUpdateEmailMutation()
  const [deleteEmail] = useDeleteEmailMutation()
  const [requestVerification] = useRequestVerificationMutation()

  // Handle add email
  const handleAddEmail = useCallback(
    async (email: string, notificationTypeIds: number[]) => {
      if (!email || !email.includes("@")) {
        setError(t("settings.email.invalidEmail"))
        return { success: false }
      }

      setError(null)
      setSuccess(null)

      try {
        const result = await addEmail({
          email,
          notificationTypeIds,
        }).unwrap()

        setSuccess(result.message || t("settings.email.addSuccess"))
        return { success: true, result }
      } catch (error: any) {
        setError(
          error?.data?.error?.message ||
            error?.message ||
            t("settings.email.addError"),
        )
        return { success: false, error }
      }
    },
    [addEmail, t],
  )

  // Handle update email
  const handleUpdateEmail = useCallback(
    async (email: string) => {
      if (!email || !email.includes("@")) {
        setError(t("settings.email.invalidEmail"))
        return { success: false }
      }

      setError(null)
      setSuccess(null)

      try {
        const result = await updateEmail({ email }).unwrap()
        setSuccess(result.message || t("settings.email.updateSuccess"))
        return { success: true, result }
      } catch (error: any) {
        setError(
          error?.data?.error?.message ||
            error?.message ||
            t("settings.email.updateError"),
        )
        return { success: false, error }
      }
    },
    [updateEmail, t],
  )

  // Handle delete email
  const handleDeleteEmail = useCallback(async () => {
    setError(null)
    setSuccess(null)

    try {
      const result = await deleteEmail().unwrap()
      setSuccess(result.message || t("settings.email.deleteSuccess"))
      return { success: true, result }
    } catch (error: any) {
      setError(
        error?.data?.error?.message ||
          error?.message ||
          t("settings.email.deleteError"),
      )
      return { success: false, error }
    }
  }, [deleteEmail, t])

  // Handle request verification with cooldown
  const handleRequestVerification = useCallback(async () => {
    if (resendCooldown > 0) {
      return { success: false } // Still in cooldown
    }

    setError(null)
    setSuccess(null)

    // Set cooldown to 60 seconds
    setResendCooldown(60)

    try {
      const result = await requestVerification().unwrap()
      setSuccess(result.message || t("settings.email.verificationSent"))
      return { success: true, result }
    } catch (error: any) {
      setError(
        error?.data?.error?.message ||
          error?.message ||
          t("settings.email.verificationError"),
      )
      // Reset cooldown on error so user can retry
      setResendCooldown(0)
      return { success: false, error }
    }
  }, [requestVerification, resendCooldown, t])

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [resendCooldown])

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  return {
    handleAddEmail,
    handleUpdateEmail,
    handleDeleteEmail,
    handleRequestVerification,
    resendCooldown,
    error,
    success,
    setError,
    setSuccess,
  }
}
