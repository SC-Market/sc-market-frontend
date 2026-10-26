import React, { useState } from "react"
import { Alert, Button, Card, CardContent, Container, Stack, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { useGetMfaStatusQuery } from "../../../store/api/v2/market"
import { MfaCodeForm } from "./MfaCodeForm"
import { MfaEnrollDialog } from "./MfaEnrollDialog"
import type { AdminLock } from "../adminLock"

/**
 * Shown in place of an admin page while the backend holds admin power back:
 * the two-factor challenge (verify this session) or, before setup, the
 * enrollment prompt. Once verified the profile refetches, the role comes
 * back as admin and SiteAdminRoute renders the page itself.
 */
export function MfaAdminGate(props: { lock: AdminLock }) {
  const { t } = useTranslation()
  const { data: status } = useGetMfaStatusQuery()
  const [enrollOpen, setEnrollOpen] = useState(false)
  const needsSetup = props.lock === "mfa_enrollment" || (status && !status.enrolled)

  return (
    <Container maxWidth="xs" sx={{ py: 6 }}>
      <Card>
        <CardContent>
          {needsSetup ? (
            <Stack spacing={2}>
              <Typography variant="h5">{t("mfa.gate.setupTitle", "Set up two-factor authentication")}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t("mfa.gate.setupExplain", "Admin features need two-factor authentication. The rest of the site works as usual.")}
              </Typography>
              {status?.enforcement === "unconfigured" && (
                <Alert severity="warning">{t("mfa.errors.notConfigured", "Two-factor authentication is not configured on the server yet.")}</Alert>
              )}
              <Button variant="contained" onClick={() => setEnrollOpen(true)}>
                {t("mfa.settings.setup", "Set up authenticator")}
              </Button>
              <MfaEnrollDialog open={enrollOpen} onClose={() => setEnrollOpen(false)} />
            </Stack>
          ) : (
            <Stack spacing={1}>
              <Typography variant="h5">{t("mfa.challenge.title", "Two-factor verification")}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {t("mfa.challenge.explain", "Admin features need a verified session. Verification lasts 24 hours on this device.")}
              </Typography>
              <MfaCodeForm onVerified={() => undefined} />
            </Stack>
          )}
        </CardContent>
      </Card>
    </Container>
  )
}
