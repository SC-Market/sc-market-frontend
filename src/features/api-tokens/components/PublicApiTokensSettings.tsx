import React, { useState } from "react"
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material"
import {
  Add as AddIcon,
  Block as BlockIcon,
  ContentCopy as ContentCopyIcon,
} from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import {
  useCreatePublicApiTokenMutation,
  useGetPublicApiTokenOptionsQuery,
  useListPublicApiTokensQuery,
  useRevokePublicApiTokenMutation,
  type PublicApiTokenOptions,
  type PublicApiTokenSummary,
  type PublicTokenPreset,
} from "../../../store/api/v2/market"
import { HelpLink } from "../../help/components/HelpLink"

const PUBLIC_API_DOCS_URL = "https://api.sc-market.space/docs"
const EXPIRY_CHOICES = [30, 90, 180, 365]

/** i18n key part of a scope ("orders:write" -> "orders_write"). */
function scopeKey(scope: string): string {
  return scope.replace(/[^a-z_]/gi, "_")
}

/** The server's error message of a failed request, when it sent one. */
function serverMessage(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("data" in error)) {
    return undefined
  }
  const data = error.data
  if (typeof data !== "object" || data === null || !("error" in data)) {
    return undefined
  }
  const inner = data.error
  if (typeof inner !== "object" || inner === null || !("message" in inner)) {
    return undefined
  }
  return typeof inner.message === "string" ? inner.message : undefined
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString()
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString()
}

function StatusChip({ status }: { status: PublicApiTokenSummary["status"] }) {
  const { t } = useTranslation()
  const color =
    status === "active"
      ? "success"
      : status === "expired"
        ? "warning"
        : "default"
  return (
    <Chip
      size="small"
      color={color}
      variant={status === "active" ? "outlined" : "filled"}
      label={t(`settings.publicApi.status.${status}`)}
    />
  )
}

