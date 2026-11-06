import { useState } from "react"
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { type CreateTestAccountResponse } from "../../store/api/v2/market"
import {
  credentialsJson,
  downloadJson,
  type TestAccountCredential,
} from "../../util/testAccountCredentials"

export function CopyButton(props: { value: string; testId?: string }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="small"
      data-testid={props.testId}
      onClick={async () => {
        await navigator.clipboard.writeText(props.value)
        setCopied(true)
      }}
    >
      {copied ? t("mfa.common.copied", "Copied") : t("mfa.common.copy", "Copy")}
    </Button>
  )
}

/** Shown once, right after creation. Closing drops the secret from the store. */
export function SecretDialog(props: {
  account: CreateTestAccountResponse | undefined
  session: TestAccountCredential[]
  onClose: () => void
}) {
  const { t } = useTranslation()
  const a = props.account
  const credential: TestAccountCredential | null = a
    ? { username: a.username, secret: a.secret, otpauth_uri: a.otpauth_uri }
    : null
  const fileEntry = credential ? credentialsJson([credential]) : ""
  return (
    <Dialog open={!!a} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t(
          "admin.testAccounts.secretTitle",
          "Save this authenticator secret now",
        )}
      </DialogTitle>
      <DialogContent>
        {a && (
          <Stack spacing={2} alignItems="center">
            <Alert severity="warning" sx={{ alignSelf: "stretch" }}>
              {t(
                "admin.testAccounts.secretOnce",
                "This is the only time the secret is shown. Store it in ~/.config/scmarket-test-accounts.json (chmod 600), never in a repository.",
              )}
            </Alert>
            <Box
              component="img"
              src={a.qr_data_url}
              alt={t("mfa.enroll.qrAlt", "QR code for your authenticator app")}
              sx={{
                width: 200,
                height: 200,
                bgcolor: "white",
                p: 1,
                borderRadius: 1,
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {t("admin.testAccounts.secretFor", "Secret for {{username}}:", {
                username: a.username,
              })}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography
                component="code"
                data-testid="test-account-secret"
                sx={{
                  fontFamily: "monospace",
                  fontSize: "1.05rem",
                  letterSpacing: "0.05em",
                }}
              >
                {a.manual_key}
              </Typography>
              <CopyButton value={a.secret} testId="copy-test-account-secret" />
            </Stack>
            <Box sx={{ alignSelf: "stretch" }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t(
                  "admin.testAccounts.fileEntry",
                  "Entry for the secrets file:",
                )}
              </Typography>
              <Box
                component="pre"
                sx={{
                  fontFamily: "monospace",
                  fontSize: "0.85rem",
                  bgcolor: "action.hover",
                  p: 1.5,
                  borderRadius: 1,
                  m: 0,
                  overflowX: "auto",
                }}
              >
                {fileEntry}
              </Box>
              <Stack
                direction="row"
                spacing={1}
                sx={{ mt: 1 }}
                flexWrap="wrap"
                useFlexGap
              >
                <Button
                  variant="contained"
                  size="small"
                  data-testid="download-test-account-credentials"
                  onClick={() =>
                    credential && downloadJson(credentialsJson([credential]))
                  }
                >
                  {t("admin.testAccounts.download", "Download credentials")}
                </Button>
                {props.session.length > 1 && (
                  <Button
                    variant="outlined"
                    size="small"
                    data-testid="download-all-test-account-credentials"
                    onClick={() => downloadJson(credentialsJson(props.session))}
                  >
                    {t(
                      "admin.testAccounts.downloadAll",
                      "Download all created this session ({{count}})",
                      {
                        count: props.session.length,
                      },
                    )}
                  </Button>
                )}
                <CopyButton value={fileEntry} />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t(
                  "admin.testAccounts.chmod",
                  "Save it as ~/.config/scmarket-test-accounts.json and run chmod 600 on it. Merge several downloads with jq -s add a.json b.json.",
                )}
              </Typography>
            </Box>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={props.onClose}>
          {t("admin.testAccounts.saved", "I saved it")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
