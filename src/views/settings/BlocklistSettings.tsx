import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  useProfileGetBlocklistQuery,
  useProfileUnblockUserMutation,
  useProfileBlockUserMutation,
} from "../../store/profile"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { BlocklistEntry } from "../../store/profile"
import { FlatSection } from "../../components/paper/Section"
import { UserSearch } from "../../components/search/UserSearch"
import { User } from "../../datatypes/User"
import { MinimalUser } from "../../datatypes/User"
import { Link } from "react-router-dom"
import { Discord } from "../../components/icon/DiscordIcon"

import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import useMediaQuery from '@mui/material/useMediaQuery';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import CircularProgress from '@mui/material/CircularProgress';
import Fab from '@mui/material/Fab';
import Popover from '@mui/material/Popover';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import CreateRounded from '@mui/icons-material/CreateRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
import StoreRounded from '@mui/icons-material/StoreRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import DescriptionRounded from '@mui/icons-material/DescriptionRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import ForumRounded from '@mui/icons-material/ForumRounded';
import DashboardRounded from '@mui/icons-material/DashboardRounded';
import BusinessRounded from '@mui/icons-material/BusinessRounded';
import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';
import ListAltRounded from '@mui/icons-material/ListAltRounded';
import WarehouseRounded from '@mui/icons-material/WarehouseRounded';
import DashboardCustomizeRounded from '@mui/icons-material/DashboardCustomizeRounded';
import AssignmentTurnedInRounded from '@mui/icons-material/AssignmentTurnedInRounded';
import Block from '@mui/icons-material/Block';
import PersonRemove from '@mui/icons-material/PersonRemove';

// Custom UserList for blocked users with unblock functionality
function BlockedUserList(props: {
  title?: string
  users: BlocklistEntry[]
  onUnblock: (username: string) => void
  unblocking: boolean
}) {
  const { t } = useTranslation()

  const format_discord = (u: MinimalUser) => {
    return `@${u.discord_profile?.username}${
      u.discord_profile?.discriminator && +u.discord_profile.discriminator
        ? `#${u.discord_profile.discriminator}`
        : ""
    }`
  }

  return (
    <List
      subheader={
        props.title ? (
          <Typography variant="h6" sx={{ mb: 2 }}>
            {props.title}
          </Typography>
        ) : null
      }
      sx={{ width: "100%" }}
    >
      {props.users.map((entry) => {
        if (!entry.blocked_user) return null

        const user = entry.blocked_user as MinimalUser

        return (
          <Box
            key={entry.id}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 1,
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              mb: 1,
            }}
          >
            <ListItemButton
              component={Link}
              to={`/user/${user.username}`}
              sx={{ flex: 1, borderRadius: 1 }}
            >
              <ListItemAvatar>
                <Avatar
                  variant={"rounded"}
                  src={user?.avatar}
                  alt={`Avatar of ${user.username}`}
                />
              </ListItemAvatar>
              <ListItemText>
                <Typography>{user.display_name || user.username}</Typography>
                <Typography
                  alignItems={"center"}
                  color={"secondary"}
                  display={"flex"}
                >
                  {user.discord_profile ? (
                    <>
                      <Discord />
                      &nbsp;{format_discord(user)}
                    </>
                  ) : null}
                </Typography>
              </ListItemText>
            </ListItemButton>
            <IconButton
              color="error"
              onClick={() => props.onUnblock(user.username)}
              disabled={props.unblocking}
              sx={{ ml: 1 }}
            >
              {props.unblocking ? (
                <CircularProgress size={20} />
              ) : (
                <PersonRemove />
              )}
            </IconButton>
          </Box>
        )
      })}
    </List>
  )
}

export function BlocklistSettings() {
  const { t } = useTranslation()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [reason, setReason] = useState("")
  const issueAlert = useAlertHook()

  const {
    data: blocklist = [],
    isLoading,
    refetch,
    error,
  } = useProfileGetBlocklistQuery()
  const [unblockUser, { isLoading: unblocking }] =
    useProfileUnblockUserMutation()
  const [blockUser, { isLoading: blocking }] = useProfileBlockUserMutation()

  const handleUnblock = async (username: string) => {
    try {
      await unblockUser(username).unwrap()
      issueAlert({
        message: t("unblockUser.success", { username }),
        severity: "success",
      })
      refetch()
    } catch (error: any) {
      let errorMessage = t("unblockUser.error")

      if (error?.error?.message) {
        errorMessage = error.error.message
      } else if (error?.data?.message) {
        errorMessage = error.data.message
      } else if (typeof error?.message === "string") {
        errorMessage = error.message
      }

      issueAlert({
        message: errorMessage,
        severity: "error",
      })
    }
  }

  const handleUserSelect = (user: User) => {
    setSelectedUser(user)
  }

  const handleBlockUser = async () => {
    if (!selectedUser) return

    try {
      await blockUser({
        username: selectedUser.username,
        reason: reason.trim() || undefined,
      }).unwrap()
      issueAlert({
        message: t("blockUser.success", { username: selectedUser.username }),
        severity: "success",
      })
      setSelectedUser(null)
      setReason("")
      refetch()
    } catch (error: any) {
      let errorMessage = t("blockUser.error")

      if (error?.error?.message) {
        errorMessage = error.error.message
      } else if (error?.data?.message) {
        errorMessage = error.data.message
      } else if (typeof error?.message === "string") {
        errorMessage = error.message
      }

      issueAlert({
        message: errorMessage,
        severity: "error",
      })
    }
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    console.error("Blocklist error:", error)
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Typography color="error">{t("blocklist.error")}</Typography>
      </Box>
    )
  }

  return (
    <FlatSection title={t("blocklist.title")}>
      <Grid item xs={12}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("blocklist.description")}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ mb: 3 }}>
          <UserSearch
            onUserSelect={handleUserSelect}
            placeholder={t("blocklist.searchPlaceholder")}
          />
        </Box>
      </Grid>

      {selectedUser && (
        <Grid item xs={12}>
          <Box
            sx={{
              mb: 2,
              p: 2,
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t("blocklist.selectedUser")}
            </Typography>
            <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
              <Avatar
                src={selectedUser.avatar}
                alt={selectedUser.display_name}
              />
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  {selectedUser.display_name || selectedUser.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  @{selectedUser.username}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" gap={2} alignItems="center">
              <Button
                variant="contained"
                color="error"
                startIcon={<Block />}
                onClick={handleBlockUser}
                disabled={blocking}
              >
                {blocking ? (
                  <CircularProgress size={20} />
                ) : (
                  t("blocklist.blockUser")
                )}
              </Button>
              <Button variant="outlined" onClick={() => setSelectedUser(null)}>
                {t("common.cancel")}
              </Button>
            </Box>
          </Box>
        </Grid>
      )}

      <Grid item xs={12}>
        {blocklist.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary">
              {t("blocklist.empty")}
            </Typography>
          </Box>
        ) : (
          <BlockedUserList
            title={t("blocklist.blockedUsers")}
            users={blocklist}
            onUnblock={handleUnblock}
            unblocking={unblocking}
          />
        )}
      </Grid>
    </FlatSection>
  )
}
