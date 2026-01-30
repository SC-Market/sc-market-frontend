import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material"
import { useTranslation } from "react-i18next"

interface DeleteEmailDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteEmailDialog({
  open,
  onClose,
  onConfirm,
}: DeleteEmailDialogProps) {
  const { t } = useTranslation()
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("settings.email.deleteEmailDialog.title")}</DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          {t("settings.email.deleteEmailDialog.description")}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          {t("settings.email.deleteEmailDialog.cancel")}
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error">
          {t("settings.email.deleteEmailDialog.confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
