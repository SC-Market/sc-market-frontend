import { useTranslation } from "react-i18next"
import { ConfirmDialog } from "../dialog/ConfirmDialog"

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
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title={t("theme.resetConfirmTitle", "Reset Theme?")}
      message={t(
        "theme.resetConfirmMessage",
        "This will remove all custom theme settings and revert to the default theme. This action cannot be undone.",
      )}
      onConfirm={onConfirm}
      confirmLabel={t("theme.reset", "Reset to Default")}
      cancelLabel={t("common.cancel", "Cancel")}
      destructive
      loading={isResetting}
    />
  )
}
