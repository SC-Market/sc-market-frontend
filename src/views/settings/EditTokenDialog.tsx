import React, { useState, useEffect } from "react"
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
} from "@mui/material"
import { useTranslation } from "react-i18next"
import {
  useUpdateTokenMutation,
  ApiToken,
  useGetContractorsForTokensQuery,
} from "../../store/tokens"
import { useGetUserProfileQuery } from "../../store/profile.ts"

interface EditTokenDialogProps {
  open: boolean
  onClose: () => void
  token: ApiToken | null
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
  special: {
    label: "Special",
    scopes: [
      { value: "readonly", label: "Read Only (All Read Scopes)" },
      { value: "full", label: "Full Access (All Scopes)" },
    ],
  },
}

export function EditTokenDialog({
  open,
  onClose,
  token,
}: EditTokenDialogProps) {
  const { t } = useTranslation()
  const [updateToken, { isLoading }] = useUpdateTokenMutation()
  const { data: profile } = useGetUserProfileQuery()
  const contractors = profile?.contractors || []

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

      setFormData({
        name: token.name,
        description: token.description || "",
        scopes: token.scopes,
        contractor_spectrum_ids: contractorSpectrumIds,
        expires_at: token.expires_at
          ? new Date(token.expires_at).toISOString().slice(0, 16)
          : "",
      })
    }
  }, [token, contractors])

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

    try {
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

      await updateToken({
        tokenId: token.id,
        body: {
          name: formData.name,
          description: formData.description || undefined,
          scopes: formData.scopes,
          contractor_spectrum_ids: contractorIds,
          expires_at: formData.expires_at || undefined,
        },
      }).unwrap()

      onClose()
    } catch (err: any) {
      setError(err.data?.error || "Failed to update token")
    }
  }

  const handleClose = () => {
    setError(null)
    onClose()
  }

  const isFormValid = formData.name.trim() && formData.scopes.length > 0

  if (!token) return null

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit API Token</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
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
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select the permissions this token should have. Be conservative and
              only grant what&#39;s necessary.
            </Typography>

            {Object.entries(SCOPE_CATEGORIES).map(
              ([category, { label, scopes }]) => (
                <Box key={category} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {label}
                  </Typography>
                  <FormGroup>
                    {scopes.map(({ value, label: scopeLabel }) => (
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
                    ))}
                  </FormGroup>
                  <Divider sx={{ mt: 1 }} />
                </Box>
              ),
            )}
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Contractor Access
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
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
                setFormData((prev) => ({ ...prev, expires_at: e.target.value }))
              }
              InputLabelProps={{
                shrink: true,
              }}
              helperText="Leave empty for no expiration. Time is interpreted as UTC."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? "Updating..." : "Update Token"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
