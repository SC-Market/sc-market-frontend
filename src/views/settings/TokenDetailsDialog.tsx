import React, { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  Grid,
  Alert,
  IconButton,
  Tooltip,
  useMediaQuery,
} from "@mui/material"
import {
  ContentCopy as CopyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
  Business as BusinessIcon,
} from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import {
  useGetTokenStatsQuery,
  ApiToken,
  useGetContractorsForTokensQuery,
} from "../../store/tokens"
import { useGetUserProfileQuery } from "../../store/profile.ts"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { BottomSheet } from "../../components/mobile/BottomSheet"

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
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const { data: stats } = useGetTokenStatsQuery(token?.id || "", {
    skip: !token?.id,
  })
  const { data: profile } = useGetUserProfileQuery()
  const contractors = profile?.contractors || []

  const [showToken, setShowToken] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  const getExpiryStatus = (expiresAt?: string) => {
    if (!expiresAt)
      return {
        status: "never",
        color: "default" as const,
        text: "Never expires",
      }
    if (isExpired(expiresAt))
      return { status: "expired", color: "error" as const, text: "Expired" }

    const daysUntilExpiry = Math.ceil(
      (new Date(expiresAt).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24),
    )

    if (daysUntilExpiry <= 7)
      return {
        status: "soon",
        color: "warning" as const,
        text: `Expires in ${daysUntilExpiry} days`,
      }
    return {
      status: "valid",
      color: "success" as const,
      text: `Expires in ${daysUntilExpiry} days`,
    }
  }

  const getScopeColor = (scope: string) => {
    if (scope === "full") return "primary"
    if (scope === "readonly") return "info"
    if (scope.startsWith("contractors:")) return "secondary"
    return "default"
  }

  const copyTokenId = () => {
    if (token) {
      navigator.clipboard.writeText(token.id)
    }
  }

  if (!token) return null

  const expiryStatus = getExpiryStatus(token.expires_at)

  // Content to reuse in both Dialog and BottomSheet
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
              <Tooltip title="Copy Token ID">
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
              Token Information
            </Typography>
            <Grid container spacing={theme.layoutSpacing.layout}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Token ID:
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
                  Created:
                </Typography>
                <Typography variant="body2">
                  {formatDateTime(token.created_at)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Last Updated:
                </Typography>
                <Typography variant="body2">
                  {formatDateTime(token.updated_at)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Last Used:
                </Typography>
                <Typography variant="body2">
                  {token.last_used_at
                    ? formatDateTime(token.last_used_at)
                    : "Never"}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Expiration Status
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <ScheduleIcon fontSize="small" />
              <Chip
                label={expiryStatus.text}
                size="small"
                color={expiryStatus.color}
                variant={
                  expiryStatus.status === "expired" ? "filled" : "outlined"
                }
              />
            </Box>
            {token.expires_at && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Expires: {formatDateTime(token.expires_at)}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Permissions ({token.scopes.length} scopes)
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
              Contractor Access
            </Typography>
            <Typography variant="body2">
              {(token.contractor_spectrum_ids || []).length === 0
                ? "Access to all contractors"
                : `Access to ${(token.contractor_spectrum_ids || []).length} contractor(s)`}
            </Typography>
            {(token.contractor_spectrum_ids || []).length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Organizations:
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
                  Usage Statistics
                </Typography>
                <Grid container spacing={theme.layoutSpacing.layout}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Usage Count:
                    </Typography>
                    <Typography variant="body2">
                      {stats.usage_count || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Days Until Expiry:
                    </Typography>
                    <Typography variant="body2">
                      {stats.days_until_expiry || "N/A"}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Security Note:</strong> This token provides access to
                your account with the permissions shown above. Keep it secure
                and only share it with trusted applications.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
  )

  // On mobile, use BottomSheet
  if (isMobile) {
    return (
      <BottomSheet
        open={open}
        onClose={onClose}
        title="Token Details"
        maxHeight="90vh"
      >
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <SecurityIcon />
        </Box>
        {dialogContent}
        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={onClose}>Close</Button>
        </Box>
      </BottomSheet>
    )
  }

  // On desktop, use Dialog
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <SecurityIcon />
          Token Details
        </Box>
      </DialogTitle>
      <DialogContent>{dialogContent}</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
