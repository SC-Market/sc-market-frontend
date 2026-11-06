import { useState } from "react"
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material"
import {
  AddRounded as AddIcon,
  BlockRounded as BlockIcon,
} from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { ConfirmDialog } from "../../../components/dialog/ConfirmDialog"
import {
  useGetPublicApiTokenOptionsQuery,
  useListPublicApiTokensQuery,
  type PublicApiTokenSummary,
} from "../../../store/api/v2/market"
import { HelpLink } from "../../help/components/HelpLink"
import { useRevokePublicApiToken } from "../hooks/usePublicApiTokenActions"
import { useFormatters } from "../../../util/format"
import { CreatePublicTokenDialog, scopeKey } from "./CreatePublicTokenDialog"

const PUBLIC_API_DOCS_URL = "https://api.sc-market.space/docs"

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
  const fmt = useFormatters()
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
                date: fmt.date(token.revoked_at),
              })
            : token.status === "expired"
              ? t("settings.publicApi.expiredOn", {
                  date: fmt.date(token.expires_at),
                })
              : t("settings.publicApi.expiresOn", {
                  date: fmt.date(token.expires_at),
                })}
        </Typography>
        <Typography variant="body2" color="text.primary">
          {token.last_used_at
            ? t("settings.publicApi.lastUsed", {
                date: fmt.dateTime(token.last_used_at),
              })
            : t("settings.publicApi.neverUsed")}
          {" · "}
          {t("settings.publicApi.requests30d", { n: token.requests_30d })}
        </Typography>
      </CardContent>
    </Card>
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
  const { revoke: revokeToken, revoking } = useRevokePublicApiToken()
  const [createOpen, setCreateOpen] = useState(false)
  const [toRevoke, setToRevoke] = useState<PublicApiTokenSummary | null>(null)
  const [revokeError, setRevokeError] = useState<string | null>(null)

  const tokens = list?.tokens ?? []

  const confirmRevoke = async () => {
    if (!toRevoke) return
    setRevokeError(null)
    const failure = await revokeToken(toRevoke.id)
    if (failure) setRevokeError(failure)
    else setToRevoke(null)
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

      <ConfirmDialog
        open={!!toRevoke}
        onClose={() => setToRevoke(null)}
        onConfirm={confirmRevoke}
        title={t("settings.publicApi.revokeTitle")}
        message={t("settings.publicApi.revokeBody", {
          name: toRevoke?.name ?? "",
        })}
        cancelLabel={t("settings.publicApi.cancel")}
        confirmLabel={t("settings.publicApi.revoke")}
        destructive
        loading={revoking}
      >
        {revokeError && <Alert severity="error">{revokeError}</Alert>}
      </ConfirmDialog>
    </Grid>
  )
}

/** Notice above the legacy token list; names the sunset date once one is set. */
export function LegacyTokensNotice() {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const { data: options } = useGetPublicApiTokenOptionsQuery()
  const sunset = options?.legacy_sunset_at
  return (
    <Alert severity={sunset ? "warning" : "info"}>
      {sunset
        ? t("settings.publicApi.legacy.sunset", { date: fmt.date(sunset) })
        : t("settings.publicApi.legacy.notice")}
    </Alert>
  )
}
