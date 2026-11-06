import React from "react"
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  CircularProgress,
} from "@mui/material"
import { Person, Business } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { User } from "../../datatypes/User"
import {
  useBlockUser,
  useBlockUserForOrg,
} from "../../features/profile/hooks/useBlocklistActions"

interface BlockUserButtonProps {
  user: User
  myUsername: string
  onSuccess: () => void
  disabled?: boolean
}

export function BlockUserButton({
  user,
  myUsername,
  onSuccess,
  disabled,
}: BlockUserButtonProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const { block, isLoading: blocking } = useBlockUser()

  const handleBlock = async () => {
    if (await block(user.username)) onSuccess()
  }

  return (
    <ListItemButton onClick={handleBlock} disabled={disabled || blocking}>
      <ListItemIcon
        sx={{
          transition: "0.3s",
          fontSize: "0.9em",
          color: theme.palette.primary.main,
        }}
      >
        {blocking ? <CircularProgress size={16} /> : <Person />}
      </ListItemIcon>
      <ListItemText>
        <Box color={"text.secondary"} fontSize="0.9em">
          {t("userActions.blockPersonally", {
            username: user.display_name || user.username,
            myUsername: myUsername,
          })}
        </Box>
      </ListItemText>
    </ListItemButton>
  )
}

interface BlockUserForOrgButtonProps {
  user: User
  orgName: string
  spectrumId: string
  onSuccess: () => void
  disabled?: boolean
}

export function BlockUserForOrgButton({
  user,
  orgName,
  spectrumId,
  onSuccess,
  disabled,
}: BlockUserForOrgButtonProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const { block, isLoading: blockingForOrg } = useBlockUserForOrg(spectrumId)

  const handleBlock = async () => {
    if (await block(user.username)) onSuccess()
  }

  return (
    <ListItemButton onClick={handleBlock} disabled={disabled || blockingForOrg}>
      <ListItemIcon
        sx={{
          transition: "0.3s",
          fontSize: "0.9em",
          color: theme.palette.primary.main,
        }}
      >
        {blockingForOrg ? <CircularProgress size={16} /> : <Business />}
      </ListItemIcon>
      <ListItemText>
        <Box color={"text.secondary"} fontSize="0.9em">
          {t("userActions.blockForOrg", {
            username: user.display_name || user.username,
            orgName: orgName,
          })}
        </Box>
      </ListItemText>
    </ListItemButton>
  )
}
