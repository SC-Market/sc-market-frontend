import React from "react"
import { Alert, Button, CircularProgress } from "@mui/material"
import { useTranslation } from "react-i18next"
import { useCancelAccountDeletion } from "../hooks/useAccountDeletion"
import { useFormatters } from "../../../util/format"

interface PendingDeletionBannerProps {
  scheduledAt: string
}

export function PendingDeletionBanner({
  scheduledAt,
}: PendingDeletionBannerProps) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const { cancel: handleCancel, isLoading } = useCancelAccountDeletion()

  const formattedDate = fmt.date(scheduledAt, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <Alert
      severity="warning"
      action={
        <Button
          color="inherit"
          size="small"
          onClick={handleCancel}
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            t("account_deletion.cancel_button", {
              defaultValue: "Cancel Deletion",
            })
          )}
        </Button>
      }
    >
      {t("account_deletion.pending_message", {
        defaultValue:
          "Your account is scheduled for permanent deletion on {{date}}.",
        date: formattedDate,
      })}
    </Alert>
  )
}
