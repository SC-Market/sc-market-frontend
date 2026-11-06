import { useTranslation } from "react-i18next"
import { ConfirmDialog } from "../../../components/dialog/ConfirmDialog"

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
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      maxWidth="sm"
      title={t("settings.email.deleteEmailDialog.title")}
      message={t("settings.email.deleteEmailDialog.description")}
      cancelLabel={t("settings.email.deleteEmailDialog.cancel")}
      confirmLabel={t("settings.email.deleteEmailDialog.confirm")}
      destructive
    />
  )
}
