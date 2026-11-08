import { Grid, Typography, Alert, Button } from "@mui/material"
import React from "react"
import { useUnlinkRsiAccount } from "../../features/profile/hooks/useAccountSettingsActions"
import { useTranslation } from "react-i18next"
import { FlatSection } from "../../components/paper/Section"
import { ConfirmDialog } from "../../components/dialog/ConfirmDialog"

export function UnlinkProfile() {
  const { t } = useTranslation()
  const {
    unlink: unlinkAccount,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useUnlinkRsiAccount()
  const [open, setOpen] = React.useState(false)

  const handleUnlinkClick = () => {
    setOpen(true)
  }

  const handleConfirmUnlink = () => {
    unlinkAccount()
    setOpen(false)
  }

  const handleCancelUnlink = () => {
    setOpen(false)
  }

  return (
    <>
      <FlatSection title={t("settings.profile.unlinkTitle")}>
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary" paragraph>
            {t("settings.profile.unlinkDescription")}
          </Typography>
        </Grid>

        <Grid item xs={12} display="flex" justifyContent="flex-end">
          <Button
            variant="outlined"
            color="error"
            onClick={handleUnlinkClick}
            disabled={isLoading}
          >
            {t("settings.profile.unlinkButton")}
          </Button>
        </Grid>

        {isSuccess && (
          <Grid item xs={12}>
            <Alert severity="success">
              {t("settings.profile.unlinkSuccess")}
            </Alert>
          </Grid>
        )}

        {isError && (
          <Grid item xs={12}>
            <Alert severity="error">
              {t("settings.profile.unlinkError")}
              {error && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {"data" in error &&
                  typeof error.data === "object" &&
                  error.data &&
                  "message" in error.data
                    ? String(error.data.message)
                    : t("accountUi.unknownError")}
                </Typography>
              )}
            </Alert>
          </Grid>
        )}
      </FlatSection>

      <ConfirmDialog
        open={open}
        onClose={handleCancelUnlink}
        title={t("settings.profile.unlinkDialogTitle")}
        message={t("settings.profile.unlinkDialogDescription")}
        cancelLabel={t("settings.profile.unlinkDialogCancel")}
        confirmLabel={t("settings.profile.unlinkDialogConfirm")}
        destructive
        loading={isLoading}
        onConfirm={handleConfirmUnlink}
      />
    </>
  )
}
