import React, { useState, useEffect } from "react"
import {
  Box,
  Button,
  TextField,
  Rating,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material"
import { SaveRounded, EditRounded, CancelRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useUpdateOrderReviewMutation } from "../../store/orders"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { OrderReview } from "../../datatypes/Order"

interface EditableReviewProps {
  review: OrderReview
}

export function EditableReview({ review }: EditableReviewProps) {
  const { t } = useTranslation()
  const showAlert = useAlertHook()
  const [updateReview, { isLoading }] = useUpdateOrderReviewMutation()

  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(review.content || "")
  const [rating, setRating] = useState(review.rating || 0)
  const [errors, setErrors] = useState<{ content?: string; rating?: string }>(
    {},
  )

  useEffect(() => {
    setContent(review.content || "")
    setRating(review.rating || 0)
  }, [review])

  const validateForm = () => {
    const newErrors: { content?: string; rating?: string } = {}

    if (!content || content.length < 10) {
      newErrors.content = t("reviewRevision.validation.contentMinLength")
    } else if (content.length > 2000) {
      newErrors.content = t("reviewRevision.validation.contentMaxLength")
    }

    if (rating < 0.5 || rating > 5) {
      newErrors.rating = t("reviewRevision.validation.ratingRange")
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    updateReview({
      reviewId: review.review_id,
      orderId: review.order_id,
      content: content.trim(),
      rating,
    })
      .unwrap()
      .then(() => {
        showAlert({
          message: t("reviewRevision.success.updated"),
          severity: "success",
        })
        setIsEditing(false)
      })
      .catch(showAlert)
  }

  const handleCancel = () => {
    setContent(review.content || "")
    setRating(review.rating || 0)
    setErrors({})
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <Paper
        elevation={1}
        sx={{
          p: 2,
          border: "2px solid",
          borderColor: "warning.main",
          backgroundColor: "warning.light",
          opacity: 0.9,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Chip
            icon={<EditRounded />}
            label={t("reviewRevision.status.revisionRequested")}
            color="warning"
            size="small"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("reviewRevision.info.revisionRequested")}
        </Typography>

        <Button
          variant="contained"
          color="primary"
          startIcon={<EditRounded />}
          onClick={() => setIsEditing(true)}
          size="small"
          sx={{ textTransform: "none" }}
        >
          {t("reviewRevision.button.editReview")}
        </Button>
      </Paper>
    )
  }

  return (
    <Paper
      elevation={2}
      sx={{ p: 3, border: "2px solid", borderColor: "primary.main" }}
    >
      <Typography variant="h6" gutterBottom>
        {t("reviewRevision.title.editReview")}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t("reviewRevision.info.editInstructions")}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          {t("reviewRevision.label.rating")} *
        </Typography>
        <Rating
          value={rating}
          onChange={(_, newValue) => setRating(newValue || 0)}
          precision={0.5}
          size="large"
          disabled={isLoading}
        />
        {errors.rating && (
          <Typography
            variant="caption"
            color="error"
            sx={{ display: "block", mt: 1 }}
          >
            {errors.rating}
          </Typography>
        )}
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={4}
          label={t("reviewRevision.label.content")}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          error={!!errors.content}
          helperText={
            errors.content ||
            `${content.length}/2000 ${t("reviewRevision.label.characters")}`
          }
          disabled={isLoading}
          inputProps={{ maxLength: 2000 }}
        />
      </Box>

      <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
        <Button
          variant="outlined"
          startIcon={<CancelRounded />}
          onClick={handleCancel}
          disabled={isLoading}
          sx={{ textTransform: "none" }}
        >
          {t("reviewRevision.button.cancel")}
        </Button>

        <Button
          variant="contained"
          startIcon={
            isLoading ? <CircularProgress size={16} /> : <SaveRounded />
          }
          onClick={handleSave}
          disabled={isLoading || !content.trim() || rating < 0.5}
          sx={{ textTransform: "none" }}
        >
          {isLoading
            ? t("reviewRevision.button.saving")
            : t("reviewRevision.button.save")}
        </Button>
      </Box>
    </Paper>
  )
}
