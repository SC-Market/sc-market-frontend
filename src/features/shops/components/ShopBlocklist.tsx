import React, { useState } from "react"
import {
  Avatar,
  Button,
  Grid,
  IconButton,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material"
import { Block, PersonRemove } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import {
  useGetShopBlocklistQuery,
  useBlockUserFromShopMutation,
  useUnblockUserFromShopMutation,
} from "../../../store/api/v2/market"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { useShopRouteContext } from "../../../components/router/ShopContextFromRoute"
import { FormPaper } from "../../../components/paper/FormPaper"
import { UserSearch } from "../../../components/search/UserSearch"
import { Link } from "react-router-dom"
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout"
import type { User } from "../../../datatypes/User"

export function ShopBlocklist() {
  const { shop } = useShopRouteContext()
  const { t } = useTranslation()
  const issueAlert = useAlertHook()

  const { data: blocklist = [] } = useGetShopBlocklistQuery({ shopId: shop.shop_id })
  const [blockUser] = useBlockUserFromShopMutation()
  const [unblockUser] = useUnblockUserFromShopMutation()

  const [selectedUser, setSelectedUser] = useState<{ username: string } | null>(null)
  const [reason, setReason] = useState("")

  const handleBlock = async () => {
    if (!selectedUser) return
    try {
      await blockUser({
        shopId: shop.shop_id,
        blockUserRequest: { username: selectedUser.username, reason },
      }).unwrap()
      issueAlert({ severity: "success", message: `Blocked ${selectedUser.username}` })
      setSelectedUser(null)
      setReason("")
    } catch (err: unknown) {
      issueAlert({ severity: "error", message: String((err as { data?: { message?: string } })?.data?.message || "Failed to block user") })
    }
  }

  const handleUnblock = async (userId: string, username: string) => {
    try {
      await unblockUser({ shopId: shop.shop_id, blockedUserId: userId }).unwrap()
      issueAlert({ severity: "success", message: `Unblocked ${username}` })
    } catch (err: unknown) {
      issueAlert({ severity: "error", message: String((err as { data?: { message?: string } })?.data?.message || "Failed to unblock user") })
    }
  }

  return (
    <StandardPageLayout
      title="Blocklist"
      headerTitle="Blocklist"
      sidebarOpen={true}
      maxWidth="md"
    >
      <Grid item xs={12}>
        <FormPaper
          title="Block a User"
          subtitle="Blocked users cannot place orders or offers at this shop"
        >
          <Grid item xs={12} sm={8}>
            <UserSearch
              onUserSelect={(user: User) => setSelectedUser({ username: user.username })}
              placeholder="Search user to block"
            />
          </Grid>
          {selectedUser && (
            <>
              <Grid item xs={12}>
                <TextField
                  label="Reason (optional)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<Block />}
                  onClick={handleBlock}
                >
                  Block {selectedUser.username}
                </Button>
              </Grid>
            </>
          )}
        </FormPaper>
      </Grid>

      <Grid item xs={12}>
        <FormPaper title="Blocked Users" subtitle={`${blocklist.length} user${blocklist.length !== 1 ? "s" : ""} blocked`}>
          {blocklist.length === 0 ? (
            <Grid item xs={12}>
              <Typography color="text.secondary" variant="body2">
                No users are blocked from this shop.
              </Typography>
            </Grid>
          ) : (
            <Grid item xs={12}>
              <List disablePadding>
                {blocklist.map((entry) => (
                  <ListItemButton
                    key={entry.id}
                    component={Link}
                    to={`/user/${entry.username}`}
                    sx={{ borderRadius: 1 }}
                  >
                    <ListItemAvatar>
                      <Avatar src={entry.avatar || undefined} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={entry.display_name || entry.username}
                      secondary={entry.reason || "No reason given"}
                    />
                    <IconButton
                      edge="end"
                      color="error"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleUnblock(entry.user_id, entry.username)
                      }}
                    >
                      <PersonRemove />
                    </IconButton>
                  </ListItemButton>
                ))}
              </List>
            </Grid>
          )}
        </FormPaper>
      </Grid>
    </StandardPageLayout>
  )
}
