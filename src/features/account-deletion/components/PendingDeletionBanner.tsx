import React from "react"
import { Alert, Button, CircularProgress } from "@mui/material"
import { useTranslation } from "react-i18next"
import { useAccountCancelDeletionMutation } from "../../profile/api/profileApi"
import { useAlertHook } from "../../../hooks/alert/AlertHook"

interface PendingDeletionBannerProps {
  scheduledAt: string
}

export function PendingDeletionBanner({
  scheduledAt,
}: PendingDeletionBannerProps) {
  const { t } = useTranslation()
  const [cancelDeletion, { isLoading }] = useAccountCancelDeletionMutation()
  const issueAlert = useAlertHook()

  const handleCancel = async () => {
    try {
      const result = await cancelDeletion().unwrap()
      issueAlert({ message: result.message, severity: "success" })
    } catch {
      issueAlert({
        message: t("account_deletion.cancel_error", {
          defaultValue: "Failed to cancel deletion. Please try again.",
        }),
        severity: "error",
      })
    }
  }

  const formattedDate = new Date(scheduledAt).toLocaleDateString(undefined, {
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
