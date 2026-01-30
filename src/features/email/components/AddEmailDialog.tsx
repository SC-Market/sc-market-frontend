import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material"
import { useTranslation } from "react-i18next"

interface AddEmailDialogProps {
  open: boolean
  email: string
  selectedNotificationTypes: number[]
  availableNotificationTypes: Array<{
    id: number
    name: string
    description?: string
  }>
  onClose: () => void
  onEmailChange: (email: string) => void
  onNotificationTypeToggle: (typeId: number) => void
  onSubmit: () => void
}

export function AddEmailDialog({
  open,
  email,
  selectedNotificationTypes,
  availableNotificationTypes,
  onClose,
  onEmailChange,
  onNotificationTypeToggle,
  onSubmit,
}: AddEmailDialogProps) {
  const { t } = useTranslation()
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("settings.email.addEmailDialog.title")}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label={t("settings.email.emailAddress")}
          type="email"
          fullWidth
          variant="outlined"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {t("settings.email.addEmailDialog.selectNotificationTypes")}
        </Typography>
        <FormGroup>
          {availableNotificationTypes.map((type) => (
            <FormControlLabel
              key={type.id}
              control={
                <Checkbox
                  checked={selectedNotificationTypes.includes(type.id)}
                  onChange={() => onNotificationTypeToggle(type.id)}
                />
              }
              label={type.name}
            />
          ))}
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("accessibility.cancel")}</Button>
        <Button onClick={onSubmit} variant="contained" color="primary">
          {t("settings.email.addEmailDialog.add")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
