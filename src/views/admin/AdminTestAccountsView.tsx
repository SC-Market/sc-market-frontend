import React, { useState } from "react"
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import {
  useCreateTestAccountMutation,
  useDeleteTestAccountMutation,
  useListTestAccountsQuery,
  type CreateTestAccountResponse,
} from "../../store/api/v2/market"
import { describeMfaError } from "../../features/mfa/errors"
import {
  credentialsJson,
  downloadJson,
  type TestAccountCredential,
} from "../../util/testAccountCredentials"

const USERNAME_RE = /^~?test[a-z0-9_-]{2,36}$/i

function CopyButton(props: { value: string; testId?: string }) {
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
function SecretDialog(props: {
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
      <DialogTitle>{t("admin.testAccounts.secretTitle", "Save this authenticator secret now")}</DialogTitle>
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
              sx={{ width: 200, height: 200, bgcolor: "white", p: 1, borderRadius: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              {t("admin.testAccounts.secretFor", "Secret for {{username}}:", { username: a.username })}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography
                component="code"
                data-testid="test-account-secret"
                sx={{ fontFamily: "monospace", fontSize: "1.05rem", letterSpacing: "0.05em" }}
              >
                {a.manual_key}
              </Typography>
              <CopyButton value={a.secret} testId="copy-test-account-secret" />
            </Stack>
            <Box sx={{ alignSelf: "stretch" }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t("admin.testAccounts.fileEntry", "Entry for the secrets file:")}
              </Typography>
              <Box
                component="pre"
                sx={{ fontFamily: "monospace", fontSize: "0.85rem", bgcolor: "action.hover", p: 1.5, borderRadius: 1, m: 0, overflowX: "auto" }}
              >
                {fileEntry}
              </Box>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                <Button
                  variant="contained"
                  size="small"
                  data-testid="download-test-account-credentials"
                  onClick={() => credential && downloadJson(credentialsJson([credential]))}
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
                    {t("admin.testAccounts.downloadAll", "Download all created this session ({{count}})", {
                      count: props.session.length,
                    })}
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

export function AdminTestAccountsView() {
  const { t } = useTranslation()
  const { data, error, isLoading } = useListTestAccountsQuery()
  const [create, createState] = useCreateTestAccountMutation()
  const [remove, removeState] = useDeleteTestAccountMutation()
  const [username, setUsername] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  // Accounts created on this page since it loaded, for "Download all". Only in
  // this component's state: gone on reload, never stored or sent anywhere.
  const [session, setSession] = useState<TestAccountCredential[]>([])

  const validUsername = USERNAME_RE.test(username.trim())
  const canCreate = validUsername && displayName.trim().length > 0 && !createState.isLoading

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canCreate) return
    const result = await create({
      createTestAccountRequest: { username: username.trim(), display_name: displayName.trim() },
    })
    if ("data" in result && result.data) {
      const c = result.data
      setSession((prev) => [
        ...prev.filter((p) => p.username !== c.username),
        { username: c.username, secret: c.secret, otpauth_uri: c.otpauth_uri },
      ])
      setUsername("")
      setDisplayName("")
    }
  }

  return (
    <Stack spacing={3}>
      <Alert severity="info">
        {t(
          "admin.testAccounts.intro",
          "Test accounts are for automated browser agents. They sign in with a username and an authenticator code, never see or reach real users, and real users never see them. Creating or deleting one needs a fresh two-factor code.",
        )}
      </Alert>
      {data && (
        <Alert severity={data.login_enabled ? "warning" : "success"} data-testid="test-login-status">
          {data.login_enabled
            ? t("admin.testAccounts.loginOn", "Test login is ON (TEST_LOGIN_ENABLED=true). Unset it to switch test login off.")
            : t("admin.testAccounts.loginOff", "Test login is OFF. Accounts can be created, but nobody can sign into them until TEST_LOGIN_ENABLED=true is set.")}
        </Alert>
      )}

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {t("admin.testAccounts.create", "Create a test account")}
        </Typography>
        <Box component="form" onSubmit={submit} noValidate>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "flex-start" }}>
            <TextField
              label={t("admin.testAccounts.username", "Username")}
              value={username}
              onChange={(e) => {
                createState.reset()
                setUsername(e.target.value)
              }}
              error={username !== "" && !validUsername}
              helperText={t("admin.testAccounts.usernameHelp", "\"test\" + a name, e.g. test-buyer; saved as ~test-buyer")}
              inputProps={{ "data-testid": "test-account-username", autoComplete: "off" }}
            />
            <TextField
              label={t("admin.testAccounts.displayName", "Display name")}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value.slice(0, 100))}
              inputProps={{ "data-testid": "test-account-display-name", autoComplete: "off" }}
            />
            <Button type="submit" variant="contained" disabled={!canCreate} sx={{ mt: { sm: 1 } }}>
              {t("admin.testAccounts.createButton", "Create")}
            </Button>
          </Stack>
          {createState.error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {describeMfaError(createState.error, t)}
            </Alert>
          )}
        </Box>
      </Paper>

      <Paper>
        {error && <Alert severity="error">{describeMfaError(error, t)}</Alert>}
        {removeState.error && <Alert severity="error">{describeMfaError(removeState.error, t)}</Alert>}
        <TableContainer>
          <Table size="small" aria-label={t("admin.testAccounts.title", "Test accounts")}>
            <TableHead>
              <TableRow>
                <TableCell>{t("admin.testAccounts.username", "Username")}</TableCell>
                <TableCell>{t("admin.testAccounts.displayName", "Display name")}</TableCell>
                <TableCell>{t("admin.testAccounts.created", "Created")}</TableCell>
                <TableCell>{t("admin.testAccounts.lastLogin", "Last login")}</TableCell>
                <TableCell>{t("admin.testAccounts.failed24h", "Failed logins (24 h)")}</TableCell>
                <TableCell>{t("admin.testAccounts.status", "Status")}</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7}>{t("admin.testAccounts.loading", "Loading...")}</TableCell>
                </TableRow>
              )}
              {data?.accounts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>{t("admin.testAccounts.none", "No test accounts yet.")}</TableCell>
                </TableRow>
              )}
              {data?.accounts.map((a) => (
                <TableRow key={a.user_id}>
                  <TableCell sx={{ fontFamily: "monospace" }}>{a.username}</TableCell>
                  <TableCell>{a.display_name}</TableCell>
                  <TableCell>{new Date(a.created_at).toLocaleString()}</TableCell>
                  <TableCell>{a.last_login_at ? new Date(a.last_login_at).toLocaleString() : "-"}</TableCell>
                  <TableCell>{a.failed_logins_24h}</TableCell>
                  <TableCell>
                    {a.banned ? (
                      <Chip size="small" color="error" label={t("admin.testAccounts.disabled", "Disabled")} />
                    ) : a.has_authenticator ? (
                      <Chip size="small" color="success" label={t("admin.testAccounts.active", "Active")} />
                    ) : (
                      <Chip size="small" label={t("admin.testAccounts.noAuthenticator", "No authenticator")} />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" color="error" onClick={() => setConfirmDelete(a.username)}>
                      {t("admin.testAccounts.delete", "Delete")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <SecretDialog account={createState.data} session={session} onClose={() => createState.reset()} />

      <Dialog open={confirmDelete !== null} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>{t("admin.testAccounts.deleteTitle", "Delete {{username}}?", { username: confirmDelete })}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {t(
              "admin.testAccounts.deleteBody",
              "Deletes the test account with its test orgs, shops, listings and orders. Remove its entry from your secrets file too.",
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setConfirmDelete(null)}>
            {t("mfa.common.cancel", "Cancel")}
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={removeState.isLoading}
            onClick={async () => {
              const name = confirmDelete!
              setConfirmDelete(null)
              await remove({ username: name })
            }}
          >
            {t("admin.testAccounts.delete", "Delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
