import { useTranslation } from "react-i18next"
import {
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Box,
  Autocomplete,
} from "@mui/material"
import { ResponsiveDialog } from "../../components/dialog/ResponsiveDialog"
import { MarkdownEditor } from "../../components/markdown/Markdown.lazy"
import type { AdminAlertsState } from "../../features/admin/hooks/useAdminAlerts"
import { AlertChannelsField } from "../../features/admin/components/AlertChannelsField"

/** Create dialog for a new alert. */
export function CreateAlertDialog({ alerts }: { alerts: AdminAlertsState }) {
  const { t } = useTranslation()
  const {
    isCreateModalOpen,
    handleCloseModals,
    formData,
    setFormData,
    channels,
    setChannels,
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
    isCreating,
    handleCreateAlert,
  } = alerts
  return (
    <ResponsiveDialog
      open={isCreateModalOpen}
      onClose={handleCloseModals}
      maxWidth="md"
      mobile="fullScreen"
      title={t("admin.alerts.createAlert", "Create Alert")}
      disableClose={isCreating}
      disableBackdropClose
      actions={
        <>
          <Button onClick={handleCloseModals} disabled={isCreating}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={() => handleCreateAlert()}
            variant="contained"
            disabled={
              isCreating ||
              !formData.title ||
              !formData.content ||
              !!linkError ||
              !!contractorError
            }
          >
            {isCreating
              ? t("admin.alerts.creating", "Creating...")
              : t("admin.alerts.create", "Create")}
          </Button>
        </>
      }
    >
      <Box sx={{ mt: 2 }}>
        <TextField
          fullWidth
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
          <InputLabel id="admin-alerts-view-target-type-2-label">
            {t("admin.alerts.targetType", "Target Type")}
          </InputLabel>
          <Select
            labelId="admin-alerts-view-target-type-2-label"
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
            onChange={(event, newValue) => handleContractorChange(newValue)}
            inputValue={contractorSearchQuery}
            onInputChange={(event, newInputValue) => {
              setContractorSearchQuery(newInputValue)
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("admin.alerts.selectContractor", "Select Contractor")}
                error={!!contractorError}
                helperText={contractorError}
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
        <AlertChannelsField
          channels={channels}
          onChange={setChannels}
          targetType={formData.target_type}
          targetSpectrumId={formData.target_spectrum_id}
        />
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
      </Box>
    </ResponsiveDialog>
  )
}
