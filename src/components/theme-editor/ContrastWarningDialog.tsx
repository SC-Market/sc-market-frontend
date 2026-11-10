import { useMemo, useState } from "react"
import { Box, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { ConfirmDialog } from "../dialog/ConfirmDialog"
import { failingContrastChecks } from "./contrastChecks"
import type { ThemeModeData } from "./themeEditorFields"

/**
 * Save through the contrast check: straight away when every pair passes in
 * both modes, else after ContrastWarningDialog's "Save anyway".
 */
export function useContrastGuardedSave(
  themeData: { light: ThemeModeData; dark: ThemeModeData },
  save: () => Promise<void>,
) {
  const [open, setOpen] = useState(false)
  const failing = useMemo(() => failingContrastChecks(themeData), [themeData])
  return {
    requestSave: () => {
      if (failing.length > 0) setOpen(true)
      else void save()
    },
    dialog: {
      open,
      failing,
      onClose: () => setOpen(false),
      onSaveAnyway: () => {
        setOpen(false)
        void save()
      },
    },
  }
}

/**
 * Asked before saving a theme with failing contrast: which pairs fail, in
 * which mode. Saving stays possible (the org decides).
 */
export function ContrastWarningDialog({
  open,
  failing,
  onClose,
  onSaveAnyway,
}: {
  open: boolean
  failing: ReturnType<typeof failingContrastChecks>
  onClose: () => void
  onSaveAnyway: () => void
}) {
  const { t } = useTranslation()
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title={t("theme.contrastWarnTitle", "Some colours fail WCAG AA")}
      message={t(
        "theme.contrastWarnMessage",
        "These pairs are below the minimum contrast, so some visitors will struggle to read them. Auto-fix offers the nearest colour that passes. You can still save.",
      )}
      onConfirm={onSaveAnyway}
      confirmLabel={t("theme.contrastSaveAnyway", "Save anyway")}
      cancelLabel={t("theme.contrastKeepEditing", "Keep editing")}
      confirmColor="warning"
      maxWidth="sm"
    >
      <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
        {failing.map(({ mode, check }) => (
          <Typography
            component="li"
            variant="body2"
            key={`${mode}-${check.key}`}
          >
            {mode === "dark"
              ? t("theme.darkMode", "Dark Mode")
              : t("theme.lightMode", "Light Mode")}
            {": "}
            {t(check.labelKey, check.fallback)}
          </Typography>
        ))}
      </Box>
    </ConfirmDialog>
  )
}
