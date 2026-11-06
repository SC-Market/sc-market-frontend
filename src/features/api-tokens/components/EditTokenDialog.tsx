import React, { useState, useEffect, useMemo } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Alert,
  Divider,
  Grid,
  Chip,
} from "@mui/material"
import { useIsMobile } from "../../../hooks/layout/useBreakpoint"
import { useTranslation } from "react-i18next"
import { ApiToken } from "../api/tokensApi"
import { useUpdateToken } from "../hooks/useTokenActions"
import { SCOPE_CATEGORIES, isAdminOnlyScope } from "../domain/scopes"
import { useGetUserProfileQuery } from "../../profile/api/profileApi"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { BottomSheet } from "../../../components/mobile/BottomSheet"
import { isSiteAdmin } from "../../../util/siteRole"

/** Catalog key for a scope's label: "market:read" -> "...labels.marketRead". */
const scopeLabelKey = (value: string) =>
  `apiTokensUi.scopes.labels.${value.replace(/:(\w)/g, (_, c: string) => c.toUpperCase())}`

interface EditTokenDialogProps {
  open: boolean
  onClose: () => void
  token: ApiToken | null
}

export function EditTokenDialog({
  open,
  onClose,
  token,
}: EditTokenDialogProps) {
  const { t } = useTranslation()
  const { update: updateToken, isLoading } = useUpdateToken()
  const { data: profile } = useGetUserProfileQuery()
  const contractors = useMemo(
    () => profile?.contractors || [],
    [profile?.contractors],
  )
  const isAdmin = isSiteAdmin(profile)

  // Filter scopes based on user role - admins can see all, non-admins can't see admin/moderation scopes
  const allScopes = Object.values(SCOPE_CATEGORIES).flatMap((cat) =>
    cat.scopes.map((s) => s.value),
  )
  const availableScopes: string[] = isAdmin
    ? allScopes
    : allScopes.filter((scope) => !isAdminOnlyScope(scope))

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    scopes: [] as string[],
    contractor_spectrum_ids: [] as string[],
    expires_at: "",
  })

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (token) {
      // Convert contractor_spectrum_ids to spectrum_ids for display
      const contractorSpectrumIds =
        token.contractor_spectrum_ids?.length > 0
          ? contractors
              ?.filter((c) =>
                token.contractor_spectrum_ids?.includes(c.spectrum_id),
              )
              .map((c) => c.spectrum_id) || []
          : []

      // Filter out admin/moderation scopes for non-admin users
      const scopesToShow = isAdmin
        ? token.scopes
        : token.scopes.filter((scope: string) => !isAdminOnlyScope(scope))

      setFormData({
        name: token.name,
        description: token.description || "",
        scopes: scopesToShow,
        contractor_spectrum_ids: contractorSpectrumIds,
        expires_at: token.expires_at
          ? new Date(token.expires_at).toISOString().slice(0, 16)
          : "",
      })
    }
  }, [token, contractors, isAdmin])

  const handleScopeChange = (scope: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      scopes: checked
        ? [...prev.scopes, scope]
        : prev.scopes.filter((s) => s !== scope),
    }))
  }

  const handleContractorChange = (spectrumId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      contractor_spectrum_ids: checked
        ? [...prev.contractor_spectrum_ids, spectrumId]
        : prev.contractor_spectrum_ids.filter((id) => id !== spectrumId),
    }))
  }

  const handleSubmit = async () => {
    if (!token) return

    setError(null)
    // Convert spectrum IDs to contractor IDs
    const contractorIds =
      formData.contractor_spectrum_ids.length > 0
        ? contractors
            ?.filter((c) =>
              formData.contractor_spectrum_ids.includes(c.spectrum_id),
            )
            .map((c) => c.spectrum_id) || []
        : []

    const failure = await updateToken(token.id, {
      name: formData.name,
      description: formData.description || undefined,
      scopes: formData.scopes,
      contractor_spectrum_ids: contractorIds,
      expires_at: formData.expires_at || undefined,
    })
    if (failure) setError(failure)
    else onClose()
  }

  const handleClose = () => {
    setError(null)
    onClose()
  }

  const isFormValid = formData.name.trim() && formData.scopes.length > 0
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useIsMobile()

  if (!token) return null

  // Content to reuse
  const dialogContent = (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={theme.layoutSpacing.layout}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t("apiTokensUi.form.tokenName")}
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            required
            helperText={t("apiTokensUi.form.tokenNameHelp")}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t("apiTokensUi.form.description")}
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            multiline
            rows={2}
            helperText={t("apiTokensUi.form.descriptionHelp")}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            {t("apiTokensUi.form.permissionsTitle")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("apiTokensUi.form.permissionsHelp")}
          </Typography>

          {Object.entries(SCOPE_CATEGORIES).map(([category, { scopes }]) => {
            // Filter scopes based on availability only (no showing admin scopes to non-admins)
            const filteredScopes = scopes.filter((scope) =>
              availableScopes.includes(scope.value),
            )

            // Don't render category if no scopes are available
            if (filteredScopes.length === 0) return null

            return (
              <Box key={category} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {t(`apiTokensUi.scopes.categories.${category}`)}
                  {!isAdmin &&
                    (category === "admin" || category === "moderation") && (
                      <Chip
                        label={t("apiTokensUi.form.adminOnly")}
                        size="small"
                        color="warning"
                        sx={{ ml: 1 }}
                      />
                    )}
                </Typography>
                <FormGroup>
                  {filteredScopes.map(({ value }) => (
                    <FormControlLabel
                      key={value}
                      control={
                        <Checkbox
                          checked={formData.scopes.includes(value)}
                          onChange={(e) =>
                            handleScopeChange(value, e.target.checked)
                          }
                        />
                      }
                      label={t(scopeLabelKey(value))}
                    />
                  ))}
                </FormGroup>
                <Divider sx={{ mt: 1 }} />
              </Box>
            )
          })}
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            {t("apiTokensUi.edit.contractorAccessTitle")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("apiTokensUi.edit.contractorAccessHelp")}
          </Typography>

          {contractors && contractors.length > 0 ? (
            <FormGroup>
              {contractors.map((contractor) => (
                <FormControlLabel
                  key={contractor.spectrum_id}
                  control={
                    <Checkbox
                      checked={formData.contractor_spectrum_ids.includes(
                        contractor.spectrum_id,
                      )}
                      onChange={(e) =>
                        handleContractorChange(
                          contractor.spectrum_id,
                          e.target.checked,
                        )
                      }
                    />
                  }
                  label={`${contractor.name} (${contractor.spectrum_id})`}
                />
              ))}
            </FormGroup>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t("apiTokensUi.form.noContractors")}
            </Typography>
          )}
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t("apiTokensUi.form.expiration")}
            type="datetime-local"
            value={formData.expires_at}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, expires_at: e.target.value }))
            }
            InputLabelProps={{
              shrink: true,
            }}
            helperText={t("apiTokensUi.form.expirationHelp")}
          />
        </Grid>
      </Grid>
    </>
  )

  const dialogActions = (
    <>
      <Button onClick={handleClose}>{t("common.cancel")}</Button>
      <Button
        onClick={handleSubmit}
        variant="contained"
        disabled={!isFormValid || isLoading}
      >
        {isLoading
          ? t("apiTokensUi.edit.updating")
          : t("apiTokensUi.edit.submit")}
      </Button>
    </>
  )

  // On mobile, use BottomSheet
  if (isMobile) {
    return (
      <BottomSheet
        open={open}
        onClose={handleClose}
        title={t("apiTokensUi.edit.title")}
        maxHeight="90vh"
      >
        {dialogContent}
        <Box
          sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}
        >
          {dialogActions}
        </Box>
      </BottomSheet>
    )
  }

  // On desktop, use Dialog
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{t("apiTokensUi.edit.title")}</DialogTitle>
      <DialogContent>{dialogContent}</DialogContent>
      <DialogActions>{dialogActions}</DialogActions>
    </Dialog>
  )
}
