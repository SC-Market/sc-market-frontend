import React, { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Alert,
  Stack,
  CircularProgress,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import {
  useAccountDeletionPrecheckQuery,
  useAccountRequestDeletionMutation,
} from "../../profile/api/profileApi"
import { useLogoutMutation } from "../../profile/api/profileApi"

interface DeleteAccountDialogProps {
  open: boolean
  onClose: () => void
}

export function DeleteAccountDialog({ open, onClose }: DeleteAccountDialogProps) {
  const { t } = useTranslation()
  const [reason, setReason] = useState("")
  const [confirmText, setConfirmText] = useState("")

  const { data: precheck, isLoading: precheckLoading } =
    useAccountDeletionPrecheckQuery(undefined, { skip: !open })
  const [requestDeletion, { isLoading: deleting }] =
    useAccountRequestDeletionMutation()
  const [logout] = useLogoutMutation()

  const canConfirm = confirmText === "DELETE" && precheck?.canDelete && !deleting

  const handleDelete = async () => {
    try {
      await requestDeletion({ reason: reason || undefined }).unwrap()
      await logout().unwrap().catch(() => {})
      window.location.href = "/"
    } catch {
      // Error is shown via RTK Query state
    }
  }

  const handleClose = () => {
    setReason("")
    setConfirmText("")
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle color="error">
        {t("account_deletion.dialog_title", {
          defaultValue: "Delete Account",
        })}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Alert severity="warning">
            {t("account_deletion.warning", {
              defaultValue:
                "This will schedule your account for permanent deletion in 30 days. During this period you can log back in and cancel the deletion.",
            })}
          </Alert>

          <Typography variant="body2">
            {t("account_deletion.what_happens", {
              defaultValue:
                "After 30 days, your personal data will be permanently erased. Your orders, reviews, and messages will remain visible to other users as 'Deleted User'. Active listings and buy orders will be cancelled immediately.",
            })}
          </Typography>

          {precheckLoading && <CircularProgress size={24} />}

          {precheck && !precheck.canDelete && (
            <Alert severity="error">
              {t("account_deletion.blockers_title", {
                defaultValue:
                  "You cannot delete your account until these issues are resolved:",
              })}
              <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>
                {precheck.blockers.map((blocker, i) => (
                  <li key={i}>
                    <Typography variant="body2">{blocker.detail}</Typography>
                  </li>
                ))}
              </ul>
            </Alert>
          )}

          {precheck?.canDelete && (
            <>
              <TextField
                label={t("account_deletion.reason_label", {
                  defaultValue: "Reason for leaving (optional)",
                })}
                multiline
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                fullWidth
                size="small"
              />

              <TextField
                label={t("account_deletion.confirm_label", {
                  defaultValue: 'Type "DELETE" to confirm',
                })}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                fullWidth
                size="small"
                error={confirmText.length > 0 && confirmText !== "DELETE"}
              />
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          {t("common.cancel", { defaultValue: "Cancel" })}
        </Button>
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          disabled={!canConfirm}
        >
          {deleting ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            t("account_deletion.confirm_button", {
              defaultValue: "Delete My Account",
            })
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
