import React, { useState } from "react"
import { Button, CircularProgress, Chip } from "@mui/material"
import { EditRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useRequestReviewRevisionMutation } from "../../store/orders"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { OrderReview } from "../../datatypes/Order.tsx"

interface ReviewRevisionButtonProps {
  review: OrderReview
  orderId: string
}

export function ReviewRevisionButton({
  review,
  orderId,
}: ReviewRevisionButtonProps) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [requestRevision, { isLoading }] = useRequestReviewRevisionMutation()

  const handleRequestRevision = async () => {
    requestRevision({ reviewId: review.review_id, orderId })
      .unwrap()
      .then(() =>
        issueAlert({
          message: t("reviewRevision.success.requested"),
          severity: "success",
        }),
      )
      .catch(issueAlert)
  }

  if (review.revision_requested) {
    return (
      <Chip
        icon={<EditRounded />}
        label={t("reviewRevision.button.revisionRequested")}
        color="warning"
        variant="outlined"
        size="small"
      />
    )
  }

  return (
    <Button
      variant="outlined"
      color="warning"
      size="small"
      startIcon={isLoading ? <CircularProgress size={16} /> : <EditRounded />}
      onClick={handleRequestRevision}
      disabled={isLoading}
      sx={{
        textTransform: "none",
        fontSize: "0.875rem",
      }}
    >
      {isLoading
        ? t("reviewRevision.button.requesting")
        : t("reviewRevision.button.requestRevision")}
    </Button>
  )
}
