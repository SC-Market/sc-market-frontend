import React, { useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import {
  Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Typography, CircularProgress,
} from "@mui/material"
import { WarningRounded } from "@mui/icons-material"
import { useExpireAllListingsMutation, useGetActiveListingCountQuery } from "../../store/api/v2/market"
import { useAlertHook } from "../../hooks/alert/AlertHook"

export function ExpireAllListingsButton() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const { data: countData, refetch } = useGetActiveListingCountQuery(undefined, { skip: !open })
  const [expireAll, { isLoading }] = useExpireAllListingsMutation()
  const issueAlert = useAlertHook()

  const handleConfirm = async () => {
    try {
      const result = await expireAll().unwrap()
      issueAlert({ message: t("adminUi.expireListings.expired", { count: result.affected }), severity: "success" })
      setOpen(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("adminUi.expireListings.failed")
      issueAlert({ message, severity: "error" })
    }
  }

  return (
    <>
      <Button
        variant="outlined"
        color="error"
        startIcon={<WarningRounded />}
        onClick={() => { setOpen(true); refetch() }}
      >
        {t("adminUi.expireListings.button")}
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{t("adminUi.expireListings.dialogTitle")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {countData ? (
              <Trans
                i18nKey="adminUi.expireListings.confirmBody"
                count={countData.count}
                components={{ strong: <strong /> }}
              />
            ) : (
              <Trans
                i18nKey="adminUi.expireListings.confirmBodyLoading"
                components={{ strong: <strong /> }}
              />
            )}
          </DialogContentText>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t("adminUi.expireListings.note")}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{t("common.cancel")}</Button>
          <Button onClick={handleConfirm} color="error" variant="contained" disabled={isLoading}>
            {isLoading ? (
              <CircularProgress size={20} />
            ) : countData ? (
              t("adminUi.expireListings.confirmButton", { count: countData.count })
            ) : (
              t("adminUi.expireListings.confirmButtonNoCount")
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
