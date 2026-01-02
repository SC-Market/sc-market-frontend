import React, { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Alert,
  Chip,
  Divider,
  Grid,
  useMediaQuery,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import {
  useCreateTokenMutation,
  useGetContractorsForTokensQuery,
} from "../../store/tokens"
import { useGetUserProfileQuery } from "../../store/profile.ts"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { BottomSheet } from "../../components/mobile/BottomSheet"

interface CreateTokenDialogProps {
  open: boolean
  onClose: () => void
}

const SCOPE_CATEGORIES = {
  profile: {
    label: "Profile",
    scopes: [
      { value: "profile:read", label: "Read Profile" },
      { value: "profile:write", label: "Write Profile" },
    ],
  },
  market: {
    label: "Market",
    scopes: [
      { value: "market:read", label: "Read Market" },
      { value: "market:write", label: "Write Market" },
      { value: "market:purchase", label: "Purchase Items" },
      { value: "market:photos", label: "Manage Photos" },
    ],
  },
  orders: {
    label: "Orders",
    scopes: [
      { value: "orders:read", label: "Read Orders" },
      { value: "orders:write", label: "Write Orders" },
      { value: "orders:reviews", label: "Write Reviews" },
    ],
  },
  contractors: {
    label: "Contractors",
    scopes: [
      { value: "contractors:read", label: "Read Contractors" },
      { value: "contractors:write", label: "Write Contractors" },
      { value: "contractors:members", label: "Manage Members" },
      { value: "contractors:webhooks", label: "Manage Webhooks" },
      { value: "contractors:blocklist", label: "Manage Blocklist" },
    ],
  },
  services: {
    label: "Services",
    scopes: [
      { value: "services:read", label: "Read Services" },
      { value: "services:write", label: "Write Services" },
      { value: "services:photos", label: "Manage Photos" },
    ],
  },
  offers: {
    label: "Offers",
    scopes: [
      { value: "offers:read", label: "Read Offers" },
      { value: "offers:write", label: "Write Offers" },
    ],
  },
  chats: {
    label: "Chats",
    scopes: [
      { value: "chats:read", label: "Read Chats" },
      { value: "chats:write", label: "Write Chats" },
    ],
  },
  notifications: {
    label: "Notifications",
    scopes: [
      { value: "notifications:read", label: "Read Notifications" },
      { value: "notifications:write", label: "Write Notifications" },
    ],
  },
  moderation: {
    label: "Moderation",
    scopes: [
      { value: "moderation:read", label: "Read Reports" },
      { value: "moderation:write", label: "Submit Reports" },
    ],
  },
  admin: {
    label: "Admin",
    scopes: [
      { value: "admin:read", label: "Read Admin Data" },
      { value: "admin:write", label: "Write Admin Data" },
      { value: "admin:spectrum", label: "Spectrum Migration" },
      { value: "admin:stats", label: "View Statistics" },
      { value: "admin", label: "Full Admin Access" },
    ],
  },
  special: {
    label: "Special",
    scopes: [
      { value: "readonly", label: "Read Only (All Read Scopes)" },
      { value: "full", label: "Full Access (All Scopes)" },
    ],
  },
}

export function CreateTokenDialog({ open, onClose }: CreateTokenDialogProps) {
  const { t } = useTranslation()
  const [createToken, { isLoading }] = useCreateTokenMutation()
  const { data: profile } = useGetUserProfileQuery()
  const contractors = profile?.contractors || []
  const isAdmin = profile?.role === "admin"

  // Filter scopes based on user role - admins can see all, non-admins can't see admin/moderation scopes
  const allScopes = Object.values(SCOPE_CATEGORIES).flatMap((cat) =>
    cat.scopes.map((s) => s.value),
  )
  const availableScopes: string[] = isAdmin
    ? allScopes
    : allScopes.filter(
        (scope) =>
          !scope.startsWith("admin:") &&
          scope !== "admin" &&
          scope !== "moderation:read" &&
          scope !== "moderation:write",
      )

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
      console.log("CreateTokenDialog - Creating token:", formData)
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

      console.log("CreateTokenDialog - Token created successfully:", result)
      setCreatedToken(result.token)
      setShowToken(true)
    } catch (err: any) {
      console.error("CreateTokenDialog - Failed to create token:", err)
      setError(err.data?.error || "Failed to create token")
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
    onClose()
  }

  const copyToken = () => {
    if (createdToken) {
      navigator.clipboard.writeText(createdToken)
    }
  }

  const isFormValid = formData.name.trim() && formData.scopes.length > 0
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  // Content to reuse
  const dialogContent = (
    <>
        {showToken ? (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              Your API token has been created successfully. Make sure to copy it
              now as it won&#39;t be shown again.
            </Alert>

            <TextField
              fullWidth
              label="API Token"
              value={createdToken}
              multiline
              rows={3}
              InputProps={{
                readOnly: true,
                style: { fontFamily: "monospace" },
              }}
              sx={{ mb: 2 }}
            />

            <Button variant="outlined" onClick={copyToken} sx={{ mb: 2 }}>
              Copy Token
            </Button>

            <Alert severity="warning">
              <Typography variant="body2">
                <strong>Important:</strong> Store this token securely. It
                provides access to your account with the permissions you&#39;ve
                granted. If you lose this token, you&#39;ll need to create a new
                one.
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
                  label="Token Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  helperText="A descriptive name for this token"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description (Optional)"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  multiline
                  rows={2}
                  helperText="Optional description of what this token will be used for"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Permissions (Scopes)
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Select the permissions this token should have. Be conservative
                  and only grant what&#39;s necessary.
                </Typography>

                {Object.entries(SCOPE_CATEGORIES).map(
                  ([category, { label, scopes }]) => {
                    // Filter scopes based on availability
                    const filteredScopes = scopes.filter((scope) =>
                      availableScopes.includes(scope.value),
                    )

                    // Don't render category if no scopes are available
                    if (filteredScopes.length === 0) return null

                    return (
                      <Box key={category} sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          {label}
                          {!isAdmin &&
                            (category === "admin" ||
                              category === "moderation") && (
                              <Chip
                                label="Admin Only"
                                size="small"
                                color="warning"
                                sx={{ ml: 1 }}
                              />
                            )}
                        </Typography>
                        <FormGroup>
                          {filteredScopes.map(
                            ({ value, label: scopeLabel }) => (
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
                                label={scopeLabel}
                              />
                            ),
                          )}
                        </FormGroup>
                        <Divider sx={{ mt: 1 }} />
                      </Box>
                    )
                  },
                )}
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Contractor Access
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Restrict this token to specific contractors. Leave empty for
                  access to all contractors.
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
                    No contractors available
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Expiration Date (Optional)"
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
                  helperText="Leave empty for no expiration. Time is interpreted as UTC."
                />
              </Grid>
            </Grid>
          </Box>
        )}
    </>
  )

  const dialogActions = (
    <>
      <Button onClick={handleClose}>{showToken ? "Close" : "Cancel"}</Button>
      {!showToken && (
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? "Creating..." : "Create Token"}
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
        title={showToken ? "Token Created Successfully" : "Create API Token"}
        maxHeight="90vh"
      >
        {dialogContent}
        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}>
          {dialogActions}
        </Box>
      </BottomSheet>
    )
  }

  // On desktop, use Dialog
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {showToken ? "Token Created Successfully" : "Create API Token"}
      </DialogTitle>
      <DialogContent>{dialogContent}</DialogContent>
      <DialogActions>{dialogActions}</DialogActions>
    </Dialog>
  )
}
