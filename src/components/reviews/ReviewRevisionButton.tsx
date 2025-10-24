import React, { useState } from "react"
import {
  Button,
  CircularProgress,
  Chip,
  TextField,
  Box,
  Collapse,
} from "@mui/material"
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
  const [message, setMessage] = useState("")
  const [showMessageInput, setShowMessageInput] = useState(false)

  const handleRequestRevision = async () => {
    if (!showMessageInput) {
      setShowMessageInput(true)
      return
    }

    requestRevision({
      reviewId: review.review_id,
      orderId,
      message: message.trim() || undefined,
    })
      .unwrap()
      .then(() => {
        issueAlert({
          message: t("reviewRevision.success.requested"),
          severity: "success",
        })
        setShowMessageInput(false)
        setMessage("")
      })
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
    <Box>
      <Collapse in={showMessageInput}>
        <TextField
          multiline
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("reviewRevision.message.placeholder")}
          fullWidth
          sx={{ mb: 2 }}
          inputProps={{ maxLength: 500 }}
          helperText={`${message.length}/500 characters`}
        />
      </Collapse>
      <Button
        variant="outlined"
        color="warning"
        size="small"
        startIcon={isLoading ? <CircularProgress size={16} /> : <EditRounded />}
        onClick={handleRequestRevision}
        disabled={isLoading || (showMessageInput && message.length > 500)}
        sx={{
          textTransform: "none",
          fontSize: "0.875rem",
        }}
      >
        {showMessageInput
          ? t("reviewRevision.button.submit")
          : t("reviewRevision.button.requestRevision")}
      </Button>
    </Box>
  )
}
