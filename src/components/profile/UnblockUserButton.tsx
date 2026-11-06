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
import {
  useUnblockUser,
  useUnblockUserForOrg,
} from "../../features/profile/hooks/useBlocklistActions"

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
  const { unblock, isLoading: unblocking } = useUnblockUser()

  const handleUnblock = async () => {
    if (await unblock(user.username)) onSuccess()
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
  const { unblock, isLoading: unblockingForOrg } =
    useUnblockUserForOrg(spectrumId)

  const handleUnblock = async () => {
    if (await unblock(user.username)) onSuccess()
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
