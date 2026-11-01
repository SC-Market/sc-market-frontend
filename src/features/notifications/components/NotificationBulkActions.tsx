import React, { useState } from "react"
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
} from "@mui/material"
import { ClearAllRounded, MarkEmailReadRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { HapticDialog, HapticIconButton } from "../../../components/haptic"

/**
 * "Mark all as read" and "Clear all" as labelled icon buttons (the header
 * action style used across the site), with a confirmation before clearing
 * since it deletes every notification and can't be undone.
 */
export function NotificationBulkActions({
  onMarkAllRead,
  onClearAll,
  hasUnread,
  hasAny,
  color,
}: {
  onMarkAllRead: () => void
  onClearAll: () => void
  hasUnread: boolean
  hasAny: boolean
  /** Icon colour; defaults to inheriting the surrounding text colour. */
  color?: string
}) {
  const { t } = useTranslation()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const markLabel = t("notifications.mark_all_as_read", "Mark all as read")
  const clearLabel = t("notifications.clear_all", "Clear all notifications")

  return (
    <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
      <Tooltip title={markLabel}>
        {/* span: a Tooltip needs an enabled child to listen to */}
        <span>
          <HapticIconButton
            aria-label={markLabel}
            onClick={onMarkAllRead}
            disabled={!hasUnread}
            sx={{ color }}
          >
            <MarkEmailReadRounded />
          </HapticIconButton>
        </span>
      </Tooltip>
      <Tooltip title={clearLabel}>
        <span>
          <HapticIconButton
            aria-label={clearLabel}
            onClick={() => setConfirmOpen(true)}
            disabled={!hasAny}
            sx={{ color }}
          >
            <ClearAllRounded />
          </HapticIconButton>
        </span>
      </Tooltip>
      <HapticDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        aria-labelledby="clear-notifications-title"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle id="clear-notifications-title">
          {t("notifications.clear_all_confirm_title", "Clear all notifications?")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t(
              "notifications.clear_all_confirm_body",
              "This deletes every notification, read or not. It can't be undone.",
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="inherit">
            {t("common.cancel", "Cancel")}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              setConfirmOpen(false)
              onClearAll()
            }}
          >
            {t("notifications.clear_all_confirm", "Clear all")}
          </Button>
        </DialogActions>
      </HapticDialog>
    </Box>
  )
}
