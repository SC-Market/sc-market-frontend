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
import {
  useGetShopBlocklistQuery,
  useBlockUserFromShopMutation,
  useUnblockUserFromShopMutation,
} from "../../../store/api/v2/market"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { FormPaper } from "../../../components/paper/FormPaper"
import { UserSearch } from "../../../components/search/UserSearch"
import { Link } from "react-router-dom"
import type { User } from "../../../datatypes/User"

export function ShopBlocklistSection({ shopId }: { shopId: string }) {
  const issueAlert = useAlertHook()

  const { data: blocklist = [] } = useGetShopBlocklistQuery({ shopId })
  const [blockUser] = useBlockUserFromShopMutation()
  const [unblockUser] = useUnblockUserFromShopMutation()

  const [selectedUser, setSelectedUser] = useState<{ username: string } | null>(null)
  const [reason, setReason] = useState("")

  const handleBlock = async () => {
    if (!selectedUser) return
    try {
      await blockUser({
        shopId,
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
      await unblockUser({ shopId, blockedUserId: userId }).unwrap()
      issueAlert({ severity: "success", message: `Unblocked ${username}` })
    } catch (err: unknown) {
      issueAlert({ severity: "error", message: String((err as { data?: { message?: string } })?.data?.message || "Failed to unblock user") })
    }
  }

  return (
    <FormPaper
      title="Blocklist"
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
      {blocklist.length > 0 && (
        <Grid item xs={12}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1, mb: 0.5 }}>
            {blocklist.length} blocked user{blocklist.length !== 1 ? "s" : ""}
          </Typography>
          <List disablePadding dense>
            {blocklist.map((entry) => (
              <ListItemButton
                key={entry.id}
                component={Link}
                to={`/user/${entry.username}`}
                dense
                sx={{ borderRadius: 1 }}
              >
                <ListItemAvatar>
                  <Avatar src={entry.avatar || undefined} sx={{ width: 28, height: 28 }} />
                </ListItemAvatar>
                <ListItemText
                  primary={entry.display_name || entry.username}
                  secondary={entry.reason || undefined}
                />
                <IconButton
                  edge="end"
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleUnblock(entry.user_id, entry.username)
                  }}
                >
                  <PersonRemove fontSize="small" />
                </IconButton>
              </ListItemButton>
            ))}
          </List>
        </Grid>
      )}
    </FormPaper>
  )
}
