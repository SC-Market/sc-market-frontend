import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
} from "@mui/material"
import { useTranslation } from "react-i18next"

interface EditEmailDialogProps {
  open: boolean
  email: string
  onClose: () => void
  onEmailChange: (email: string) => void
  onSubmit: () => void
}

export function EditEmailDialog({
  open,
  email,
  onClose,
  onEmailChange,
  onSubmit,
}: EditEmailDialogProps) {
  const { t } = useTranslation()
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("settings.email.editEmailDialog.title")}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label={t("settings.email.editEmailDialog.newEmailLabel")}
          type="email"
          fullWidth
          variant="outlined"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {t("settings.email.editEmailDialog.verificationNote")}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("accessibility.cancel")}</Button>
        <Button onClick={onSubmit} variant="contained" color="primary">
          {t("settings.email.editEmailDialog.update")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
