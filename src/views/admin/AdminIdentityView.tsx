/**
 * Admin -> Identity: find an account by username, display name, Discord id,
 * Spectrum id or user id, see its identities, and fix identity conflicts.
 * Every change asks for a reason and a fresh two-factor code (the shared
 * baseQuery opens the code dialog on MFA_STEP_UP_REQUIRED and retries).
 * Linked identities never move: actions only remove or set a value on the
 * one account shown. See drafts/scmarket-identity-admin.md.
 */
import React, { useState } from "react"
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
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
import type { TFunction } from "i18next"
import { useSearchParams } from "react-router-dom"
import {
  useDeactivateIdentityUserMutation,
  useFixIdentitySpectrumMutation,
  useGetIdentityUserQuery,
  useReactivateIdentityUserMutation,
  useReleaseIdentityUsernameMutation,
  useSearchIdentityUsersQuery,
  useUnlinkIdentityDiscordMutation,
  type IdentityActionKind,
  type IdentityDetail,
  type IdentitySearchRow,
} from "../../store/api/v2/market"
import { describeMfaError } from "../../features/mfa/errors"
import { isSiteAdmin } from "../../util/siteRole"

export const REASON_MIN = 5
export const REASON_MAX = 500
const SPECTRUM_ID_RE = /^[0-9]{1,20}$/

type ActionId = "release" | "unlinkDiscord" | "spectrum" | "deactivate" | "reactivate"

function formatDate(value: string | null | undefined): string {
  return value ? new Date(value).toLocaleString() : "-"
}

export function kindLabel(kind: IdentityActionKind, t: TFunction): string {
  switch (kind) {
    case "username_released":
      return t("adminIdentity.kinds.username_released", "Username released")
    case "discord_unlinked":
      return t("adminIdentity.kinds.discord_unlinked", "Discord unlinked")
    case "spectrum_cleared":
      return t("adminIdentity.kinds.spectrum_cleared", "Spectrum link cleared")
    case "spectrum_set":
      return t("adminIdentity.kinds.spectrum_set", "Spectrum id set")
    case "account_deactivated":
      return t("adminIdentity.kinds.account_deactivated", "Account deactivated")
    case "account_reactivated":
      return t("adminIdentity.kinds.account_reactivated", "Account reactivated")
    case "discord_link_skipped":
      return t("adminIdentity.kinds.discord_link_skipped", "Discord not linked (held by another account)")
  }
}

function StatusChips(props: { user: IdentitySearchRow }) {
  const { user } = props
  const { t } = useTranslation()
  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
      {user.is_tombstone && <Chip size="small" label={t("adminIdentity.status.deleted", "Deleted")} />}
      {user.deletion_pending && (
        <Chip size="small" color="warning" label={t("adminIdentity.status.deletionPending", "Deletion pending")} />
      )}
      {user.banned && <Chip size="small" color="error" label={t("adminIdentity.status.deactivated", "Deactivated")} />}
      {user.is_test && <Chip size="small" label={t("adminIdentity.status.test", "Test account")} />}
      {isSiteAdmin(user) && <Chip size="small" color="info" label={t("adminIdentity.status.admin", "Site admin")} />}
      {user.rsi_confirmed && (
        <Chip size="small" color="success" label={t("adminIdentity.status.verified", "RSI verified")} />
      )}
    </Stack>
  )
}

/** A label (dull) over a value (bright: text.secondary is the bright colour in this theme). */
function Field(props: { label: string; value: React.ReactNode; testId?: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.primary">
        {props.label}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "break-all" }} data-testid={props.testId}>
        {props.value}
      </Typography>
    </Box>
  )
}

