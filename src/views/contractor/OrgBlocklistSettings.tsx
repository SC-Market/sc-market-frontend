import React, { useState } from "react"
import {
  Box,
  Button,
  Grid,
  IconButton,
  Typography,
  CircularProgress,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Avatar,
} from "@mui/material"
import { Block, PersonRemove } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import {
  useGetOrgBlocklistQuery,
  useUnblockUserForOrgMutation,
  useBlockUserForOrgMutation,
} from "../../store/contractor"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { BlocklistEntry } from "../../store/profile"
import { FlatSection } from "../../components/paper/Section"
import { UserSearch } from "../../components/search/UserSearch"
import { User } from "../../datatypes/User"
import { MinimalUser } from "../../datatypes/User"
import { Link } from "react-router-dom"
import { Discord } from "../../components/icon/DiscordIcon"

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

export function OrgBlocklistSettings() {
  const { t } = useTranslation()
  const [contractor] = useCurrentOrg()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [reason, setReason] = useState("")
  const issueAlert = useAlertHook()

  const {
    data: blocklist = [],
    isLoading,
    refetch,
    error,
  } = useGetOrgBlocklistQuery(contractor?.spectrum_id || "")
  const [unblockUser, { isLoading: unblocking }] =
    useUnblockUserForOrgMutation()
  const [blockUser, { isLoading: blocking }] = useBlockUserForOrgMutation()

  const handleUnblock = async (username: string) => {
    if (!contractor) return

    try {
      await unblockUser({
        spectrum_id: contractor.spectrum_id,
        username,
      }).unwrap()
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
    if (!selectedUser || !contractor) return

    try {
      await blockUser({
        spectrum_id: contractor.spectrum_id,
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
    console.error("Org blocklist error:", error)
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Typography color="error">{t("orgBlocklist.error")}</Typography>
      </Box>
    )
  }

  return (
    <FlatSection title={t("orgBlocklist.title")}>
      <Grid item xs={12}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("orgBlocklist.description")}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ mb: 3 }}>
          <UserSearch
            onUserSelect={handleUserSelect}
            placeholder={t("orgBlocklist.searchPlaceholder")}
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
              {t("orgBlocklist.selectedUser")}
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
                  t("orgBlocklist.blockUser")
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
              {t("orgBlocklist.empty")}
            </Typography>
          </Box>
        ) : (
          <BlockedUserList
            title={t("orgBlocklist.blockedUsers")}
            users={blocklist}
            onUnblock={handleUnblock}
            unblocking={unblocking}
          />
        )}
      </Grid>
    </FlatSection>
  )
}
