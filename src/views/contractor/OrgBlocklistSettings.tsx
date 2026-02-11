import React, { useState } from "react"
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

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Autocomplete from '@mui/material/Autocomplete';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { MenuProps } from '@mui/material/Menu';
import ButtonGroup from '@mui/material/ButtonGroup';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import MuiLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Fade from '@mui/material/Fade';
import Skeleton from '@mui/material/Skeleton';
import { AutocompleteRenderInputParams } from '@mui/material/Autocomplete';
import Drawer from '@mui/material/Drawer';
import Rating from '@mui/material/Rating';
import useMediaQuery from '@mui/material/useMediaQuery';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import Google from '@mui/icons-material/Google';
import ReplyRounded from '@mui/icons-material/ReplyRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded';
import CopyAllRounded from '@mui/icons-material/CopyAllRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
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
