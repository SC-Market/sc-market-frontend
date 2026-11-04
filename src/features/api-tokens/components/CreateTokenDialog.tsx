import React, { useState } from "react"
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
  Chip,
  Divider,
  Grid,
} from "@mui/material"
import { useIsMobile } from "../../../hooks/layout/useBreakpoint"
import { Trans, useTranslation } from "react-i18next"
import { useCreateTokenMutation } from "../api/tokensApi"
import { SCOPE_CATEGORIES, isAdminOnlyScope } from "../domain/scopes"
import { useGetUserProfileQuery } from "../../profile/api/profileApi"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { BottomSheet } from "../../../components/mobile/BottomSheet"
import { isSiteAdmin } from "../../../util/siteRole"

/** Catalog key for a scope's label: "market:read" -> "...labels.marketRead". */
const scopeLabelKey = (value: string) =>
  `apiTokensUi.scopes.labels.${value.replace(/:(\w)/g, (_, c: string) => c.toUpperCase())}`

interface CreateTokenDialogProps {
  open: boolean
  onClose: () => void
}

export function CreateTokenDialog({ open, onClose }: CreateTokenDialogProps) {
  const { t } = useTranslation()
  const [createToken, { isLoading }] = useCreateTokenMutation()
  const { data: profile } = useGetUserProfileQuery()
  const contractors = profile?.contractors || []
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

  const [showToken, setShowToken] = useState(false)
  const [createdToken, setCreatedToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

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
    try {
      setError(null)
      // Convert spectrum IDs to contractor IDs
      const contractorIds =
        formData.contractor_spectrum_ids.length > 0
          ? contractors
              ?.filter((c) =>
                formData.contractor_spectrum_ids.includes(c.spectrum_id),
              )
              .map((c) => c.spectrum_id)
          : undefined

      const result = await createToken({
        name: formData.name,
        description: formData.description || undefined,
        scopes: formData.scopes,
        contractor_spectrum_ids: contractorIds,
        expires_at: formData.expires_at || undefined,
      }).unwrap()

      setCreatedToken(result.token)
      setShowToken(true)
    } catch (err) {
      const error = err as { data?: { error?: { message?: string } | string } }
      const errorMsg =
        typeof error.data?.error === "string"
          ? error.data.error
          : error.data?.error?.message
      setError(errorMsg || t("apiTokensUi.create.error"))
    }
  }

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      scopes: [],
      contractor_spectrum_ids: [],
      expires_at: "",
    })
    setShowToken(false)
    setCreatedToken(null)
    setError(null)
    setCopied(false)
    onClose()
  }

  const copyToken = () => {
    if (createdToken) {
      navigator.clipboard.writeText(createdToken)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const isFormValid = formData.name.trim() && formData.scopes.length > 0
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useIsMobile()

  // Content to reuse
  const dialogContent = (
    <>
      {showToken ? (
        <Box>
          <Alert severity="success" sx={{ mb: 2 }}>
            {t("apiTokensUi.create.successAlert")}
          </Alert>

          <TextField
            fullWidth
            label={t("apiTokensUi.create.tokenLabel")}
            value={createdToken}
            multiline
            rows={3}
            InputProps={{
              readOnly: true,
              style: { fontFamily: "monospace" },
            }}
            sx={{ mb: 2 }}
          />

          <Button
            variant="outlined"
            onClick={copyToken}
            sx={{ mb: 2 }}
            color={copied ? "success" : "primary"}
          >
            {copied
              ? t("apiTokensUi.create.copied")
              : t("apiTokensUi.create.copyToken")}
          </Button>

          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              <Trans
                i18nKey="apiTokensUi.create.howToAuth"
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
              Authorization: Bearer {createdToken?.slice(0, 12)}...
            </Box>
          </Alert>

          <Alert severity="warning">
            <Typography variant="body2">
              <Trans
                i18nKey="apiTokensUi.create.important"
                components={{ strong: <strong /> }}
              />
            </Typography>
          </Alert>
        </Box>
      ) : (
        <Box>
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

              {Object.entries(SCOPE_CATEGORIES).map(
                ([category, { scopes }]) => {
                  // Filter scopes based on availability
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
                          (category === "admin" ||
                            category === "moderation") && (
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
                },
              )}
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {t("apiTokensUi.form.orgAccessTitle")}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t("apiTokensUi.create.orgAccessHelp")}
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
                  setFormData((prev) => ({
                    ...prev,
                    expires_at: e.target.value,
                  }))
                }
                InputLabelProps={{
                  shrink: true,
                }}
                helperText={t("apiTokensUi.form.expirationHelp")}
              />
            </Grid>
          </Grid>
        </Box>
      )}
    </>
  )

  const dialogActions = (
    <>
      <Button onClick={handleClose}>
        {showToken ? t("apiTokensUi.close") : t("common.cancel")}
      </Button>
      {!showToken && (
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!isFormValid || isLoading}
        >
          {isLoading
            ? t("apiTokensUi.create.creating")
            : t("apiTokensUi.create.submit")}
        </Button>
      )}
    </>
  )

  // On mobile, use BottomSheet
  if (isMobile) {
    return (
      <BottomSheet
        open={open}
        onClose={handleClose}
        title={
          showToken
            ? t("apiTokensUi.create.titleCreated")
            : t("apiTokensUi.create.title")
        }
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
      <DialogTitle>
        {showToken
          ? t("apiTokensUi.create.titleCreated")
          : t("apiTokensUi.create.title")}
      </DialogTitle>
      <DialogContent>{dialogContent}</DialogContent>
      <DialogActions>{dialogActions}</DialogActions>
    </Dialog>
  )
}
