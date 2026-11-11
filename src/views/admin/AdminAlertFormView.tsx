import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material"
import { MarkdownEditor } from "../../components/markdown/Markdown.lazy"
import { ConfirmDialog } from "../../components/dialog/ConfirmDialog"
import { AlertChannelsField } from "../../features/admin/components/AlertChannelsField"
import { useAdminAlertForm } from "../../features/admin/hooks/useAdminAlertForm"
import type { AdminAlert } from "../../store/api/v2/market"
import { ADMIN_PATHS } from "../../routes/paths"

/**
 * Admin › Alerts › New (no `alert`) or Edit: the alert form as a page.
 * Creating sends the alert; editing never re-sends it.
 */
export function AdminAlertFormView({ alert }: { alert?: AdminAlert }) {
  const { t } = useTranslation()
  const form = useAdminAlertForm(alert)
  const {
    isEdit,
    formData,
    setFormData,
    channels,
    setChannels,
    confirmEmailOpen,
    setConfirmEmailOpen,
    linkError,
    handleLinkChange,
    contractorError,
    contractorSearchQuery,
    setContractorSearchQuery,
    selectedContractor,
    contractorOptions,
    isSearchingContractors,
    handleContractorChange,
    handleTargetTypeChange,
    isSaving,
    canSubmit,
    handleSubmit,
  } = form

  return (
    <Paper sx={{ p: { xs: 2, md: 3 } }}>
      <Box
        component="form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          if (canSubmit) handleSubmit()
        }}
      >
        <TextField
          fullWidth
          required
          label={t("admin.alerts.field.title", "Title")}
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          sx={{ mb: 2 }}
          inputProps={{ maxLength: 200 }}
        />
        <TextField
          fullWidth
          label={t("admin.alerts.field.linkOptional", "Link (Optional)")}
          placeholder={t("admin.alerts.linkPlaceholder", "https://example.com")}
          value={formData.link || ""}
          onChange={(e) => handleLinkChange(e.target.value)}
          error={!!linkError}
          helperText={linkError}
          sx={{ mb: 2 }}
          type="url"
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="admin-alert-form-target-type-label">
            {t("admin.alerts.targetType", "Target Type")}
          </InputLabel>
          <Select
            labelId="admin-alert-form-target-type-label"
            value={formData.target_type}
            label={t("admin.alerts.targetType", "Target Type")}
            onChange={(e) => handleTargetTypeChange(e.target.value)}
          >
            <MenuItem value="all_users">
              {t("adminUi.alerts.targetTypes.allUsers")}
            </MenuItem>
            <MenuItem value="org_members">
              {t("adminUi.alerts.targetTypes.orgMembers")}
            </MenuItem>
            <MenuItem value="org_owners">
              {t("adminUi.alerts.targetTypes.orgOwners")}
            </MenuItem>
            <MenuItem value="admins_only">
              {t("adminUi.alerts.targetTypes.adminsOnly")}
            </MenuItem>
            <MenuItem value="specific_org">
              {t("adminUi.alerts.targetTypes.specificOrg")}
            </MenuItem>
          </Select>
        </FormControl>
        {formData.target_type === "specific_org" && (
          <Autocomplete
            fullWidth
            options={contractorOptions}
            getOptionLabel={(option) => option.name}
            value={selectedContractor}
            onChange={(_event, newValue) => handleContractorChange(newValue)}
            inputValue={contractorSearchQuery}
            onInputChange={(_event, newInputValue) => {
              setContractorSearchQuery(newInputValue)
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("admin.alerts.selectContractor", "Select Contractor")}
                error={!!contractorError}
                helperText={
                  contractorError ||
                  (isEdit && formData.target_spectrum_id && !selectedContractor
                    ? formData.target_spectrum_id
                    : undefined)
                }
                placeholder={t(
                  "admin.alerts.contractorPlaceholder",
                  "Search orgs",
                )}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {option.avatar && (
                    <Box
                      component="img"
                      src={option.avatar}
                      alt={option.name}
                      sx={{ width: 24, height: 24, borderRadius: "50%" }}
                    />
                  )}
                  <Box>
                    <Typography variant="body2">{option.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.spectrum_id}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
            sx={{ mb: 2 }}
            noOptionsText={t(
              "admin.alerts.noContractorsFound",
              "No contractors found",
            )}
            loading={isSearchingContractors}
            loadingText={t("admin.alerts.searching", "Searching...")}
          />
        )}
        {isEdit ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t(
              "admin.alerts.editNoResend",
              "Saving changes doesn't send the alert again.",
            )}
          </Typography>
        ) : (
          <AlertChannelsField
            channels={channels}
            onChange={setChannels}
            targetType={formData.target_type}
            targetSpectrumId={formData.target_spectrum_id}
          />
        )}
        <MarkdownEditor
          value={formData.content}
          onChange={(value: string) =>
            setFormData({ ...formData, content: value })
          }
          TextFieldProps={{
            label: t("admin.alerts.content", "Content"),
            placeholder: t(
              "admin.alerts.contentPlaceholder",
              "Enter alert content in Markdown format...",
            ),
          }}
          variant="vertical"
        />
        {isEdit && (
          <FormControlLabel
            control={
              <Switch
                checked={formData.active}
                onChange={(e) =>
                  setFormData({ ...formData, active: e.target.checked })
                }
              />
            }
            label={t("admin.alerts.active", "Active")}
            sx={{ mt: 2 }}
          />
        )}
        <Stack direction="row" spacing={1} justifyContent="flex-end" mt={3}>
          <Button component={Link} to={ADMIN_PATHS.alerts} disabled={isSaving}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" variant="contained" disabled={!canSubmit}>
            {isEdit
              ? isSaving
                ? t("admin.alerts.updating", "Updating...")
                : t("admin.alerts.update", "Update")
              : isSaving
                ? t("admin.alerts.creating", "Creating...")
                : t("admin.alerts.create", "Create")}
          </Button>
        </Stack>
      </Box>

      {/* Emailing every user: confirm first. */}
      <ConfirmDialog
        open={confirmEmailOpen}
        onClose={() => setConfirmEmailOpen(false)}
        title={t("admin.alerts.confirmEmail.title", "Email every user?")}
        message={t(
          "admin.alerts.confirmEmail.body",
          "This alert will be emailed to every user with a verified address who hasn't turned announcement emails off.",
        )}
        cancelLabel={t("admin.alerts.confirmEmail.cancel", "Go back")}
        confirmLabel={t("admin.alerts.confirmEmail.confirm", "Send the email")}
        confirmColor="warning"
        loading={isSaving}
        onConfirm={() => handleSubmit(true)}
      />
    </Paper>
  )
}
