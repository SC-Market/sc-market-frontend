import React, { useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
  CircularProgress,
} from "@mui/material"
import { WarningRounded } from "@mui/icons-material"
import { useGetActiveListingCountQuery } from "../../store/api/v2/market"
import { useExpireAllListings } from "../../features/admin/hooks/useExpireAllListings"

export function ExpireAllListingsButton() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const { data: countData, refetch } = useGetActiveListingCountQuery(
    undefined,
    { skip: !open },
  )
  const { expireAll, isLoading } = useExpireAllListings()

  const handleConfirm = async () => {
    if (await expireAll()) setOpen(false)
  }

  return (
    <>
      <Button
        variant="outlined"
        color="error"
        startIcon={<WarningRounded />}
        onClick={() => {
          setOpen(true)
          refetch()
        }}
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
          <Button
            onClick={handleConfirm}
            color="error"
            variant="contained"
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={20} />
            ) : countData ? (
              t("adminUi.expireListings.confirmButton", {
                count: countData.count,
              })
            ) : (
              t("adminUi.expireListings.confirmButtonNoCount")
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
