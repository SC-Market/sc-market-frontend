import React, { useState } from "react"
import {
  Alert,
  Box,
  Button,
  Chip,
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
import { ConfirmDialog } from "../../components/dialog/ConfirmDialog"
import { useTranslation } from "react-i18next"
import { useListTestAccountsQuery } from "../../store/api/v2/market"
import { describeMfaError } from "../../features/mfa/errors"
import { useTestAccountActions } from "../../features/admin/hooks/useTestAccountActions"
import { type TestAccountCredential } from "../../util/testAccountCredentials"
import { useFormatters } from "../../util/format"
import DeleteRounded from "@mui/icons-material/DeleteRounded"
import { SecretDialog } from "./TestAccountSecretDialog"

const USERNAME_RE = /^~?test[a-z0-9_-]{2,36}$/i

export function AdminTestAccountsView() {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const { data, error, isLoading } = useListTestAccountsQuery()
  const { create, createState, remove, removeState } = useTestAccountActions()
  const [username, setUsername] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  // Accounts created on this page since it loaded, for "Download all". Only in
  // this component's state: gone on reload, never stored or sent anywhere.
  const [session, setSession] = useState<TestAccountCredential[]>([])

  const validUsername = USERNAME_RE.test(username.trim())
  const canCreate =
    validUsername && displayName.trim().length > 0 && !createState.isLoading

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canCreate) return
    const c = await create(username, displayName)
    if (c) {
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
        <Alert
          severity={data.login_enabled ? "warning" : "success"}
          data-testid="test-login-status"
        >
          {data.login_enabled
            ? t(
                "admin.testAccounts.loginOn",
                "Test login is ON (TEST_LOGIN_ENABLED=true). Unset it to switch test login off.",
              )
            : t(
                "admin.testAccounts.loginOff",
                "Test login is OFF. Accounts can be created, but nobody can sign into them until TEST_LOGIN_ENABLED=true is set.",
              )}
        </Alert>
      )}

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {t("admin.testAccounts.create", "Create a test account")}
        </Typography>
        <Box component="form" onSubmit={submit} noValidate>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ sm: "flex-start" }}
          >
            <TextField
              label={t("admin.testAccounts.username", "Username")}
              value={username}
              onChange={(e) => {
                createState.reset()
                setUsername(e.target.value)
              }}
              error={username !== "" && !validUsername}
              helperText={t(
                "admin.testAccounts.usernameHelp",
                '"test" + a name, e.g. test-buyer; saved as ~test-buyer',
              )}
              inputProps={{
                "data-testid": "test-account-username",
                autoComplete: "off",
              }}
            />
            <TextField
              label={t("admin.testAccounts.displayName", "Display name")}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value.slice(0, 100))}
              inputProps={{
                "data-testid": "test-account-display-name",
                autoComplete: "off",
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={!canCreate}
              sx={{ mt: { sm: 1 } }}
            >
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
        {removeState.error && (
          <Alert severity="error">
            {describeMfaError(removeState.error, t)}
          </Alert>
        )}
        <TableContainer>
          <Table
            size="small"
            aria-label={t("admin.testAccounts.title", "Test accounts")}
          >
            <TableHead>
              <TableRow>
                <TableCell>
                  {t("admin.testAccounts.username", "Username")}
                </TableCell>
                <TableCell>
                  {t("admin.testAccounts.displayName", "Display name")}
                </TableCell>
                <TableCell>
                  {t("admin.testAccounts.created", "Created")}
                </TableCell>
                <TableCell>
                  {t("admin.testAccounts.lastLogin", "Last login")}
                </TableCell>
                <TableCell>
                  {t("admin.testAccounts.failed24h", "Failed logins (24 h)")}
                </TableCell>
                <TableCell>
                  {t("admin.testAccounts.status", "Status")}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7}>
                    {t("admin.testAccounts.loading", "Loading...")}
                  </TableCell>
                </TableRow>
              )}
              {data?.accounts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    {t("admin.testAccounts.none", "No test accounts yet.")}
                  </TableCell>
                </TableRow>
              )}
              {data?.accounts.map((a) => (
                <TableRow key={a.user_id}>
                  <TableCell sx={{ fontFamily: "monospace" }}>
                    {a.username}
                  </TableCell>
                  <TableCell>{a.display_name}</TableCell>
                  <TableCell>{fmt.dateTime(a.created_at)}</TableCell>
                  <TableCell>
                    {a.last_login_at ? fmt.dateTime(a.last_login_at) : "-"}
                  </TableCell>
                  <TableCell>{a.failed_logins_24h}</TableCell>
                  <TableCell>
                    {a.banned ? (
                      <Chip
                        size="small"
                        color="error"
                        label={t("admin.testAccounts.disabled", "Disabled")}
                      />
                    ) : a.has_authenticator ? (
                      <Chip
                        size="small"
                        color="success"
                        label={t("admin.testAccounts.active", "Active")}
                      />
                    ) : (
                      <Chip
                        size="small"
                        label={t(
                          "admin.testAccounts.noAuthenticator",
                          "No authenticator",
                        )}
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      color="error"
                      onClick={() => setConfirmDelete(a.username)}
                      startIcon={<DeleteRounded />}
                    >
                      {t("admin.testAccounts.delete", "Delete")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <SecretDialog
        account={createState.data}
        session={session}
        onClose={() => createState.reset()}
      />

      <ConfirmDialog
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        title={t("admin.testAccounts.deleteTitle", "Delete {{username}}?", {
          username: confirmDelete,
        })}
        message={t(
          "admin.testAccounts.deleteBody",
          "Deletes the test account with its test orgs, shops, listings and orders. Remove its entry from your secrets file too.",
        )}
        cancelLabel={t("mfa.common.cancel", "Cancel")}
        confirmLabel={t("admin.testAccounts.delete", "Delete")}
        destructive
        confirmDisabled={removeState.isLoading}
        onConfirm={async () => {
          const name = confirmDelete!
          setConfirmDelete(null)
          await remove(name)
        }}
      />
    </Stack>
  )
}