function ActionDialog(props: { action: ActionId | null; user: IdentityDetail; onClose: () => void; onDone: (kind: IdentityActionKind) => void }) {
  const { action, user, onClose, onDone } = props
  const { t } = useTranslation()
  const [reason, setReason] = useState("")
  const [allowNoLogin, setAllowNoLogin] = useState(false)
  const [spectrumMode, setSpectrumMode] = useState<"clear" | "set">("clear")
  const [spectrumId, setSpectrumId] = useState("")
  const [release, releaseState] = useReleaseIdentityUsernameMutation()
  const [unlink, unlinkState] = useUnlinkIdentityDiscordMutation()
  const [spectrum, spectrumState] = useFixIdentitySpectrumMutation()
  const [deactivate, deactivateState] = useDeactivateIdentityUserMutation()
  const [reactivate, reactivateState] = useReactivateIdentityUserMutation()

  const states = { release: releaseState, unlinkDiscord: unlinkState, spectrum: spectrumState, deactivate: deactivateState, reactivate: reactivateState }
  const state = action ? states[action] : null
  const trimmed = reason.trim()
  const reasonOk = trimmed.length >= REASON_MIN && trimmed.length <= REASON_MAX
  const spectrumOk = action !== "spectrum" || spectrumMode === "clear" || SPECTRUM_ID_RE.test(spectrumId.trim())
  const discordOnlyLogin =
    user.providers.some((p) => p.provider_type === "discord") &&
    !user.providers.some((p) => p.provider_type === "citizenid")
  const canSubmit = reasonOk && spectrumOk && !state?.isLoading && (action !== "unlinkDiscord" || !discordOnlyLogin || allowNoLogin)

  const close = () => {
    setReason("")
    setAllowNoLogin(false)
    setSpectrumMode("clear")
    setSpectrumId("")
    for (const s of Object.values(states)) s.reset()
    onClose()
  }

  const submit = async () => {
    if (!action || !canSubmit) return
    const userId = user.user_id
    const body = { reason: trimmed }
    const result =
      action === "release"
        ? await release({ userId, identityActionRequest: body })
        : action === "unlinkDiscord"
          ? await unlink({ userId, unlinkDiscordRequest: { ...body, allow_no_login: allowNoLogin } })
          : action === "spectrum"
            ? await spectrum({
                userId,
                spectrumFixRequest:
                  spectrumMode === "set"
                    ? { ...body, mode: "set", spectrum_user_id: spectrumId.trim() }
                    : { ...body, mode: "clear" },
              })
            : action === "deactivate"
              ? await deactivate({ userId, identityActionRequest: body })
              : await reactivate({ userId, identityActionRequest: body })
    if ("data" in result && result.data) {
      onDone(result.data.kind)
      close()
    }
  }

  const titles: Record<ActionId, string> = {
    release: t("adminIdentity.actions.releaseUsername", "Release username"),
    unlinkDiscord: t("adminIdentity.actions.unlinkDiscord", "Unlink Discord"),
    spectrum: t("adminIdentity.actions.fixSpectrum", "Fix Spectrum link"),
    deactivate: t("adminIdentity.actions.deactivate", "Deactivate account"),
    reactivate: t("adminIdentity.actions.reactivate", "Reactivate account"),
  }
  const bodies: Record<ActionId, string> = {
    release: t(
      "adminIdentity.dialog.releaseBody",
      "Renames {{username}} to a placeholder (user_xxxxxxxx) so the handle is free. Nothing else on the account changes. The user is notified and can get their own current RSI handle back with Sync handle.",
      { username: user.username },
    ),
    unlinkDiscord: t(
      "adminIdentity.dialog.unlinkBody",
      "Removes the Discord link and the legacy Discord id from this account so that Discord account can be used elsewhere. It is not moved to any other account.",
    ),
    spectrum: t(
      "adminIdentity.dialog.spectrumBody",
      "Clear removes the Spectrum id and the RSI verification. Set writes a Spectrum id that no other account holds; an id held elsewhere is never moved.",
    ),
    deactivate: t(
      "adminIdentity.dialog.deactivateBody",
      "The account can no longer log in or use API tokens, and its sessions end now.",
    ),
    reactivate: t("adminIdentity.dialog.reactivateBody", "The account can log in again."),
  }

  return (
    <Dialog open={action !== null} onClose={close} fullWidth maxWidth="sm">
      {action && (
        <>
          <DialogTitle>{titles[action]}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {bodies[action]}
              </Typography>
              {action === "unlinkDiscord" && discordOnlyLogin && (
                <Alert severity="warning">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={allowNoLogin}
                        onChange={(e) => setAllowNoLogin(e.target.checked)}
                        inputProps={{ "aria-label": t("adminIdentity.dialog.allowNoLogin", "Discord is the only login method. Leave the account without one.") }}
                      />
                    }
                    label={t("adminIdentity.dialog.allowNoLogin", "Discord is the only login method. Leave the account without one.")}
                  />
                </Alert>
              )}
              {action === "spectrum" && (
                <>
                  <RadioGroup
                    row
                    value={spectrumMode}
                    onChange={(e) => setSpectrumMode(e.target.value === "set" ? "set" : "clear")}
                  >
                    <FormControlLabel value="clear" control={<Radio />} label={t("adminIdentity.dialog.spectrumClear", "Clear")} />
                    <FormControlLabel value="set" control={<Radio />} label={t("adminIdentity.dialog.spectrumSet", "Set")} />
                  </RadioGroup>
                  {spectrumMode === "set" && (
                    <TextField
                      label={t("adminIdentity.dialog.spectrumId", "Spectrum id (digits)")}
                      value={spectrumId}
                      onChange={(e) => setSpectrumId(e.target.value)}
                      error={spectrumId !== "" && !SPECTRUM_ID_RE.test(spectrumId.trim())}
                      inputProps={{ "data-testid": "identity-spectrum-id", inputMode: "numeric", autoComplete: "off" }}
                    />
                  )}
                </>
              )}
              <TextField
                label={t("adminIdentity.dialog.reason", "Reason")}
                value={reason}
                onChange={(e) => setReason(e.target.value.slice(0, REASON_MAX))}
                multiline
                minRows={2}
                required
                helperText={t(
                  "adminIdentity.dialog.reasonHelp",
                  "Required, {{min}} to {{max}} characters. Kept in the audit log; the user never sees it.",
                  { min: REASON_MIN, max: REASON_MAX },
                )}
                inputProps={{ "data-testid": "identity-reason" }}
              />
              <Typography variant="caption" color="text.primary">
                {t("adminIdentity.dialog.stepUpNote", "You will be asked for a two-factor code if you haven't entered one in the last 10 minutes.")}
              </Typography>
              {state?.error && <Alert severity="error">{describeMfaError(state.error, t)}</Alert>}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button color="inherit" onClick={close}>
              {t("adminIdentity.dialog.cancel", "Cancel")}
            </Button>
            <Button
              variant="contained"
              color={action === "deactivate" ? "error" : "primary"}
              disabled={!canSubmit}
              onClick={submit}
              data-testid="identity-confirm"
            >
              {titles[action]}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  )
}

function UserPanel(props: { userId: string }) {
  const { t } = useTranslation()
  const { data: user, error, isLoading } = useGetIdentityUserQuery({ userId: props.userId })
  const [action, setAction] = useState<ActionId | null>(null)
  const [done, setDone] = useState<IdentityActionKind | null>(null)

  if (isLoading) return <Typography color="text.secondary">{t("adminIdentity.loading", "Loading...")}</Typography>
  if (error) return <Alert severity="error">{describeMfaError(error, t)}</Alert>
  if (!user) return null

  const locked = user.is_tombstone || user.is_test || isSiteAdmin(user)
  const hasDiscord = user.discord_provider_id !== null || user.discord_id_column !== null

  return (
    <Paper sx={{ p: 2 }} data-testid="identity-user-panel">
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography variant="h6" color="text.secondary">
            {user.username}
          </Typography>
          <StatusChips user={user} />
        </Stack>
        {done && (
          <Alert severity="success" onClose={() => setDone(null)}>
            {t("adminIdentity.done", "{{action}}: saved, audited and the user was notified.", { action: kindLabel(done, t) })}
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

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: 2 }}>
          <Field label={t("adminIdentity.detail.userId", "User id")} value={user.user_id} />
          <Field label={t("adminIdentity.detail.displayName", "Display name")} value={user.display_name} />
          <Field label={t("adminIdentity.detail.role", "Role")} value={user.role} />
          <Field label={t("adminIdentity.detail.spectrumId", "Spectrum id")} value={user.spectrum_user_id ?? "-"} />
          <Field
            label={t("adminIdentity.detail.discord", "Discord (linked)")}
            value={user.discord_provider_id ?? "-"}
            testId="identity-discord"
          />
          <Field
            label={t("adminIdentity.detail.discordColumn", "Discord (legacy column)")}
            value={
              user.discord_column_stale
                ? t("adminIdentity.detail.discordColumnStale", "{{id}} (stale: no matching link)", { id: user.discord_id_column })
                : (user.discord_id_column ?? "-")
            }
          />
          <Field label={t("adminIdentity.detail.created", "Created")} value={formatDate(user.created_at)} />
          <Field label={t("adminIdentity.detail.deletedAt", "Deletion requested")} value={formatDate(user.deleted_at)} />
          <Field label={t("adminIdentity.detail.deletionScheduled", "Deletion scheduled")} value={formatDate(user.deletion_scheduled_at)} />
        </Box>

        {user.username_twins.length > 0 && (
          <Alert severity="warning">
            {t("adminIdentity.detail.twins", "Other accounts with this username in a different case: {{names}}", {
              names: user.username_twins.map((tw) => tw.username).join(", "),
            })}
          </Alert>
        )}

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button variant="outlined" disabled={locked} onClick={() => setAction("release")}>
            {t("adminIdentity.actions.releaseUsername", "Release username")}
          </Button>
          <Button variant="outlined" disabled={locked || !hasDiscord} onClick={() => setAction("unlinkDiscord")}>
            {t("adminIdentity.actions.unlinkDiscord", "Unlink Discord")}
          </Button>
          <Button variant="outlined" disabled={locked} onClick={() => setAction("spectrum")}>
            {t("adminIdentity.actions.fixSpectrum", "Fix Spectrum link")}
          </Button>
          {user.banned ? (
            <Button variant="outlined" disabled={locked} onClick={() => setAction("reactivate")}>
              {t("adminIdentity.actions.reactivate", "Reactivate account")}
            </Button>
          ) : (
            <Button variant="outlined" color="error" disabled={locked} onClick={() => setAction("deactivate")}>
              {t("adminIdentity.actions.deactivate", "Deactivate account")}
            </Button>
          )}
        </Stack>

        <Typography variant="subtitle1" color="text.secondary">
          {t("adminIdentity.detail.providers", "Linked logins")}
        </Typography>
        <TableContainer>
          <Table size="small" aria-label={t("adminIdentity.detail.providers", "Linked logins")}>
            <TableHead>
              <TableRow>
                <TableCell>{t("adminIdentity.detail.providerType", "Provider")}</TableCell>
                <TableCell>{t("adminIdentity.detail.providerId", "Id")}</TableCell>
                <TableCell>{t("adminIdentity.detail.providerUsername", "Name at link time")}</TableCell>
                <TableCell>{t("adminIdentity.detail.linkedAt", "Linked")}</TableCell>
                <TableCell>{t("adminIdentity.detail.lastUsed", "Last login")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {user.providers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>{t("adminIdentity.detail.noProviders", "No linked logins.")}</TableCell>
                </TableRow>
              )}
              {user.providers.map((p) => (
                <TableRow key={p.provider_type}>
                  <TableCell>
                    {p.provider_type}
                    {p.is_primary && ` (${t("adminIdentity.detail.primary", "primary")})`}
                  </TableCell>
                  <TableCell sx={{ fontFamily: "monospace" }}>{p.provider_id}</TableCell>
                  <TableCell>{p.provider_username ?? "-"}</TableCell>
                  <TableCell>{formatDate(p.linked_at)}</TableCell>
                  <TableCell>{formatDate(p.last_used_at)}</TableCell>
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
            <Table size="small" aria-label={t("adminIdentity.detail.sessions", "Active sessions")}>
              <TableHead>
                <TableRow>
                  <TableCell>{t("adminIdentity.detail.sessionRefreshed", "Last refreshed")}</TableCell>
                  <TableCell>{t("adminIdentity.detail.sessionExpires", "Expires")}</TableCell>
                  <TableCell>{t("adminIdentity.detail.sessionAgent", "Browser")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {user.sessions.map((s) => (
                  <TableRow key={`${s.refreshed_at}-${s.expires_at}`}>
                    <TableCell>{formatDate(s.refreshed_at)}</TableCell>
                    <TableCell>{formatDate(s.expires_at)}</TableCell>
                    <TableCell sx={{ wordBreak: "break-all" }}>{s.user_agent ?? "-"}</TableCell>
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
            <Table size="small" aria-label={t("adminIdentity.detail.recent", "Recent identity changes")}>
              <TableHead>
                <TableRow>
                  <TableCell>{t("adminIdentity.detail.when", "When")}</TableCell>
                  <TableCell>{t("adminIdentity.detail.change", "Change")}</TableCell>
                  <TableCell>{t("adminIdentity.detail.by", "By")}</TableCell>
                  <TableCell>{t("adminIdentity.dialog.reason", "Reason")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {user.recent_actions.map((a) => (
                  <TableRow key={a.audit_log_id}>
                    <TableCell>{formatDate(a.created_at)}</TableCell>
                    <TableCell>{kindLabel(a.kind, t)}</TableCell>
                    <TableCell>{a.actor_username ?? "-"}</TableCell>
                    <TableCell sx={{ whiteSpace: "pre-wrap" }}>{a.reason ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Stack>
      <ActionDialog action={action} user={user} onClose={() => setAction(null)} onDone={setDone} />
    </Paper>
  )
}

export function AdminIdentityView() {
  const { t } = useTranslation()
  // ?q= prefills and runs the search (the profile menu's "Open in Admin -> Identity").
  const [searchParams] = useSearchParams()
  const initial = (searchParams.get("q") ?? "").trim().slice(0, 100)
  const [input, setInput] = useState(initial)
  const [query, setQuery] = useState(initial.length >= 2 ? initial : "")
  const [selected, setSelected] = useState<string | null>(null)
  const { data, error, isFetching } = useSearchIdentityUsersQuery({ q: query }, { skip: query.length < 2 })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = input.trim()
    if (q.length < 2) return
    setSelected(null)
    setQuery(q)
  }

  return (
    <Stack spacing={3}>
      <Alert severity="info">
        {t(
          "adminIdentity.intro",
          "Find an account and fix identity conflicts. Linked identities never move between accounts: each action removes or sets a value on this account only. Every change needs a reason and a fresh two-factor code, is written to the audit log and notifies the user.",
        )}
      </Alert>

      <Paper sx={{ p: 2 }}>
        <Box component="form" onSubmit={submit} noValidate>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "flex-start" }}>
            <TextField
              fullWidth
              label={t("adminIdentity.searchLabel", "Username, display name, Discord id, Spectrum id or user id")}
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 100))}
              inputProps={{ "data-testid": "identity-search", autoComplete: "off" }}
            />
            <Button type="submit" variant="contained" disabled={input.trim().length < 2} sx={{ mt: { sm: 1 } }}>
              {t("adminIdentity.search", "Search")}
            </Button>
          </Stack>
        </Box>
      </Paper>

      {error && <Alert severity="error">{describeMfaError(error, t)}</Alert>}

      {query.length >= 2 && (
        <Paper>
          <TableContainer>
            <Table size="small" aria-label={t("adminIdentity.results", "Search results")}>
              <TableHead>
                <TableRow>
                  <TableCell>{t("adminIdentity.columns.username", "Username")}</TableCell>
                  <TableCell>{t("adminIdentity.columns.displayName", "Display name")}</TableCell>
                  <TableCell>{t("adminIdentity.columns.discord", "Discord id")}</TableCell>
                  <TableCell>{t("adminIdentity.columns.spectrum", "Spectrum id")}</TableCell>
                  <TableCell>{t("adminIdentity.columns.status", "Status")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isFetching && (
                  <TableRow>
                    <TableCell colSpan={5}>{t("adminIdentity.loading", "Loading...")}</TableCell>
                  </TableRow>
                )}
                {!isFetching && data?.users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>{t("adminIdentity.noResults", "No accounts match.")}</TableCell>
                  </TableRow>
                )}
                {!isFetching &&
                  data?.users.map((u) => (
                    <TableRow
                      key={u.user_id}
                      hover
                      selected={u.user_id === selected}
                      onClick={() => setSelected(u.user_id)}
                      sx={{ cursor: "pointer" }}
                      data-testid={`identity-row-${u.user_id}`}
                    >
                      <TableCell sx={{ fontFamily: "monospace" }}>
                        <Button size="small" onClick={() => setSelected(u.user_id)} sx={{ textTransform: "none", p: 0, minWidth: 0 }}>
                          {u.username}
                        </Button>
                      </TableCell>
                      <TableCell>{u.display_name}</TableCell>
                      <TableCell sx={{ fontFamily: "monospace" }}>{u.discord_provider_id ?? u.discord_id_column ?? "-"}</TableCell>
                      <TableCell sx={{ fontFamily: "monospace" }}>{u.spectrum_user_id ?? "-"}</TableCell>
                      <TableCell>
                        <StatusChips user={u} />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {selected && <UserPanel key={selected} userId={selected} />}
    </Stack>
  )
}
