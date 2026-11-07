import { useState } from "react"
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import {
  useGetIdentityUserQuery,
  type IdentityActionKind,
} from "../../store/api/v2/market"
import { describeMfaError } from "../../features/mfa/errors"
import { isSiteAdmin } from "../../util/siteRole"
import { useFormatters } from "../../util/format"
import { kindLabel } from "./identityShared"
import { ActionDialog, ActionId } from "./IdentityActionDialog"
import { StatusChips, Field, formatDate } from "./IdentityStatusChips"

export function UserPanel(props: { userId: string }) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const {
    data: user,
    error,
    isLoading,
  } = useGetIdentityUserQuery({ userId: props.userId })
  const [action, setAction] = useState<ActionId | null>(null)
  const [done, setDone] = useState<IdentityActionKind | null>(null)

  if (isLoading)
    return (
      <Typography color="text.secondary">
        {t("adminIdentity.loading", "Loading...")}
      </Typography>
    )
  if (error) return <Alert severity="error">{describeMfaError(error, t)}</Alert>
  if (!user) return null

  const locked = user.is_tombstone || user.is_test || isSiteAdmin(user)
  const hasDiscord =
    user.discord_provider_id !== null || user.discord_id_column !== null

  return (
    <Paper sx={{ p: 2 }} data-testid="identity-user-panel">
      <Stack spacing={2}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
        >
          <Typography variant="h6" color="text.secondary">
            {user.username}
          </Typography>
          <StatusChips user={user} />
        </Stack>
        {done && (
          <Alert severity="success" onClose={() => setDone(null)}>
            {t(
              "adminIdentity.done",
              "{{action}}: saved, audited and the user was notified.",
              { action: kindLabel(done, t) },
            )}
          </Alert>
        )}
        {locked && (
          <Alert severity="info">
            {t(
              "adminIdentity.locked",
              "Deleted accounts, test accounts and site admins can't be changed here.",
            )}
          </Alert>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "1fr 1fr 1fr",
            },
            gap: 2,
          }}
        >
          <Field
            label={t("adminIdentity.detail.userId", "User id")}
            value={user.user_id}
          />
          <Field
            label={t("adminIdentity.detail.displayName", "Display name")}
            value={user.display_name}
          />
          <Field
            label={t("adminIdentity.detail.role", "Role")}
            value={user.role}
          />
          <Field
            label={t("adminIdentity.detail.spectrumId", "Spectrum id")}
            value={user.spectrum_user_id ?? "-"}
          />
          <Field
            label={t("adminIdentity.detail.discord", "Discord (linked)")}
            value={user.discord_provider_id ?? "-"}
            testId="identity-discord"
          />
          <Field
            label={t(
              "adminIdentity.detail.discordColumn",
              "Discord (legacy column)",
            )}
            value={
              user.discord_column_stale
                ? t(
                    "adminIdentity.detail.discordColumnStale",
                    "{{id}} (stale: no matching link)",
                    { id: user.discord_id_column },
                  )
                : (user.discord_id_column ?? "-")
            }
          />
          <Field
            label={t("adminIdentity.detail.created", "Created")}
            value={formatDate(user.created_at, fmt)}
          />
          <Field
            label={t("adminIdentity.detail.deletedAt", "Deletion requested")}
            value={formatDate(user.deleted_at, fmt)}
          />
          <Field
            label={t(
              "adminIdentity.detail.deletionScheduled",
              "Deletion scheduled",
            )}
            value={formatDate(user.deletion_scheduled_at, fmt)}
          />
        </Box>

        {user.username_twins.length > 0 && (
          <Alert severity="warning">
            {t(
              "adminIdentity.detail.twins",
              "Other accounts with this username in a different case: {{names}}",
              {
                names: user.username_twins.map((tw) => tw.username).join(", "),
              },
            )}
          </Alert>
        )}

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            variant="outlined"
            disabled={locked}
            onClick={() => setAction("release")}
          >
            {t("adminIdentity.actions.releaseUsername", "Release username")}
          </Button>
          <Button
            variant="outlined"
            disabled={locked || !hasDiscord}
            onClick={() => setAction("unlinkDiscord")}
          >
            {t("adminIdentity.actions.unlinkDiscord", "Unlink Discord")}
          </Button>
          <Button
            variant="outlined"
            disabled={locked}
            onClick={() => setAction("spectrum")}
          >
            {t("adminIdentity.actions.fixSpectrum", "Fix Spectrum link")}
          </Button>
          {user.banned ? (
            <Button
              variant="outlined"
              disabled={locked}
              onClick={() => setAction("reactivate")}
            >
              {t("adminIdentity.actions.reactivate", "Reactivate account")}
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="error"
              disabled={locked}
              onClick={() => setAction("deactivate")}
            >
              {t("adminIdentity.actions.deactivate", "Deactivate account")}
            </Button>
          )}
        </Stack>

        <Typography variant="subtitle1" color="text.secondary">
          {t("adminIdentity.detail.providers", "Linked logins")}
        </Typography>
        <TableContainer>
          <Table
            size="small"
            aria-label={t("adminIdentity.detail.providers", "Linked logins")}
          >
            <TableHead>
              <TableRow>
                <TableCell>
                  {t("adminIdentity.detail.providerType", "Provider")}
                </TableCell>
                <TableCell>
                  {t("adminIdentity.detail.providerId", "Id")}
                </TableCell>
                <TableCell>
                  {t(
                    "adminIdentity.detail.providerUsername",
                    "Name at link time",
                  )}
                </TableCell>
                <TableCell>
                  {t("adminIdentity.detail.linkedAt", "Linked")}
                </TableCell>
                <TableCell>
                  {t("adminIdentity.detail.lastUsed", "Last login")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {user.providers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    {t("adminIdentity.detail.noProviders", "No linked logins.")}
                  </TableCell>
                </TableRow>
              )}
              {user.providers.map((p) => (
                <TableRow key={p.provider_type}>
                  <TableCell>
                    {p.provider_type}
                    {p.is_primary &&
                      ` (${t("adminIdentity.detail.primary", "primary")})`}
                  </TableCell>
                  <TableCell sx={{ fontFamily: "monospace" }}>
                    {p.provider_id}
                  </TableCell>
                  <TableCell>{p.provider_username ?? "-"}</TableCell>
                  <TableCell>{formatDate(p.linked_at, fmt)}</TableCell>
                  <TableCell>{formatDate(p.last_used_at, fmt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="subtitle1" color="text.secondary">
          {t("adminIdentity.detail.sessions", "Active sessions")}
        </Typography>
        {user.sessions.length === 0 ? (
          <Typography variant="body2" color="text.primary">
            {t("adminIdentity.detail.noSessions", "No active sessions.")}
          </Typography>
        ) : (
          <TableContainer>
            <Table
              size="small"
              aria-label={t("adminIdentity.detail.sessions", "Active sessions")}
            >
              <TableHead>
                <TableRow>
                  <TableCell>
                    {t(
                      "adminIdentity.detail.sessionRefreshed",
                      "Last refreshed",
                    )}
                  </TableCell>
                  <TableCell>
                    {t("adminIdentity.detail.sessionExpires", "Expires")}
                  </TableCell>
                  <TableCell>
                    {t("adminIdentity.detail.sessionAgent", "Browser")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {user.sessions.map((s) => (
                  <TableRow key={`${s.refreshed_at}-${s.expires_at}`}>
                    <TableCell>{formatDate(s.refreshed_at, fmt)}</TableCell>
                    <TableCell>{formatDate(s.expires_at, fmt)}</TableCell>
                    <TableCell sx={{ wordBreak: "break-all" }}>
                      {s.user_agent ?? "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Typography variant="subtitle1" color="text.secondary">
          {t("adminIdentity.detail.recent", "Recent identity changes")}
        </Typography>
        {user.recent_actions.length === 0 ? (
          <Typography variant="body2" color="text.primary">
            {t("adminIdentity.detail.noRecent", "None.")}
          </Typography>
        ) : (
          <TableContainer>
            <Table
              size="small"
              aria-label={t(
                "adminIdentity.detail.recent",
                "Recent identity changes",
              )}
            >
              <TableHead>
                <TableRow>
                  <TableCell>
                    {t("adminIdentity.detail.when", "When")}
                  </TableCell>
                  <TableCell>
                    {t("adminIdentity.detail.change", "Change")}
                  </TableCell>
                  <TableCell>{t("adminIdentity.detail.by", "By")}</TableCell>
                  <TableCell>
                    {t("adminIdentity.dialog.reason", "Reason")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {user.recent_actions.map((a) => (
                  <TableRow key={a.audit_log_id}>
                    <TableCell>{formatDate(a.created_at, fmt)}</TableCell>
                    <TableCell>{kindLabel(a.kind, t)}</TableCell>
                    <TableCell>{a.actor_username ?? "-"}</TableCell>
                    <TableCell sx={{ whiteSpace: "pre-wrap" }}>
                      {a.reason ?? "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Stack>
      <ActionDialog
        action={action}
        user={user}
        onClose={() => setAction(null)}
        onDone={setDone}
      />
    </Paper>
  )
}
