import React from "react"
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  CircularProgress,
} from "@mui/material"
import { PersonAdd } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { User } from "../../datatypes/User"
import { useProfileUnblockUserMutation } from "../../features/profile/api/profileApi"
import { useUnblockUserForOrgMutation } from "../../features/contractor/api/contractorApi"
import { useAlertHook } from "../../hooks/alert/AlertHook"

interface UnblockUserButtonProps {
  user: User
  onSuccess: () => void
  disabled?: boolean
}

export function UnblockUserButton({
  user,
  onSuccess,
  disabled,
}: UnblockUserButtonProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const issueAlert = useAlertHook()

  const [unblockUser, { isLoading: unblocking }] =
    useProfileUnblockUserMutation()

  const handleUnblock = async () => {
    try {
      await unblockUser(user.username).unwrap()
      issueAlert({
        message: t("unblockUser.success", { username: user.username }),
        severity: "success",
      })
      onSuccess()
    } catch (error: unknown) {
      let errorMessage = t("unblockUser.error")

      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "object" && error !== null) {
        const err = error as Record<string, Record<string, string>>
        if (err.error?.message) {
          errorMessage = err.error.message
        } else if (err.data?.message) {
          errorMessage = err.data.message
        }
      }

      issueAlert({
        message: errorMessage,
        severity: "error",
      })
    }
  }

  return (
    <ListItemButton onClick={handleUnblock} disabled={disabled || unblocking}>
      <ListItemIcon
        sx={{
          transition: "0.3s",
          fontSize: "0.9em",
          color: theme.palette.primary.main,
        }}
      >
        {unblocking ? <CircularProgress size={16} /> : <PersonAdd />}
      </ListItemIcon>
      <ListItemText>
        <Box color={"text.secondary"} fontSize="0.9em">
          {t("unblockUser.button")}
        </Box>
      </ListItemText>
    </ListItemButton>
  )
}

interface UnblockUserForOrgButtonProps {
  user: User
  spectrumId: string
  onSuccess: () => void
  disabled?: boolean
}

export function UnblockUserForOrgButton({
  user,
  spectrumId,
  onSuccess,
  disabled,
}: UnblockUserForOrgButtonProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const issueAlert = useAlertHook()

  const [unblockUserForOrg, { isLoading: unblockingForOrg }] =
    useUnblockUserForOrgMutation()

  const handleUnblock = async () => {
    try {
      await unblockUserForOrg({
        spectrum_id: spectrumId,
        username: user.username,
      }).unwrap()
      issueAlert({
        message: t("unblockUser.success", { username: user.username }),
        severity: "success",
      })
      onSuccess()
    } catch (error: unknown) {
      let errorMessage = t("unblockUser.error")

      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "object" && error !== null) {
        const err = error as Record<string, Record<string, string>>
        if (err.error?.message) {
          errorMessage = err.error.message
        } else if (err.data?.message) {
          errorMessage = err.data.message
        }
      }

      issueAlert({
        message: errorMessage,
        severity: "error",
      })
    }
  }

  return (
    <ListItemButton
      onClick={handleUnblock}
      disabled={disabled || unblockingForOrg}
    >
      <ListItemIcon
        sx={{
          transition: "0.3s",
          fontSize: "0.9em",
          color: theme.palette.primary.main,
        }}
      >
        {unblockingForOrg ? <CircularProgress size={16} /> : <PersonAdd />}
      </ListItemIcon>
      <ListItemText>
        <Box color={"text.secondary"} fontSize="0.9em">
          {t("unblockUser.button")}
        </Box>
      </ListItemText>
    </ListItemButton>
  )
}
