import React from "react"
import {
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  Grid,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material"
import {
  ContentCopyRounded as CopyIcon,
  ScheduleRounded as ScheduleIcon,
  SecurityRounded as SecurityIcon,
  BusinessRounded as BusinessIcon,
} from "@mui/icons-material"
import { Trans, useTranslation } from "react-i18next"
import { useGetTokenStatsQuery, ApiToken } from "../api/tokensApi"
import { useGetUserProfileQuery } from "../../profile/api/profileApi"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { ResponsiveDialog } from "../../../components/dialog/ResponsiveDialog"
import { useFormatters, useNow } from "../../../util/format"

interface TokenDetailsDialogProps {
  open: boolean
  onClose: () => void
  token: ApiToken | null
}

export function TokenDetailsDialog({
  open,
  onClose,
  token,
}: TokenDetailsDialogProps) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const now = useNow()
  const theme = useTheme<ExtendedTheme>()
  const { data: stats } = useGetTokenStatsQuery(token?.id || "", {
    skip: !token?.id,
  })
  const { data: profile } = useGetUserProfileQuery()
  const contractors = profile?.contractors || []

  const formatDateTime = (dateString: string) => fmt.dateTime(dateString)

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false
    return new Date(expiresAt).getTime() < now
  }

  const getExpiryStatus = (expiresAt?: string) => {
    if (!expiresAt)
      return {
        status: "never",
        color: "default" as const,
        text: t("apiTokensUi.details.neverExpires"),
      }
    if (isExpired(expiresAt))
      return {
        status: "expired",
        color: "error" as const,
        text: t("apiTokensUi.status.expired"),
      }

    const daysUntilExpiry = Math.ceil(
      (new Date(expiresAt).getTime() - now) / (1000 * 60 * 60 * 24),
    )

    if (daysUntilExpiry <= 7)
      return {
        status: "soon",
        color: "warning" as const,
        text: t("apiTokensUi.details.expiresInDays", {
          count: daysUntilExpiry,
        }),
      }
    return {
      status: "valid",
      color: "success" as const,
      text: t("apiTokensUi.details.expiresInDays", { count: daysUntilExpiry }),
    }
  }

  const getScopeColor = (scope: string) => {
    if (scope === "full") return "primary"
    if (scope === "readonly") return "info"
    return "default"
  }

  const copyTokenId = () => {
    if (token) {
      navigator.clipboard.writeText(token.id)
    }
  }

  if (!token) return null

  const expiryStatus = getExpiryStatus(token.expires_at)

  // Dialog content
  const dialogContent = (
    <Grid container spacing={theme.layoutSpacing.layout}>
      <Grid item xs={12}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography variant="h6">{token.name}</Typography>
          <Tooltip title={t("apiTokensUi.details.copyTokenId")}>
            <IconButton size="small" onClick={copyTokenId}>
              <CopyIcon />
            </IconButton>
          </Tooltip>
        </Box>
        {token.description && (
          <Typography variant="body2" color="text.secondary">
            {token.description}
          </Typography>
        )}
      </Grid>

      <Grid item xs={12}>
        <Divider />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          {t("apiTokensUi.details.tokenInfo")}
        </Typography>
        <Grid container spacing={theme.layoutSpacing.layout}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              {t("apiTokensUi.details.tokenId")}
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}
            >
              {token.id}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              {t("apiTokensUi.details.created")}
            </Typography>
            <Typography variant="body2">
              {formatDateTime(token.created_at)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              {t("apiTokensUi.details.lastUpdated")}
            </Typography>
            <Typography variant="body2">
              {formatDateTime(token.updated_at)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              {t("apiTokensUi.details.lastUsed")}
            </Typography>
            <Typography variant="body2">
              {token.last_used_at
                ? formatDateTime(token.last_used_at)
                : t("apiTokensUi.details.never")}
            </Typography>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          {t("apiTokensUi.details.expirationStatus")}
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <ScheduleIcon fontSize="small" />
          <Chip
            label={expiryStatus.text}
            size="small"
            color={expiryStatus.color}
            variant={expiryStatus.status === "expired" ? "filled" : "outlined"}
          />
        </Box>
        {token.expires_at && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t("apiTokensUi.details.expiresOn", {
              date: formatDateTime(token.expires_at),
            })}
          </Typography>
        )}
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          {t("apiTokensUi.details.permissionsCount", {
            count: token.scopes.length,
          })}
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={0.5}>
          {token.scopes.map((scope) => (
            <Chip
              key={scope}
              label={scope}
              size="small"
              color={getScopeColor(scope)}
              variant="outlined"
            />
          ))}
        </Box>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          <BusinessIcon sx={{ verticalAlign: "middle", mr: 1 }} />
          {t("apiTokensUi.form.orgAccessTitle")}
        </Typography>
        <Typography variant="body2">
          {(token.contractor_spectrum_ids || []).length > 0
            ? t("apiTokensUi.details.restrictedToOrgs", {
                count: (token.contractor_spectrum_ids || []).length,
              })
            : (token.scopes || []).some((s) => s === "full" || s === "admin")
              ? t("apiTokensUi.details.allOrgs")
              : t("apiTokensUi.details.noOrgs")}
        </Typography>
        {(token.contractor_spectrum_ids || []).length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {t("apiTokensUi.details.organizations")}
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={0.5} sx={{ mt: 0.5 }}>
              {(token.contractor_spectrum_ids || []).map((contractorId) => {
                // Find contractor by spectrum_id
                const contractor = contractors?.find(
                  (c) => c.spectrum_id === contractorId,
                )
                return (
                  <Chip
                    key={contractorId}
                    label={
                      contractor
                        ? `${contractor.name} (${contractor.spectrum_id})`
                        : contractorId
                    }
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: "0.7rem" }}
                  />
                )
              })}
            </Box>
          </Box>
        )}
      </Grid>

      {stats && (
        <>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              {t("apiTokensUi.details.usageStats")}
            </Typography>
            <Grid container spacing={theme.layoutSpacing.layout}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  {t("apiTokensUi.details.lastUsed")}
                </Typography>
                <Typography variant="body2">
                  {stats.last_used_at
                    ? formatDateTime(stats.last_used_at)
                    : t("apiTokensUi.details.never")}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </>
      )}

      <Grid item xs={12}>
        <Alert severity="info">
          <Typography variant="body2" gutterBottom>
            <Trans
              i18nKey="apiTokensUi.details.howToAuth"
              components={{ strong: <strong />, code: <code /> }}
            />
          </Typography>
          <Box
            component="pre"
            sx={{
              fontFamily: "monospace",
              fontSize: "0.8rem",
              bgcolor: "action.hover",
              p: 1,
              borderRadius: 1,
              overflow: "auto",
              mt: 0.5,
            }}
          >
            Authorization: Bearer{" "}
            {t("apiTokensUi.details.yourTokenPlaceholder")}
          </Box>
        </Alert>
      </Grid>

      <Grid item xs={12}>
        <Alert severity="info">
          <Typography variant="body2">
            <Trans
              i18nKey="apiTokensUi.details.securityNote"
              components={{ strong: <strong /> }}
            />
          </Typography>
        </Alert>
      </Grid>
    </Grid>
  )

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      title={
        <Box component="span" display="flex" alignItems="center" gap={1}>
          <SecurityIcon />
          {t("apiTokensUi.details.title")}
        </Box>
      }
      actions={<Button onClick={onClose}>{t("apiTokensUi.close")}</Button>}
    >
      {dialogContent}
    </ResponsiveDialog>
  )
}
