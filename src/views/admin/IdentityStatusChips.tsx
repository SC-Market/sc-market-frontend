import React from "react"
import { Box, Chip, Stack, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { type IdentitySearchRow } from "../../store/api/v2/market"
import { isSiteAdmin } from "../../util/siteRole"
import { type Formatters } from "../../util/format"

export function formatDate(
  value: string | null | undefined,
  fmt: Formatters,
): string {
  return value ? fmt.dateTime(value) : "-"
}

export function StatusChips(props: { user: IdentitySearchRow }) {
  const { user } = props
  const { t } = useTranslation()
  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
      {user.is_tombstone && (
        <Chip
          size="small"
          label={t("adminIdentity.status.deleted", "Deleted")}
        />
      )}
      {user.deletion_pending && (
        <Chip
          size="small"
          color="warning"
          label={t("adminIdentity.status.deletionPending", "Deletion pending")}
        />
      )}
      {user.banned && (
        <Chip
          size="small"
          color="error"
          label={t("adminIdentity.status.deactivated", "Deactivated")}
        />
      )}
      {user.is_test && (
        <Chip
          size="small"
          label={t("adminIdentity.status.test", "Test account")}
        />
      )}
      {isSiteAdmin(user) && (
        <Chip
          size="small"
          color="info"
          label={t("adminIdentity.status.admin", "Site admin")}
        />
      )}
      {user.rsi_confirmed && (
        <Chip
          size="small"
          color="success"
          label={t("adminIdentity.status.verified", "RSI verified")}
        />
      )}
    </Stack>
  )
}

/** A label (dull) over a value (bright: text.secondary is the bright colour in this theme). */
export function Field(props: {
  label: string
  value: React.ReactNode
  testId?: string
}) {
  return (
    <Box>
      <Typography variant="caption" color="text.primary">
        {props.label}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ wordBreak: "break-all" }}
        data-testid={props.testId}
      >
        {props.value}
      </Typography>
    </Box>
  )
}
