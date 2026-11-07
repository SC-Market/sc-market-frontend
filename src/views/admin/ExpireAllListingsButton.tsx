import React, { useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import { Button, Typography } from "@mui/material"
import { WarningRounded } from "@mui/icons-material"
import { useGetActiveListingCountQuery } from "../../store/api/v2/market"
import { useExpireAllListings } from "../../features/admin/hooks/useExpireAllListings"
import { ConfirmDialog } from "../../components/dialog/ConfirmDialog"

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

      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        title={t("adminUi.expireListings.dialogTitle")}
        message={
          countData ? (
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
          )
        }
        onConfirm={handleConfirm}
        confirmLabel={
          countData
            ? t("adminUi.expireListings.confirmButton", {
                count: countData.count,
              })
            : t("adminUi.expireListings.confirmButtonNoCount")
        }
        cancelLabel={t("common.cancel")}
        destructive
        loading={isLoading}
      >
        <Typography variant="body2" color="text.secondary">
          {t("adminUi.expireListings.note")}
        </Typography>
      </ConfirmDialog>
    </>
  )
}
