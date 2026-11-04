import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Alert,
  Box,
  Button,
  Chip,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import {
  useSendStillSellingFeedbackMutation,
  type StillSellingAction,
  type StillSellingPauseReason,
} from "../../store/api/v2/market"

export const PAUSE_REASONS: StillSellingPauseReason[] = [
  "not_playing",
  "waiting_patch",
  "not_enough_buyers",
  "selling_elsewhere",
  "too_much_work",
  "about_sc_market",
  "other",
]

export const MAX_FEEDBACK_TEXT = 500

/**
 * The optional question on the "Still selling?" result page: after pausing,
 * why (one-tap chips, any number, optional text for "Something about SC
 * Market" and "Other"); after keeping, what would make selling easier.
 * Never required: "No thanks" just closes it. Sent once per link.
 */
export function StillSellingFeedback({
  token,
  action,
  alreadySubmitted,
}: {
  token: string
  action: StillSellingAction
  alreadySubmitted?: boolean
}) {
  const { t } = useTranslation()
  const [reasons, setReasons] = useState<StillSellingPauseReason[]>([])
  const [about, setAbout] = useState("")
  const [other, setOther] = useState("")
  const [easier, setEasier] = useState("")
  const [dismissed, setDismissed] = useState(false)
  const [send, state] = useSendStillSellingFeedbackMutation()

  const reasonLabel = (r: StillSellingPauseReason) =>
    ({
      not_playing: t(
        "stillSellingPage.feedback.reasons.not_playing",
        "Not playing Star Citizen right now",
      ),
      waiting_patch: t(
        "stillSellingPage.feedback.reasons.waiting_patch",
        "Waiting for the next patch or wipe",
      ),
      not_enough_buyers: t(
        "stillSellingPage.feedback.reasons.not_enough_buyers",
        "Not enough buyers",
      ),
      selling_elsewhere: t(
        "stillSellingPage.feedback.reasons.selling_elsewhere",
        "Selling somewhere else (Discord, another site)",
      ),
      too_much_work: t(
        "stillSellingPage.feedback.reasons.too_much_work",
        "Too much work keeping listings up to date",
      ),
      about_sc_market: t(
        "stillSellingPage.feedback.reasons.about_sc_market",
        "Something about SC Market",
      ),
      other: t("stillSellingPage.feedback.reasons.other", "Other"),
    })[r]

  if (dismissed) return null
  if (alreadySubmitted || state.data?.ok) {
    return (
      <Alert severity="success">
        {t("stillSellingPage.feedback.thanks", "Thanks for telling us.")}
      </Alert>
    )
  }

  const toggle = (r: StillSellingPauseReason) =>
    setReasons((rs) =>
      rs.includes(r) ? rs.filter((x) => x !== r) : [...rs, r],
    )

  const pause = action === "pause"
  const canSubmit = pause
    ? reasons.length > 0 || !!about.trim() || !!other.trim()
    : !!easier.trim()

  const onSubmit = () => {
    void send({
      token,
      stillSellingFeedbackRequest: pause
        ? {
            reasons,
            ...(reasons.includes("about_sc_market") && about.trim()
              ? { about_sc_market: about.trim() }
              : {}),
            ...(reasons.includes("other") && other.trim()
              ? { other_text: other.trim() }
              : {}),
          }
        : { easier_text: easier.trim() },
    })
  }

  const failed =
    state.isError ||
    (state.data && !state.data.ok && state.data.reason !== "already")

  const textField = (
    value: string,
    onChange: (v: string) => void,
    label: string,
  ) => (
    <TextField
      value={value}
      onChange={(e) => onChange(e.target.value.slice(0, MAX_FEEDBACK_TEXT))}
      label={label}
      multiline
      minRows={2}
      fullWidth
      inputProps={{ maxLength: MAX_FEEDBACK_TEXT }}
      helperText={`${value.length}/${MAX_FEEDBACK_TEXT}`}
    />
  )

  return (
    <Box sx={{ width: "100%" }} data-testid="still-selling-feedback">
      <Typography variant="h6" component="h2" gutterBottom>
        {pause
          ? t("stillSellingPage.feedback.pauseQuestion", "Mind telling us why?")
          : t(
              "stillSellingPage.feedback.keepQuestion",
              "Anything that would make selling here easier?",
            )}
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        {pause
          ? t(
              "stillSellingPage.feedback.pauseHint",
              "Optional. Pick any that apply.",
            )
          : t("stillSellingPage.feedback.keepHint", "Optional.")}
      </Typography>
      <Stack spacing={2}>
        {pause ? (
          <>
            <Box
              sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
              role="group"
            >
              {PAUSE_REASONS.map((r) => {
                const on = reasons.includes(r)
                return (
                  <Chip
                    key={r}
                    label={reasonLabel(r)}
                    clickable
                    color={on ? "primary" : "default"}
                    variant={on ? "filled" : "outlined"}
                    onClick={() => toggle(r)}
                    aria-pressed={on}
                  />
                )
              })}
            </Box>
            {reasons.includes("about_sc_market") &&
              textField(
                about,
                setAbout,
                t(
                  "stillSellingPage.feedback.aboutLabel",
                  "What about SC Market? (optional)",
                ),
              )}
            {reasons.includes("other") &&
              textField(
                other,
                setOther,
                t("stillSellingPage.feedback.otherLabel", "Other (optional)"),
              )}
          </>
        ) : (
          textField(
            easier,
            setEasier,
            t(
              "stillSellingPage.feedback.easierLabel",
              "Your thoughts (optional)",
            ),
          )
        )}
        {failed && (
          <Alert severity="error">
            {t(
              "stillSellingPage.feedback.failed",
              "That didn't go through. Please try again.",
            )}
          </Alert>
        )}
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            onClick={onSubmit}
            disabled={!canSubmit || state.isLoading}
          >
            {t("stillSellingPage.feedback.submit", "Submit")}
          </Button>
          <Button onClick={() => setDismissed(true)}>
            {t("stillSellingPage.feedback.noThanks", "No thanks")}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
