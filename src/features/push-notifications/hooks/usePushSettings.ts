import { useCallback, useState, useEffect } from "react"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import {
  useGetPushPreferencesQuery,
  useUpdatePushPreferenceMutation,
} from "../api/pushApi"
import type { PushPreference } from "../domain/types"
import type { EmailPreference } from "../../email/domain/types"

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

export function usePushSettings() {
  const issueAlert = useAlertHook()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const {
    data: preferences,
    isLoading: preferencesLoading,
    refetch: refetchPreferences,
  } = useGetPushPreferencesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })
  const [updatePreference] = useUpdatePushPreferenceMutation()

  // Handle preference update
  const handlePreferenceChange = useCallback(
    async (
      preference: PushPreference | { action: string },
      enabled: boolean,
      contractorId?: string | null,
    ) => {
      const action =
        (preference as PushPreference).action ||
        (preference as { action: string }).action
      try {
        await updatePreference({
          action,
          enabled,
          contractor_id: contractorId ?? null,
        }).unwrap()
        issueAlert({
          message: `Preference updated for ${action}`,
          severity: "success",
        })
      } catch (error) {
        issueAlert({
          message:
            error instanceof Error
              ? error.message
              : "Failed to update preference",
          severity: "error",
        })
      }
    },
    [updatePreference, issueAlert],
  )

  // Handle batch preference update
  const handleBatchPreferenceChange = useCallback(
    async (
      updates: Array<{
        preference: EmailPreference | PushPreference
        enabled: boolean
      }>,
      contractorId?: string | null,
    ) => {
      try {
        // Use contractor_id from preference if available, otherwise use parameter
        const pushPreferences = updates
          .map(({ preference, enabled }) => {
            const pushPref = preference as PushPreference & {
              contractor_id?: string | null
            }
            if (pushPref.action) {
              return {
                action: pushPref.action,
                enabled,
                contractor_id: pushPref.contractor_id ?? contractorId ?? null,
              }
            }
            return null
          })
          .filter((p): p is NonNullable<typeof p> => p !== null)

        if (pushPreferences.length > 0) {
          await updatePreference({
            preferences: pushPreferences,
          } as any).unwrap()
          issueAlert({
            message: `Updated ${pushPreferences.length} notification preference${pushPreferences.length !== 1 ? "s" : ""}`,
            severity: "success",
          })
        }
      } catch (error) {
        issueAlert({
          message:
            error instanceof Error
              ? error.message
              : "Failed to update preferences",
          severity: "error",
        })
      }
    },
    [updatePreference, issueAlert],
  )

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
    preferences,
    preferencesLoading,
    refetchPreferences,
    handlePreferenceChange,
    handleBatchPreferenceChange,
    error,
    success,
    setError,
    setSuccess,
  }
}
