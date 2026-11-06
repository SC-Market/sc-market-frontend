import React from "react"
import { Box, Grid, Typography } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import { useTranslation } from "react-i18next"
import { FlatSection } from "../../components/paper/Section"
import { useSession } from "../../hooks/login/useSession"
import { useResetDismissedHints } from "../../features/help/hooks/useResetDismissedHints"

/**
 * "Show tips again": brings back every first-use hint the user dismissed.
 * Signed in, that clears the account's list (DELETE /api/v2/hints/dismissed);
 * signed out, this browser's localStorage.
 */
export function HelpTipsSettings() {
  const { t } = useTranslation()
  const session = useSession()
  const { reset: handleClick, busy } = useResetDismissedHints()

  return (
    <FlatSection title={t("settings.tips.title")}>
      <Grid item xs={12}>
        <Typography variant="body2" color="text.primary">
          {t("settings.tips.description")}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Box display="flex" justifyContent="flex-end">
          <LoadingButton
            variant="outlined"
            color="primary"
            loading={busy}
            disabled={session.status === "unknown"}
            onClick={handleClick}
          >
            {t("settings.tips.showAgain")}
          </LoadingButton>
        </Box>
      </Grid>
    </FlatSection>
  )
}
