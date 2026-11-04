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
import { useGetShopBlocklistQuery } from "../../../store/api/v2/market"
import { FormPaper } from "../../../components/paper/FormPaper"
import { UserSearch } from "../../../components/search/UserSearch"
import { Link } from "react-router-dom"
import type { User } from "../../../datatypes/User"
import { USER_PATHS } from "../../../routes/paths"
import { useTranslation } from "react-i18next"
import { useShopBlocklist } from "../hooks/useShopActions"

export function ShopBlocklistSection({ shopId }: { shopId: string }) {
  const { t } = useTranslation()

  const { data: blocklist = [] } = useGetShopBlocklistQuery({ shopId })
  const { block, unblock: handleUnblock } = useShopBlocklist(shopId)

  const [selectedUser, setSelectedUser] = useState<{ username: string } | null>(
    null,
  )
  const [reason, setReason] = useState("")

  const handleBlock = async () => {
    if (!selectedUser) return
    if (await block(selectedUser.username, reason)) {
      setSelectedUser(null)
      setReason("")
    }
  }

  return (
    <FormPaper
      title={t("shops.blocklist.title")}
      subtitle={t("shops.blocklist.subtitle")}
    >
      <Grid item xs={12} sm={8}>
        <UserSearch
          onUserSelect={(user: User) =>
            setSelectedUser({ username: user.username })
          }
          placeholder={t("shops.blocklist.searchPlaceholder")}
        />
      </Grid>
      {selectedUser && (
        <>
          <Grid item xs={12}>
            <TextField
              label={t("shops.blocklist.reason")}
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
              {t("shops.blocklist.block", { username: selectedUser.username })}
            </Button>
          </Grid>
        </>
      )}
      {blocklist.length > 0 && (
        <Grid item xs={12}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ mt: 1, mb: 0.5 }}
          >
            {t("shops.blocklist.blockedCount", { count: blocklist.length })}
          </Typography>
          <List disablePadding dense>
            {blocklist.map((entry) => (
              <ListItemButton
                key={entry.id}
                component={Link}
                to={USER_PATHS.profile(entry.username)}
                dense
                sx={{ borderRadius: 1 }}
              >
                <ListItemAvatar>
                  <Avatar
                    src={entry.avatar || undefined}
                    sx={{ width: 28, height: 28 }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={entry.display_name || entry.username}
                  secondary={entry.reason || undefined}
                />
                <IconButton
                  edge="end"
                  size="small"
                  color="error"
                  aria-label={t("shops.blocklist.unblockLabel", {
                    name: entry.display_name || entry.username,
                  })}
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
