import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material"
import { useTranslation } from "react-i18next"

/** "Reset Theme?" confirmation. */
export function ResetThemeDialog({
  open,
  onClose,
  onConfirm,
  isResetting,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isResetting: boolean
}) {
  const { t } = useTranslation()
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t("theme.resetConfirmTitle", "Reset Theme?")}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t(
            "theme.resetConfirmMessage",
            "This will remove all custom theme settings and revert to the default theme. This action cannot be undone.",
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.cancel", "Cancel")}</Button>
        <Button onClick={onConfirm} color="error" disabled={isResetting}>
          {t("theme.reset", "Reset to Default")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
