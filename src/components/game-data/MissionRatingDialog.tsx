/**
 * MissionRatingDialog Component
 *
 * Dialog for rating missions with difficulty and satisfaction ratings.
 *
 * Features:
 * - Difficulty rating (1-5 stars) - Requirement 49.1
 * - Satisfaction rating (1-5 stars) - Requirement 49.2
 * - Optional comment field - Requirement 49.6, 49.7
 * - Update existing ratings - Requirement 49.8
 * - Prevent rating manipulation - Requirement 49.9
 * - Display user's own rating - Requirement 49.10
 *
 * Task 11.5 - Create MissionRatingDialog component
 * Requirements: 49.1, 49.2, 49.6, 49.7, 49.8, 49.9, 49.10
 */

import React, { useState, useEffect } from "react"
import {
  Button,
  TextField,
  Stack,
  Typography,
  Box,
  Rating,
  CircularProgress,
  Alert,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { useRateMission } from "../../features/game-data/hooks/useGameDataActions"
import { ResponsiveDialog } from "../dialog/ResponsiveDialog"

export interface MissionRatingDialogProps {
  open: boolean
  onClose: () => void
  missionId: string
  missionName: string
  existingRating?: {
    difficulty_rating: number
    satisfaction_rating: number
    rating_comment?: string
  }
}

/**
 * MissionRatingDialog Component
 *
 * Provides a form for rating missions with:
 * - Difficulty rating (1-5 stars)
 * - Satisfaction rating (1-5 stars)
 * - Optional comment field
 * - Validation and error handling
 * - Support for updating existing ratings
 */
export function MissionRatingDialog({
  open,
  onClose,
  missionId,
  missionName,
  existingRating,
}: MissionRatingDialogProps) {
  const { t } = useTranslation()
  // Form state
  const [difficultyRating, setDifficultyRating] = useState<number | null>(
    existingRating?.difficulty_rating || null,
  )
  const [satisfactionRating, setSatisfactionRating] = useState<number | null>(
    existingRating?.satisfaction_rating || null,
  )
  const [comment, setComment] = useState(existingRating?.rating_comment || "")
  const [error, setError] = useState<string | null>(null)

  // RTK Query mutation
  const { rate, isLoading } = useRateMission(missionId)

  // Update form when existingRating changes
  useEffect(() => {
    if (existingRating) {
      setDifficultyRating(existingRating.difficulty_rating)
      setSatisfactionRating(existingRating.satisfaction_rating)
      setComment(existingRating.rating_comment || "")
    }
  }, [existingRating])

  // Reset form
  const resetForm = () => {
    setDifficultyRating(existingRating?.difficulty_rating || null)
    setSatisfactionRating(existingRating?.satisfaction_rating || null)
    setComment(existingRating?.rating_comment || "")
    setError(null)
  }

  // Handle close
  const handleClose = () => {
    resetForm()
    onClose()
  }

  // Handle submit
  const handleSubmit = async () => {
    // Validate ratings (Requirement 49.1, 49.2)
    if (!difficultyRating || difficultyRating < 1 || difficultyRating > 5) {
      setError(t("missionToolsUi.errorDifficultyRequired"))
      return
    }

    if (
      !satisfactionRating ||
      satisfactionRating < 1 ||
      satisfactionRating > 5
    ) {
      setError(t("missionToolsUi.errorSatisfactionRequired"))
      return
    }

    // Validate comment length (Requirement 49.6, 49.7)
    if (comment.length > 1000) {
      setError(t("missionToolsUi.errorCommentTooLong"))
      return
    }

    setError(null)

    // Submit rating (Requirement 49.8, 49.9)
    const failure = await rate({
      difficulty_rating: difficultyRating,
      satisfaction_rating: satisfactionRating,
      rating_comment: comment || undefined,
    })
    if (failure) setError(failure)
    // Close dialog on success
    else handleClose()
  }

  return (
    <ResponsiveDialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      mobile="fullScreen"
      disableClose={isLoading}
      title={
        existingRating
          ? t("missionToolsUi.updateRating")
          : t("missionToolsUi.rateMission")
      }
      actions={
        <>
          <Button onClick={handleClose} disabled={isLoading}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isLoading || !difficultyRating || !satisfactionRating}
          >
            {isLoading ? (
              <CircularProgress size={20} />
            ) : existingRating ? (
              t("missionToolsUi.updateRating")
            ) : (
              t("missionToolsUi.submitRating")
            )}
          </Button>
        </>
      }
    >
      <Stack spacing={3} mt={1}>
        {/* Mission Name */}
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {t("missionToolsUi.mission")}
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {missionName}
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Difficulty Rating (Requirement 49.1) */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {t("missionToolsUi.difficultyRatingRequired")}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            mb={1}
          >
            {t("missionToolsUi.difficultyQuestion")}
          </Typography>
          <Rating
            value={difficultyRating}
            onChange={(_, newValue) => setDifficultyRating(newValue)}
            size="large"
            precision={1}
            max={5}
          />
          {difficultyRating && (
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mt={0.5}
            >
              {t("missionToolsUi.starsOutOf5", { value: difficultyRating })}
            </Typography>
          )}
        </Box>

        {/* Satisfaction Rating (Requirement 49.2) */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {t("missionToolsUi.satisfactionRatingRequired")}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            mb={1}
          >
            {t("missionToolsUi.satisfactionQuestion")}
          </Typography>
          <Rating
            value={satisfactionRating}
            onChange={(_, newValue) => setSatisfactionRating(newValue)}
            size="large"
            precision={1}
            max={5}
          />
          {satisfactionRating && (
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mt={0.5}
            >
              {t("missionToolsUi.starsOutOf5", { value: satisfactionRating })}
            </Typography>
          )}
        </Box>

        {/* Optional Comment (Requirement 49.6, 49.7) */}
        <TextField
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          multiline
          rows={4}
          fullWidth
          label={t("missionToolsUi.commentOptional")}
          placeholder={t("missionToolsUi.commentPlaceholder")}
          inputProps={{ maxLength: 1000 }}
          helperText={t("missionToolsUi.commentCharCount", {
            length: comment.length,
            max: 1000,
          })}
        />

        {/* Update Notice (Requirement 49.8) */}
        {existingRating && (
          <Alert severity="info">{t("missionToolsUi.alreadyRated")}</Alert>
        )}
      </Stack>
    </ResponsiveDialog>
  )
}
