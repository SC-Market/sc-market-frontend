import React from "react"
import { useTranslation } from "react-i18next"
import { Paper, Stack, Typography } from "@mui/material"
import { useGetLastWipeQuery } from "../../store/api/v2/market"
import { useFormatters } from "../../util/format"

/** The last wipe: when it ran, listings paused, relisted so far, sellers messaged (GET /admin/last-wipe). */
export function LastWipeStats() {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const { data, isLoading } = useGetLastWipeQuery()
  if (isLoading) return null

  const stat = (label: string, value: string) => (
    <Stack spacing={0.25}>
      <Typography variant="caption" color="text.primary">
        {label}
      </Typography>
      <Typography variant="h6" color="text.secondary">
        {value}
      </Typography>
    </Stack>
  )

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }} data-testid="last-wipe">
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
        {t("adminUi.lastWipe.title")}
      </Typography>
      {!data ? (
        <Typography variant="body2" color="text.primary">
          {t("adminUi.lastWipe.none")}
        </Typography>
      ) : (
        <>
          <Typography variant="body2" color="text.primary" sx={{ mb: 1.5 }}>
            {t("adminUi.lastWipe.ranAt", { date: fmt.dateTime(data.ran_at) })}
          </Typography>
          <Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
            {stat(t("adminUi.lastWipe.paused"), fmt.integer(data.paused))}
            {stat(t("adminUi.lastWipe.relisted"), fmt.integer(data.relisted))}
            {stat(
              t("adminUi.lastWipe.messages"),
              t("adminUi.lastWipe.messagesValue", {
                sent: fmt.integer(data.messages_sent),
                queued: fmt.integer(data.messages_queued),
              }),
            )}
          </Stack>
        </>
      )}
    </Paper>
  )
}
