import { Button, TextField, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { ResponsiveDialog } from "../../../components/dialog/ResponsiveDialog"
import { useFocusOnReveal } from "../../../hooks/accessibility/useFocusOnReveal"

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
  const focusOnReveal = useFocusOnReveal<HTMLInputElement>()
  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      title={t("settings.email.editEmailDialog.title")}
      actions={
        <>
          <Button onClick={onClose}>{t("accessibility.cancel")}</Button>
          <Button onClick={onSubmit} variant="contained" color="primary">
            {t("settings.email.editEmailDialog.update")}
          </Button>
        </>
      }
    >
      <TextField
        inputRef={focusOnReveal}
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
    </ResponsiveDialog>
  )
}
