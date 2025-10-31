import {
  Grid,
  Typography,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material"
import React from "react"
import { useProfileUnlinkAccountMutation } from "../../store/profile"
import { useTranslation } from "react-i18next"
import LoadingButton from "@mui/lab/LoadingButton"
import { FlatSection } from "../../components/paper/Section"

export function UnlinkProfile() {
  const { t } = useTranslation()
  const [unlinkAccount, { isLoading, isSuccess, isError, error }] =
    useProfileUnlinkAccountMutation()
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
                    : "Unknown error occurred"}
                </Typography>
              )}
            </Alert>
          </Grid>
        )}
      </FlatSection>

      <Dialog
        open={open}
        onClose={handleCancelUnlink}
        aria-labelledby="unlink-dialog-title"
        aria-describedby="unlink-dialog-description"
      >
        <DialogTitle id="unlink-dialog-title">
          {t("settings.profile.unlinkDialogTitle")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="unlink-dialog-description">
            {t("settings.profile.unlinkDialogDescription")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelUnlink}>
            {t("settings.profile.unlinkDialogCancel")}
          </Button>
          <LoadingButton
            onClick={handleConfirmUnlink}
            color="error"
            loading={isLoading}
            variant="contained"
          >
            {t("settings.profile.unlinkDialogConfirm")}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  )
}