function TokenCard({
  token,
  onRevoke,
}: {
  token: PublicApiTokenSummary
  onRevoke: (token: PublicApiTokenSummary) => void
}) {
  const { t } = useTranslation()
  const active = token.status === "active"
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={1}
          mb={1}
        >
          <Box minWidth={0}>
            <Typography variant="h6" component="h4" noWrap>
              {token.name}
            </Typography>
            <Typography variant="body2" color="text.primary">
              {t(`settings.publicApi.presets.${token.preset}.name`)} · …
              {token.token_hint}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <StatusChip status={token.status} />
            {active && (
              <Tooltip title={t("settings.publicApi.revoke")}>
                <IconButton
                  size="small"
                  color="error"
                  aria-label={t("settings.publicApi.revoke")}
                  onClick={() => onRevoke(token)}
                >
                  <BlockIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {token.description && (
          <Typography variant="body2" color="text.secondary" mb={1}>
            {token.description}
          </Typography>
        )}

        <Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
          {token.scopes.map((scope) => (
            <Chip
              key={scope}
              size="small"
              variant="outlined"
              label={t(`settings.publicApi.scopes.${scopeKey(scope)}`)}
            />
          ))}
        </Box>

        <Typography variant="body2" color="text.secondary">
          {token.orgs.length
            ? t("settings.publicApi.orgsList", {
                orgs: token.orgs.map((o) => o.name).join(", "),
              })
            : t("settings.publicApi.orgsNone")}
        </Typography>
        <Typography variant="body2" color="text.primary">
          {token.status === "revoked" && token.revoked_at
            ? t("settings.publicApi.revokedOn", {
                date: formatDate(token.revoked_at),
              })
            : token.status === "expired"
              ? t("settings.publicApi.expiredOn", {
                  date: formatDate(token.expires_at),
                })
              : t("settings.publicApi.expiresOn", {
                  date: formatDate(token.expires_at),
                })}
        </Typography>
        <Typography variant="body2" color="text.primary">
          {token.last_used_at
            ? t("settings.publicApi.lastUsed", {
                date: formatDateTime(token.last_used_at),
              })
            : t("settings.publicApi.neverUsed")}
          {" · "}
          {t("settings.publicApi.requests30d", { n: token.requests_30d })}
        </Typography>
      </CardContent>
    </Card>
  )
}

function CreatePublicTokenDialog({
  open,
  options,
  onClose,
}: {
  open: boolean
  options: PublicApiTokenOptions
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [createToken, { isLoading }] = useCreatePublicApiTokenMutation()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [preset, setPreset] = useState<PublicTokenPreset | "">("")
  const [orgs, setOrgs] = useState<string[]>([])
  const [days, setDays] = useState(options.default_lifetime_days)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const choices = [
    ...new Set([...EXPIRY_CHOICES, options.default_lifetime_days]),
  ]
    .filter((d) => d <= options.max_lifetime_days)
    .sort((a, b) => a - b)

  const reset = () => {
    setName("")
    setDescription("")
    setPreset("")
    setOrgs([])
    setDays(options.default_lifetime_days)
    setError(null)
    setCreated(null)
    setCopied(false)
  }

  const close = () => {
    reset()
    onClose()
  }

  const submit = async () => {
    if (!preset) return
    setError(null)
    try {
      const result = await createToken({
        createPublicApiTokenRequest: {
          name: name.trim(),
          description: description.trim() || null,
          preset,
          org_spectrum_ids: orgs,
          expires_in_days: days,
        },
      }).unwrap()
      setCreated(result.token)
    } catch (e) {
      setError(serverMessage(e) ?? t("settings.publicApi.dialog.error"))
    }
  }

  const copy = async () => {
    if (!created) return
    await navigator.clipboard.writeText(created)
    setCopied(true)
  }

  if (created) {
    return (
      <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
        <DialogTitle>{t("settings.publicApi.created.title")}</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {t("settings.publicApi.created.warning")}
          </Alert>
          <TextField
            value={created}
            fullWidth
            InputProps={{ readOnly: true, sx: { fontFamily: "monospace" } }}
            onFocus={(e) => e.target.select()}
          />
        </DialogContent>
        <DialogActions>
          <Button startIcon={<ContentCopyIcon />} onClick={copy}>
            {copied
              ? t("settings.publicApi.created.copied")
              : t("settings.publicApi.created.copy")}
          </Button>
          <Button variant="contained" onClick={close}>
            {t("settings.publicApi.created.done")}
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  const valid = name.trim().length > 0 && name.trim().length <= 100 && !!preset

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle>{t("settings.publicApi.dialog.title")}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label={t("settings.publicApi.dialog.name")}
            helperText={t("settings.publicApi.dialog.nameHelp")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            inputProps={{ maxLength: 100 }}
            required
            fullWidth
          />
          <TextField
            label={t("settings.publicApi.dialog.description")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            inputProps={{ maxLength: 500 }}
            multiline
            minRows={2}
            fullWidth
          />

          <FormControl>
            <FormLabel>{t("settings.publicApi.dialog.preset")}</FormLabel>
            <RadioGroup
              value={preset}
              onChange={(e) => {
                const next = options.presets.find(
                  (p) => p.id === e.target.value,
                )
                if (next) setPreset(next.id)
              }}
            >
              {options.presets.map((p) => (
                <FormControlLabel
                  key={p.id}
                  value={p.id}
                  control={<Radio />}
                  label={
                    <Box py={0.5}>
                      <Typography color="text.secondary">
                        {t(`settings.publicApi.presets.${p.id}.name`)}
                      </Typography>
                      <Typography variant="body2" color="text.primary">
                        {t(`settings.publicApi.presets.${p.id}.description`)}
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                        {p.scopes.map((scope) => (
                          <Chip
                            key={scope}
                            size="small"
                            variant="outlined"
                            label={t(
                              `settings.publicApi.scopes.${scopeKey(scope)}`,
                            )}
                          />
                        ))}
                      </Box>
                    </Box>
                  }
                />
              ))}
            </RadioGroup>
          </FormControl>

          <FormControl>
            <FormLabel>{t("settings.publicApi.dialog.orgs")}</FormLabel>
            <Typography variant="body2" color="text.primary" mb={1}>
              {t("settings.publicApi.dialog.orgsHelp")}
            </Typography>
            {options.orgs.length === 0 ? (
              <Typography variant="body2" color="text.primary">
                {t("settings.publicApi.dialog.noOrgs")}
              </Typography>
            ) : (
              <FormGroup>
                {options.orgs.map((org) => (
                  <FormControlLabel
                    key={org.contractor_id}
                    control={
                      <Checkbox
                        checked={orgs.includes(org.spectrum_id)}
                        onChange={(e) =>
                          setOrgs((prev) =>
                            e.target.checked
                              ? [...prev, org.spectrum_id]
                              : prev.filter((id) => id !== org.spectrum_id),
                          )
                        }
                      />
                    }
                    label={org.name}
                  />
                ))}
              </FormGroup>
            )}
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="public-token-expiry">
              {t("settings.publicApi.dialog.expiry")}
            </InputLabel>
            <Select
              labelId="public-token-expiry"
              label={t("settings.publicApi.dialog.expiry")}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            >
              {choices.map((d) => (
                <MenuItem key={d} value={d}>
                  {t("settings.publicApi.dialog.daysOption", { days: d })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>{t("settings.publicApi.cancel")}</Button>
        <Button
          variant="contained"
          onClick={submit}
          disabled={!valid || isLoading}
        >
          {isLoading
            ? t("settings.publicApi.dialog.creating")
            : t("settings.publicApi.dialog.create")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

/**
 * Tokens for the public API (/api/public/v1): create from a preset with an
 * org grant and an expiry, see last use, revoke. The legacy token list stays
 * below it (ApiTokensSettings).
 */
export function PublicApiTokensSettings() {
  const { t } = useTranslation()
  const { data: options } = useGetPublicApiTokenOptionsQuery()
  const { data: list, isLoading, error } = useListPublicApiTokensQuery()
  const [revokeToken, { isLoading: revoking }] =
    useRevokePublicApiTokenMutation()
  const [createOpen, setCreateOpen] = useState(false)
  const [toRevoke, setToRevoke] = useState<PublicApiTokenSummary | null>(null)
  const [revokeError, setRevokeError] = useState<string | null>(null)

  const tokens = list?.tokens ?? []

  const confirmRevoke = async () => {
    if (!toRevoke) return
    setRevokeError(null)
    try {
      await revokeToken({ tokenId: toRevoke.id }).unwrap()
      setToRevoke(null)
    } catch (e) {
      setRevokeError(serverMessage(e) ?? t("settings.publicApi.revokeError"))
    }
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={1}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Typography variant="h5" component="h2">
              {t("settings.publicApi.title")}
            </Typography>
            <HelpLink guide="apiTokens" />
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
            disabled={!options}
          >
            {t("settings.publicApi.create")}
          </Button>
        </Box>
      </Grid>

      <Grid item xs={12}>
        <Alert severity="info">
          {t("settings.publicApi.intro")}{" "}
          <a href={PUBLIC_API_DOCS_URL} target="_blank" rel="noreferrer">
            {t("settings.publicApi.docsLink")}
          </a>
        </Alert>
      </Grid>

      {error ? (
        <Grid item xs={12}>
          <Alert severity="error">{t("settings.publicApi.loadError")}</Alert>
        </Grid>
      ) : isLoading ? null : tokens.length === 0 ? (
        <Grid item xs={12}>
          <Typography color="text.primary">
            {t("settings.publicApi.empty")}
          </Typography>
        </Grid>
      ) : (
        tokens.map((token) => (
          <Grid item xs={12} md={6} key={token.id}>
            <TokenCard token={token} onRevoke={setToRevoke} />
          </Grid>
        ))
      )}

      {options && (
        <CreatePublicTokenDialog
          open={createOpen}
          options={options}
          onClose={() => setCreateOpen(false)}
        />
      )}

      <Dialog open={!!toRevoke} onClose={() => setToRevoke(null)}>
        <DialogTitle>{t("settings.publicApi.revokeTitle")}</DialogTitle>
        <DialogContent>
          {revokeError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {revokeError}
            </Alert>
          )}
          <Typography>
            {t("settings.publicApi.revokeBody", { name: toRevoke?.name ?? "" })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToRevoke(null)}>
            {t("settings.publicApi.cancel")}
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirmRevoke}
            disabled={revoking}
          >
            {t("settings.publicApi.revoke")}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

/** Notice above the legacy token list; names the sunset date once one is set. */
export function LegacyTokensNotice() {
  const { t } = useTranslation()
  const { data: options } = useGetPublicApiTokenOptionsQuery()
  const sunset = options?.legacy_sunset_at
  return (
    <Alert severity={sunset ? "warning" : "info"}>
      {sunset
        ? t("settings.publicApi.legacy.sunset", { date: formatDate(sunset) })
        : t("settings.publicApi.legacy.notice")}
    </Alert>
  )
}
