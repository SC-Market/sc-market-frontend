import { useCallback, useState, useEffect } from "react"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import {
  useGetEmailPreferencesQuery,
  useUpdateEmailPreferencesMutation,
} from "../api/emailApi"
import type { EmailPreference } from "../domain/types"
import type { PushPreference } from "../../push-notifications/domain/types"

import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Breakpoint from '@mui/material/styles';
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
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import StorefrontRounded from '@mui/icons-material/StorefrontRounded';
import LinkRounded from '@mui/icons-material/LinkRounded';

export function useEmailSettings() {
  const issueAlert = useAlertHook()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const {
    data: preferences,
    isLoading: preferencesLoading,
    isError: preferencesError,
    refetch: refetchPreferences,
  } = useGetEmailPreferencesQuery(undefined, {
    // Refetch when component mounts to ensure fresh data after unsubscribe
    refetchOnMountOrArgChange: true,
  })
  const [updatePreferences] = useUpdateEmailPreferencesMutation()

  // Check if user has email and if it's verified
  const hasEmail = !!preferences?.email
  const emailVerified = preferences?.email?.email_verified ?? false
  const userEmail = preferences?.email?.email || null

  // Handle preference update or creation
  const handlePreferenceChange = useCallback(
    async (
      preference:
        | EmailPreference
        | { action_type_id: number; action_name?: string },
      enabled: boolean,
      contractorId?: string | null,
    ) => {
      try {
        await updatePreferences({
          preferences: [
            {
              action_type_id: preference.action_type_id,
              enabled,
              frequency:
                (preference as EmailPreference).frequency || "immediate",
              digest_time: (preference as EmailPreference).digest_time || null,
              contractor_id: contractorId ?? null,
            },
          ],
        }).unwrap()
        issueAlert({
          message: `Preference updated for ${preference.action_name || (preference as EmailPreference).action_name || "notification"}`,
          severity: "success",
        })
      } catch (error: any) {
        issueAlert({
          message:
            error?.data?.error?.message ||
            error?.message ||
            "Failed to update preference",
          severity: "error",
        })
      }
    },
    [updatePreferences, issueAlert],
  )

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
        const emailPreferences = updates
          .map(({ preference, enabled }) => {
            const emailPref = preference as EmailPreference
            if (emailPref.action_type_id) {
              return {
                action_type_id: emailPref.action_type_id,
                enabled,
                frequency: emailPref.frequency || "immediate",
                digest_time: emailPref.digest_time || null,
                contractor_id: emailPref.contractor_id ?? contractorId ?? null,
              }
            }
            return null
          })
          .filter((p): p is NonNullable<typeof p> => p !== null)

        if (emailPreferences.length > 0) {
          await updatePreferences({
            preferences: emailPreferences,
          }).unwrap()
          issueAlert({
            message: `Updated ${emailPreferences.length} notification preference${emailPreferences.length !== 1 ? "s" : ""}`,
            severity: "success",
          })
        }
      } catch (error: any) {
        issueAlert({
          message:
            error?.data?.error?.message ||
            error?.message ||
            "Failed to update preferences",
          severity: "error",
        })
      }
    },
    [updatePreferences, issueAlert],
  )

  return {
    preferences,
    preferencesLoading,
    preferencesError,
    refetchPreferences,
    hasEmail,
    emailVerified,
    userEmail,
    handlePreferenceChange,
    handleBatchPreferenceChange,
    error,
    success,
    setError,
    setSuccess,
  }
}
