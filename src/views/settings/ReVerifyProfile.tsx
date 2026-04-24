import { Grid, Typography, Alert } from "@mui/material"
import React from "react"
import { useProfileSyncHandleMutation } from "../../features/profile/api/profileApi"
import { useTranslation } from "react-i18next"
import LoadingButton from "@mui/lab/LoadingButton"
import { FlatSection } from "../../components/paper/Section"

export function ReVerifyProfile() {
  const { t } = useTranslation()
  const [syncHandle, { isLoading, isSuccess, isError, error }] =
    useProfileSyncHandleMutation()

  const handleSyncHandle = () => {
    syncHandle()
  }

  return (
    <FlatSection title={t("settings.profile.reVerifyTitle")}>
      <Grid item xs={12}>
        <Typography variant="body2" color="text.secondary" paragraph>
          {t("settings.profile.reVerifyDescription")}
        </Typography>
      </Grid>

      <Grid item xs={12} display="flex" justifyContent="flex-end">
        <LoadingButton
          variant="contained"
          color="primary"
          onClick={handleSyncHandle}
          loading={isLoading}
          disabled={isLoading}
        >
          {t("settings.profile.reVerifyButton")}
        </LoadingButton>
      </Grid>

      {isSuccess && (
        <Grid item xs={12}>
          <Alert severity="success">
            {t("settings.profile.reVerifySuccess")}
          </Alert>
        </Grid>
      )}

      {isError && (
        <Grid item xs={12}>
          <Alert severity="error">
            {t("settings.profile.reVerifyError")}
            {error && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {"data" in error &&
                typeof error.data === "object" &&
                error.data &&
                "message" in error.data
                  ? String(error.data.message)
                  : "Unknown error occurred"}
              </Typography>
            )}
          </Alert>
        </Grid>
      )}
    </FlatSection>
  )
}
