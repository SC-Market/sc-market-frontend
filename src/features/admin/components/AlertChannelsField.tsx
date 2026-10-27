import React from "react"
import { useTranslation } from "react-i18next"
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Typography,
} from "@mui/material"
import { usePreviewAdminAlertAudienceQuery } from "../../../store/api/v2/market"
import type {
  AdminAlertChannel,
  AdminAlertCreate,
} from "../../../datatypes/AdminAlert"

const CHANNELS: AdminAlertChannel[] = ["in_app", "push", "email", "discord_dm"]

/**
 * Admin alert delivery channels (in-app always, locked) and the audience
 * preview: how many users the alert reaches, and how many an email or a
 * Discord DM would reach.
 */
export function AlertChannelsField(props: {
  channels: AdminAlertChannel[]
  onChange: (channels: AdminAlertChannel[]) => void
  targetType: AdminAlertCreate["target_type"]
  targetSpectrumId?: string | null
}) {
  const { t } = useTranslation()
  const { channels, onChange, targetType, targetSpectrumId } = props
  const needsOrg = targetType === "specific_org"
  const { data: preview, isFetching } = usePreviewAdminAlertAudienceQuery(
    { targetType, ...(targetSpectrumId ? { targetSpectrumId } : {}) },
    { skip: needsOrg && !targetSpectrumId },
  )

  const label = (c: AdminAlertChannel) =>
    ({
      in_app: t("admin.alerts.channels.in_app", "In-app"),
      push: t("admin.alerts.channels.push", "Push"),
      email: t("admin.alerts.channels.email", "Email"),
      discord_dm: t("admin.alerts.channels.discord_dm", "Discord DM"),
    })[c]

  const toggle = (c: AdminAlertChannel) =>
    onChange(
      CHANNELS.filter(
        (x) =>
          x === "in_app" ||
          (x === c ? !channels.includes(c) : channels.includes(x)),
      ),
    )

  const reach: string[] = []
  if (preview) {
    reach.push(
      t("admin.alerts.preview.recipients", {
        defaultValue: "~{{count}} recipients",
        count: preview.recipients,
      }),
    )
    if (channels.includes("email")) {
      reach.push(
        t("admin.alerts.preview.emails", {
          defaultValue: "email to ~{{count}} verified addresses",
          count: preview.verified_emails,
        }),
      )
    }
    if (channels.includes("discord_dm")) {
      reach.push(
        t("admin.alerts.preview.discord", {
          defaultValue: "Discord DM to ~{{count}} linked accounts",
          count: preview.discord_linked,
        }),
      )
    }
  }

  return (
    <Box sx={{ mb: 2 }} data-testid="alert-channels">
      <FormLabel component="legend">
        {t("admin.alerts.channels.label", "Send by")}
      </FormLabel>
      <FormGroup row>
        {CHANNELS.map((c) => (
          <FormControlLabel
            key={c}
            label={label(c)}
            control={
              <Checkbox
                checked={c === "in_app" || channels.includes(c)}
                disabled={c === "in_app"}
                onChange={() => toggle(c)}
                inputProps={{ "aria-label": label(c) }}
              />
            }
          />
        ))}
      </FormGroup>
      <Typography variant="caption" color="text.secondary" component="p">
        {t(
          "admin.alerts.channels.hint",
          "Chosen channels are delivered even to users who turned them off. Others are not used.",
        )}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.5 }} data-testid="alert-audience">
        {needsOrg && !targetSpectrumId
          ? t(
              "admin.alerts.preview.pickOrg",
              "Pick an organization to see the audience.",
            )
          : isFetching && !preview
            ? t("admin.alerts.preview.loading", "Counting recipients…")
            : reach.join("; ")}
      </Typography>
    </Box>
  )
}
